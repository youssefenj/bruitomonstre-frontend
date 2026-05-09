'use client'
import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import socket from '../../lib/socket'
import { addEleve } from '../../lib/api'
import { Button } from '../ui/button'
import { Input } from '../ui/input'

// Duree d'enregistrement = 10 secondes (réduit pour hébergement gratuit)
// Sur Render free tier (0.1 CPU), 30s = ~14 segments = ~2min de traitement.
// 10s = ~3-4 segments = ~20-30s de traitement, compatible avec le timeout 60s.
const DUREE = 10000

export default function InscriptionModal({ user, onClose, onSuccess }) {
  const [prenom,   setPrenom]   = useState('')
  const [nom,      setNom]      = useState('')
  const [etape,    setEtape]    = useState('formulaire')
  const [compte,   setCompte]   = useState(3)
  const [progress, setProgress] = useState(0)
  const [errMsg,   setErrMsg]   = useState('')

  const audioCtxRef = useRef(null)
  const workletRef  = useRef(null)
  const streamRef   = useRef(null)
  const bufferRef   = useRef([])
  const ivRef       = useRef(null)
  const eleveIdRef  = useRef(null)
  const submittingRef = useRef(false)

  // Connecte le socket à l'ouverture du modal (nécessaire pour inscription_result)
  useEffect(() => {
    if (!socket.connected) socket.connect()
    return () => {
      // Ne déconnecte pas — d'autres composants peuvent l'utiliser
    }
  }, [])

  const handleSuivant = async () => {
    if (!prenom.trim() || !nom.trim()) return
    setErrMsg('')
    try {
      const res = await addEleve({ prenom: prenom.trim(), nom: nom.trim(), classe: user.classe })
      eleveIdRef.current = res.data.id
      setEtape('compte')
      let c = 3
      const iv = setInterval(() => {
        c--; setCompte(c)
        if (c === 0) { clearInterval(iv); lancerEnregistrement() }
      }, 1000)
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Erreur réseau'
      setErrMsg(`Impossible de créer l'élève : ${msg}`)
      setEtape('erreur')
    }
  }

  const lancerEnregistrement = useCallback(async () => {
    setEtape('enregistrement')
    bufferRef.current = []
    try {
      // Vérifie que le micro est accessible
      // IMPORTANT : memes options que la surveillance pour que l'empreinte
      // vocale soit comparable au signal capture en temps reel.
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate:       16000,
          channelCount:     1,
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl:  false,
        }
      })
      streamRef.current = stream

      const ctx = new AudioContext({ sampleRate: 16000 })
      audioCtxRef.current = ctx
      await ctx.resume()

      await ctx.audioWorklet.addModule('/workers/audio-processor.worklet.js')
      const src  = ctx.createMediaStreamSource(stream)
      const node = new AudioWorkletNode(ctx, 'audio-processor')
      const silentGain = ctx.createGain()
      silentGain.gain.value = 0
      workletRef.current = node

      node.port.onmessage = (e) => bufferRef.current.push(...e.data.audioData)
      src.connect(node)
      node.connect(silentGain)
      silentGain.connect(ctx.destination)

      // Barre de progression 10 secondes
      const debut = Date.now()
      ivRef.current = setInterval(() => {
        const pct = Math.min(100, ((Date.now() - debut) / DUREE) * 100)
        setProgress(pct)
        if (pct >= 100) { clearInterval(ivRef.current); arreterEtSoumettre() }
      }, 100)

    } catch (err) {
      const msg = err.name === 'NotAllowedError'
        ? 'Microphone refusé — autorise l\'accès dans le navigateur'
        : err.name === 'NotFoundError'
        ? 'Aucun microphone détecté'
        : `Erreur audio : ${err.message}`
      setErrMsg(msg)
      setEtape('erreur')
    }
  }, [prenom, user.classe])

  const stopAudioCapture = () => {
    clearInterval(ivRef.current)
    ivRef.current = null

    workletRef.current?.disconnect()
    workletRef.current = null

    const ctx = audioCtxRef.current
    audioCtxRef.current = null
    if (ctx && ctx.state !== 'closed') {
      ctx.close().catch(() => {})
    }

    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
  }

  const arreterEtSoumettre = () => {
    if (submittingRef.current) return
    submittingRef.current = true
    stopAudioCapture()

    if (bufferRef.current.length === 0) {
      submittingRef.current = false
      setErrMsg('Aucun audio enregistré')
      setEtape('erreur')
      return
    }

    // S'assure que le socket est connecté avant d'émettre
    if (!socket.connected) {
      socket.connect()
      socket.once('connect', () => envoyerVoix())
    } else {
      envoyerVoix()
    }
  }

  const envoyerVoix = () => {
    // On installe d'abord l'écouteur pour ne pas rater une réponse rapide du serveur
    const timeout = setTimeout(() => {
      submittingRef.current = false
      setErrMsg('Timeout — pas de réponse du serveur')
      setEtape('erreur')
    }, 60000)

    const onDisconnect = (reason) => {
      clearTimeout(timeout)
      submittingRef.current = false
      setErrMsg(`Socket déconnecté pendant l'envoi (${reason}). Buffer audio probablement trop gros.`)
      setEtape('erreur')
    }
    socket.once('disconnect', onDisconnect)

    socket.once('inscription_result', ({ ok, msg }) => {
      clearTimeout(timeout)
      socket.off('disconnect', onDisconnect)
      submittingRef.current = false
      if (ok) {
        setEtape('ok')
        setTimeout(() => { onSuccess(); onClose() }, 1800)
      } else {
        setErrMsg(msg || 'Erreur génération empreinte vocale')
        setEtape('erreur')
      }
    })

    // Envoie en Float32Array (binaire) — ~640 Ko au lieu de ~2 Mo en JSON.
    // Socket.IO gère nativement les ArrayBuffer.
    const f32 = new Float32Array(bufferRef.current)
    socket.emit('enregistrement_voix', {
      signal:   f32.buffer,
      prenom:   prenom.trim(),
      eleve_id: eleveIdRef.current,
      classe:   user.classe,
    })
  }

  const reset = () => {
    submittingRef.current = false
    setEtape('formulaire')
    setPrenom(''); setNom('')
    setProgress(0); setErrMsg('')
    setCompte(3)
    stopAudioCapture()
  }

  const STEPS = {
    formulaire: (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <Input label="Prénom *" value={prenom} onChange={e => setPrenom(e.target.value)} autoFocus placeholder="Lucas" />
        <Input label="Nom *" value={nom} onChange={e => setNom(e.target.value)} placeholder="Dupont" />
        <Button variant="primary" size="lg" className="w-full mt-2"
          disabled={!prenom.trim() || !nom.trim()} onClick={handleSuivant}>
          Suivant → Enregistrer la voix
        </Button>
      </motion.div>
    ),

    compte: (
      <motion.div className="text-center py-8" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
        <p className="mb-6 text-sm" style={{ color: '#6B6357' }}>Prépare-toi à parler dans…</p>
        <motion.p key={compte}
          initial={{ scale: 1.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="text-8xl font-bold text-gradient">
          {compte}
        </motion.p>
        <p className="text-sm mt-4" style={{ color: '#6B6357' }}>🎤 Parle clairement dans le micro</p>
      </motion.div>
    ),

    enregistrement: (
      <motion.div className="text-center py-6 space-y-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <motion.div className="text-5xl"
          animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 0.5, repeat: Infinity }}>
          🎙️
        </motion.div>
        <div>
          <p className="font-bold text-lg" style={{ color: '#C0392B' }}>PARLE maintenant !</p>
          <p className="text-sm mt-1" style={{ color: '#6B6357' }}>
            Lis un texte à voix haute pendant 10 secondes, {prenom}
          </p>
          <p className="text-xs mt-1" style={{ color: '#6B6357' }}>
            (Parle clairement, sans pauses trop longues)
          </p>
        </div>
        <div className="relative h-3 rounded-full overflow-hidden" style={{ background: '#EDE8DF' }}>
          <motion.div className="absolute inset-y-0 left-0 rounded-full"
            animate={{ width: `${progress}%` }} transition={{ duration: 0.1 }}
            style={{ background: 'linear-gradient(90deg, #2D6A4F, #52B788, #C8A96E)' }} />
        </div>
        <p className="text-xs font-mono" style={{ color: '#6B6357' }}>
          {Math.round(progress)}% — {Math.max(0, Math.ceil(((100 - progress) / 100) * (DUREE / 1000)))}s restantes
        </p>
      </motion.div>
    ),

    ok: (
      <motion.div className="text-center py-10" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <motion.div className="text-6xl mb-4" animate={{ rotate: [0, 10, -10, 0] }}>✅</motion.div>
        <p className="font-bold text-lg" style={{ color: '#27AE60' }}>{prenom} inscrit(e) avec succès !</p>
        <p className="text-sm mt-1" style={{ color: '#6B6357' }}>Fermeture automatique…</p>
      </motion.div>
    ),

    erreur: (
      <motion.div className="text-center py-8 space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="text-5xl">❌</div>
        <p className="font-bold" style={{ color: '#C0392B' }}>Une erreur est survenue</p>
        {errMsg && (
          <p className="text-xs px-4 py-2 rounded-lg" style={{ background: 'rgba(192,57,43,0.08)', color: '#6B6357' }}>
            {errMsg}
          </p>
        )}
        <Button variant="ghost" onClick={reset}>↩ Réessayer</Button>
      </motion.div>
    ),
  }

  const stepIdx = ['formulaire','compte','enregistrement','ok'].indexOf(etape)

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: 'rgba(10,26,18,0.75)', backdropFilter: 'blur(8px)' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className="relative w-full max-w-md mx-4 rounded-2xl p-1"
        style={{ background: 'linear-gradient(135deg, rgba(45,106,79,0.5), rgba(82,183,136,0.35), rgba(200,169,110,0.3))' }}
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', bounce: 0.25 }}
      >
        <div className="rounded-2xl p-6" style={{ background: '#FAF7F2' }}>
          {/* Accent band */}
          <div className="absolute top-1 left-8 right-8 h-0.5 rounded-b-full"
            style={{ background: 'linear-gradient(90deg, #2D6A4F, #52B788, #C8A96E)' }} />

          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-bold" style={{ color: '#1A3D2B' }}>Inscrire un élève</h2>
              <p className="text-xs mt-0.5" style={{ color: '#6B6357' }}>Classe {user.classe}</p>
            </div>
            <button onClick={onClose}
              className="text-xl w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
              style={{ color: '#6B6357' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(45,106,79,0.1)'; e.currentTarget.style.color = '#2D6A4F' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6B6357' }}
            >✕</button>
          </div>

          {/* Progress steps */}
          <div className="flex gap-1.5 mb-6">
            {['formulaire','compte','enregistrement','ok'].map((s, i) => (
              <div key={s} className="flex-1 h-1 rounded-full transition-all duration-300"
                style={{
                  background: stepIdx >= i
                    ? 'linear-gradient(90deg, #2D6A4F, #52B788)'
                    : '#EDE8DF'
                }} />
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={etape}
              initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
              {STEPS[etape]}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )
}
