'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import socket from '../../lib/socket'
import DbMeter from './DbMeter'
import Monster from './Monster'
import { Button } from '../ui/button'
import { Card, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { getStatusColor } from '../../lib/utils'

const SEUIL_ALERTE_COOLDOWN = 3000

// Banniere flash quand un eleve est identifie
function AlerteBanniere({ prenom, statut, visible }) {
  if (!visible || !prenom || prenom === 'Inconnu') return null
  const isCritical = statut === 'critical'
  return (
    <motion.div
      initial={{ opacity: 0, y: -60 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -60 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      style={{
        position: 'fixed', top: 24, left: '50%', transform: 'translateX(-50%)',
        zIndex: 9999,
        background: isCritical
          ? 'linear-gradient(135deg,#7f1d1d,#C0392B)'
          : 'linear-gradient(135deg,#92400e,#D97706)',
        color: 'white', borderRadius: 18, padding: '14px 32px',
        boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'center', gap: 16, minWidth: 340,
        border: `1px solid ${isCritical ? 'rgba(248,113,113,0.4)' : 'rgba(251,191,36,0.4)'}`,
      }}
    >
      <span style={{ fontSize: 34 }}>{isCritical ? '🔴' : '🟠'}</span>
      <div>
        <p style={{ fontSize: 24, fontWeight: 900, letterSpacing: 1, margin: 0 }}>
          {prenom.toUpperCase()}
        </p>
        <p style={{ fontSize: 12, opacity: 0.85, margin: '3px 0 0' }}>
          {isCritical ? '⚠️ Bruit critique détecté !' : '⚡ Bruit excessif détecté !'}
        </p>
      </div>
    </motion.div>
  )
}

export default function SurveillancePanel({ user }) {
  const [actif,          setActif]          = useState(false)
  const [db,             setDb]             = useState(0)
  const [statut,         setStatut]         = useState('normal')
  const [score,          setScore]          = useState(100)
  const [stats,          setStats]          = useState(null)
  const [phrase,         setPhrase]         = useState('')
  const [etat,           setEtat]           = useState('dort')
  const [journal,        setJournal]        = useState([])
  const [socketOk,       setSocketOk]       = useState(false)
  const [chunksEnv,      setChunksEnv]      = useState(0)
  const [dernierPrenom,  setDernierPrenom]  = useState('')
  const [dernierStatut,  setDernierStatut]  = useState('normal')
  const [banniereVisible,setBanniereVisible]= useState(false)
  const lastAlerte    = useRef(0)
  const chunksRef     = useRef(0)
  // Anti-feedback : true tant que la synthese vocale parle, pour ignorer
  // les chunks audio captures pendant ce temps (sinon le monstre s'auto-alerte).
  const isSpeakingRef = useRef(false)
  // Mirror du state `actif` accessible depuis les callbacks socket (closures)
  // sinon les handlers utilisent la valeur figee a l'effet useEffect.
  const actifRef      = useRef(false)

  const statusColor = getStatusColor(statut)

  const computeDb = (samples) => {
    if (!samples || samples.length === 0) return 0
    let sum = 0
    for (let i = 0; i < samples.length; i++) {
      const v = samples[i]
      sum += v * v
    }
    const rms = Math.sqrt(sum / samples.length)
    return rms < 1e-9 ? 0 : Math.max(0, 20 * Math.log10(rms) + 90)
  }

  // Socket.IO
  useEffect(() => {
    if (!socket.connected) socket.connect()

    const onConnect = () => {
      setSocketOk(true)
      console.log('[WS] connecte')
      socket.emit('join_classe', { classe: user.classe })
    }
    const onDisconnect = () => {
      setSocketOk(false)
      console.log('[WS] deconnecte')
    }

    socket.on('connect',    onConnect)
    socket.on('disconnect', onDisconnect)
    if (socket.connected) { setSocketOk(true); socket.emit('join_classe', { classe: user.classe }) }

    socket.on('db_update', ({ db: niveau, statut: s }) => {
      // Ignore tout event tant que la surveillance n'est pas active.
      if (!actifRef.current) return
      setDb(niveau)
      setStatut(s)
    })

    socket.on('alerte_event', ({ prenom, db: niveau, statut: s, phrase: p, score: sc, stats: st }) => {
      // Ignore les alertes si l'utilisateur n'a pas demarre la surveillance
      // (peut arriver si une autre session est ouverte sur la meme classe).
      if (!actifRef.current) return
      const now = Date.now()
      setDb(niveau); setStatut(s); setScore(sc); setStats(st)
      setPhrase(p); setEtat('alerte')
      setDernierPrenom(prenom)
      setDernierStatut(s)
      setJournal(j => [{
        heure: new Date().toLocaleTimeString('fr-FR'),
        prenom, niveau, statut: s, phrase: p
      }, ...j].slice(0, 50))

      // Banniere flash si eleve identifie
      if (prenom && prenom !== 'Inconnu') {
        setBanniereVisible(true)
        setTimeout(() => setBanniereVisible(false), 4000)
      }

      if (now - lastAlerte.current > SEUIL_ALERTE_COOLDOWN) {
        lastAlerte.current = now
        const utt = new SpeechSynthesisUtterance(p)
        utt.lang = 'fr-FR'; utt.rate = 1.1
        // Mute les chunks audio pendant que le monstre parle :
        // sinon le micro capte sa propre voix et redeclenche une alerte.
        utt.onstart = () => { isSpeakingRef.current = true }
        utt.onend   = () => {
          // Petit delai apres la fin pour laisser l'echo se dissiper
          setTimeout(() => { isSpeakingRef.current = false }, 400)
        }
        utt.onerror = () => { isSpeakingRef.current = false }
        // Pre-active le flag immediatement, au cas ou onstart tarde
        isSpeakingRef.current = true
        speechSynthesis.speak(utt)
      }
      setTimeout(() => { setEtat('ecoute'); setPhrase('') }, 4000)
    })

    // Identification differee : arrive apres l'alerte (Resemblyzer ~1-2s)
    // On met a jour le nom et on met a jour les entrees recentes du journal
    // qui etaient encore "Inconnu".
    socket.on('speaker_update', ({ prenom, conf }) => {
      if (!actifRef.current) return
      if (!prenom || prenom === 'Inconnu') return
      setDernierPrenom(prenom)
      setBanniereVisible(true)
      setTimeout(() => setBanniereVisible(false), 4000)
      setJournal(j => j.map((entry, idx) => {
        // On retro-corrige les 3 dernieres entrees encore "Inconnu"
        if (idx < 3 && entry.prenom === 'Inconnu') {
          return { ...entry, prenom }
        }
        return entry
      }))
    })

    return () => {
      socket.off('connect',    onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('db_update')
      socket.off('alerte_event')
      socket.off('speaker_update')
    }
  }, [user.classe])

  // Audio Capture
  const audioCtxRef    = useRef(null)
  const workletNodeRef = useRef(null)
  const streamRef      = useRef(null)

  const demarrer = useCallback(async () => {
    try {
      // Desactive TOUS les traitements navigateur :
      // - echoCancellation : utile pour les visios mais filtre la parole eloignee
      // - noiseSuppression : coupe les voix qui ressemblent a du bruit
      // - autoGainControl  : compresse le signal -> faux silences sur le dB
      // C'est crucial pour la detection de bruit en classe.
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
      workletNodeRef.current = node

      node.port.onmessage = (e) => {
        const audioData = e.data.audioData
        if (!audioData || audioData.length === 0) return
        // ANTI-FEEDBACK : ignore les chunks pendant que le monstre parle
        // (sinon le micro capte sa propre voix robot et redeclenche une alerte).
        // On detecte aussi via speechSynthesis.speaking au cas ou onstart/onend
        // n'auraient pas tire correctement.
        if (isSpeakingRef.current || (typeof speechSynthesis !== 'undefined' && speechSynthesis.speaking)) {
          // On affiche quand meme un dB local proche de 0 pour montrer le mute
          setDb(0)
          setStatut('normal')
          return
        }
        const niveauLocal = computeDb(audioData)
        setDb(niveauLocal)
        setStatut(niveauLocal >= 60 ? 'critical' : niveauLocal >= 50 ? 'warning' : 'normal')
        if (!socket.connected) { socket.connect(); return }
        socket.emit('audio_chunk', {
          signal: Array.from(audioData),
          classe: user.classe,
        })
        chunksRef.current += 1
        setChunksEnv(chunksRef.current)
      }

      src.connect(node)
      node.connect(silentGain)
      silentGain.connect(ctx.destination)

      setActif(true)
      actifRef.current = true
      setEtat('ecoute')
      chunksRef.current = 0
      setChunksEnv(0)
      // Reset des stats locales pour repartir sur une session propre
      setScore(100)
      setStats(null)
      setJournal([])
      setDernierPrenom('')
      setBanniereVisible(false)

    } catch (err) {
      const msg =
        err.name === 'NotAllowedError' ? 'Microphone refuse - autorise-le dans le navigateur' :
        err.name === 'NotFoundError'   ? 'Aucun microphone detecte' :
        'Erreur micro : ' + err.message
      alert(msg)
    }
  }, [user.classe])

  const arreter = useCallback(() => {
    // Fige actifRef AVANT de couper l'audio pour bloquer immediatement
    // tout event socket en vol qui arriverait pendant la fermeture.
    actifRef.current = false
    workletNodeRef.current?.disconnect()
    audioCtxRef.current?.close().catch(() => {})
    streamRef.current?.getTracks().forEach(t => t.stop())
    workletNodeRef.current = null
    audioCtxRef.current    = null
    streamRef.current      = null
    // Coupe la synthese vocale en cours (sinon le monstre continue de parler)
    if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel()
    isSpeakingRef.current = false
    setActif(false); setEtat('dort'); setDb(0); setStatut('normal'); setPhrase('')
    setChunksEnv(0); chunksRef.current = 0
  }, [])

  const scoreColor = score >= 80 ? '#52B788' : score >= 60 ? '#E67E22' : '#E74C3C'

  return (
    <div className="flex gap-4 h-full p-4" style={{ background: '#0A1A12', minHeight: '600px' }}>

      {/* Banniere flash nom eleve */}
      <AnimatePresence>
        <AlerteBanniere prenom={dernierPrenom} statut={dernierStatut} visible={banniereVisible} />
      </AnimatePresence>

      {/* Colonne gauche */}
      <motion.div
        className="w-72 flex flex-col gap-4 flex-shrink-0"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Monster */}
        <Card className="flex flex-col items-center pt-6 pb-4 px-4 relative min-h-[290px]">
          <motion.div
            className="absolute inset-0 opacity-20 pointer-events-none"
            animate={{ background: 'radial-gradient(circle at 50% 40%, ' + statusColor.text + ', transparent 70%)' }}
            transition={{ duration: 0.8 }}
          />
          <Monster etat={etat} phrase={phrase} />

          <motion.div
            className="w-full text-center mt-3"
            animate={{ scale: etat === 'alerte' ? [1, 1.04, 1] : 1 }}
            transition={{ duration: 0.5, repeat: etat === 'alerte' ? Infinity : 0 }}
          >
            {statut === 'critical' ? (
              <Badge variant="danger">🔴 CRITIQUE</Badge>
            ) : statut === 'warning' ? (
              <Badge variant="warning">🟠 WARNING</Badge>
            ) : (
              <Badge variant="success">🟢 Normal</Badge>
            )}
          </motion.div>

          <AnimatePresence>
            {phrase && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.9 }}
                className="mt-3 w-full rounded-xl px-3 py-2 text-xs text-center italic"
                style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#FCA5A5' }}
              >
                &quot;{phrase}&quot;
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        {/* Score */}
        <Card>
          <CardTitle className="mb-3">Score Silence</CardTitle>
          <div className="flex items-end gap-2">
            <motion.p
              className="text-5xl font-bold"
              animate={{ color: scoreColor }}
              transition={{ duration: 0.5 }}
              style={{ color: scoreColor, fontVariantNumeric: 'tabular-nums' }}
            >
              {Math.round(score)}
            </motion.p>
            <span className="text-sm mb-1" style={{ color: 'rgba(82,183,136,0.5)' }}>/ 100</span>
          </div>
          <div className="mt-3 h-2 rounded-full overflow-hidden" style={{ background: '#112A1E' }}>
            <motion.div
              className="h-full rounded-full"
              animate={{ width: score + '%', background: scoreColor }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </Card>

        {/* Bouton demarrer / arreter */}
        {!actif ? (
          <Button variant="success" size="lg" className="w-full" onClick={demarrer} disabled={!socketOk}>
            {socketOk ? '▶ Demarrer surveillance' : '⏳ Connexion serveur...'}
          </Button>
        ) : (
          <Button variant="danger" size="lg" className="w-full" onClick={arreter}>
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="inline-block w-2 h-2 rounded-full bg-white mr-1"
            />
            Arreter
          </Button>
        )}

        {/* Indicateur connexion socket */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
          style={{ background: '#0F2318', border: '1px solid rgba(82,183,136,0.12)' }}>
          <span className={'w-2 h-2 rounded-full flex-shrink-0 ' + (socketOk ? 'bg-green-400' : 'bg-red-500')}
            style={socketOk ? { animation: 'pulse 2s infinite' } : {}} />
          <span style={{ color: socketOk ? '#86EFAC' : '#F87171' }}>
            {socketOk ? 'Serveur connecte' : 'Serveur deconnecte'}
          </span>
          {actif && chunksEnv > 0 && (
            <span className="ml-auto font-mono" style={{ color: '#6B7280' }}>{chunksEnv} chunks</span>
          )}
        </div>

        {/* Mini stats */}
        <AnimatePresence>
          {stats && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-2 gap-2"
            >
              {[
                ['🔔', 'Alertes',  stats.nb_alertes],
                ['🟠', 'Warning',  stats.nb_warning],
                ['🔴', 'Critique', stats.nb_critical],
                ['⏱',  'Duree',   stats.duree],
              ].map(([icon, label, val]) => (
                <div key={label} className="rounded-xl p-3 text-center"
                  style={{ background: '#112A1E', border: '1px solid rgba(82,183,136,0.18)' }}>
                  <p className="text-base mb-0.5">{icon}</p>
                  <p style={{ fontSize: 11, color: 'rgba(82,183,136,0.55)', marginBottom: 2 }}>{label}</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#D8F3DC' }}>{val}</p>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Colonne droite */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">

        {/* Banniere erreur serveur */}
        <AnimatePresence>
          {!socketOk && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-xl px-4 py-3 text-sm font-medium"
              style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#FCA5A5' }}
            >
              Serveur non connecte. Assure-toi que le backend tourne :{' '}
              <code className="text-xs font-mono opacity-80">uvicorn main:socket_app --reload --port 8000</code>
            </motion.div>
          )}
        </AnimatePresence>

        {/* dB Meter */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card>
            <CardTitle className="mb-4">
              Niveau sonore temps reel
              {actif && (
                <span className="ml-2 inline-flex items-center gap-1.5 text-xs font-normal text-success">
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                  En direct
                </span>
              )}
            </CardTitle>
            <DbMeter db={db} statut={statut} />
          </Card>
        </motion.div>

        {/* Dernier eleve identifie (ou identification en cours) */}
        <AnimatePresence>
          {dernierPrenom && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="rounded-2xl p-4 flex items-center gap-4"
              style={{
                background: dernierStatut === 'critical'
                  ? 'linear-gradient(135deg,rgba(120,20,20,0.85),rgba(80,10,10,0.85))'
                  : 'linear-gradient(135deg,rgba(26,61,43,0.92),rgba(45,106,79,0.85))',
                border: `1.5px solid ${dernierStatut === 'critical' ? 'rgba(231,76,60,0.6)' : 'rgba(82,183,136,0.5)'}`,
              }}
            >
              <span style={{ fontSize: 40 }}>
                {dernierPrenom === 'Inconnu' ? '🔍' : '🎙️'}
              </span>
              <div className="flex-1">
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 }}>
                  {dernierPrenom === 'Inconnu' ? 'Identification en cours…' : 'Dernier élève détecté'}
                </p>
                <p style={{
                  fontSize: 28, fontWeight: 900, margin: 0,
                  color: dernierPrenom === 'Inconnu'
                    ? 'rgba(255,255,255,0.4)'
                    : (dernierStatut === 'critical' ? '#F87171' : '#74C69D')
                }}>
                  {dernierPrenom === 'Inconnu' ? '… analyse de la voix' : dernierPrenom}
                </p>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>
                  {db.toFixed(1)} dB · {dernierStatut === 'critical' ? '🔴 CRITIQUE' : '🟠 WARNING'}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Journal */}
        <motion.div
          className="flex-1"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="h-full flex flex-col">
            <CardTitle className="mb-4 flex items-center justify-between">
              Journal des incidents
              <Badge variant="default">{journal.length} evenement{journal.length > 1 ? 's' : ''}</Badge>
            </CardTitle>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {journal.length === 0 && (
                <div className="flex flex-col items-center justify-center h-32" style={{ color: 'rgba(82,183,136,0.45)' }}>
                  <span className="text-3xl mb-2">🤫</span>
                  <p className="text-sm">Aucun incident pour l instant...</p>
                </div>
              )}
              <AnimatePresence initial={false}>
                {journal.map((e, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20, height: 0 }}
                    animate={{ opacity: 1, x: 0, height: 'auto' }}
                    exit={{ opacity: 0, x: -20, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-start gap-3 p-3 rounded-xl"
                    style={{
                      background: e.statut === 'critical' ? 'rgba(239,68,68,0.08)' : 'rgba(245,158,11,0.07)',
                      border: '1px solid ' + (e.statut === 'critical' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'),
                    }}
                  >
                    <span className="w-14 flex-shrink-0 pt-0.5" style={{ fontSize: 11, color: 'rgba(82,183,136,0.5)', fontFamily: 'monospace' }}>
                      {e.heure}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span style={{ fontSize: 14, fontWeight: 900, color: e.statut === 'critical' ? '#F87171' : '#E67E22' }}>
                          {e.prenom === 'Inconnu' ? '❓ Inconnu' : `🎙️ ${e.prenom}`}
                        </span>
                        <span style={{ fontSize: 11, color: 'rgba(82,183,136,0.55)' }}>{e.niveau?.toFixed(1)} dB</span>
                        <Badge variant={e.statut === 'critical' ? 'danger' : 'warning'}>
                          {e.statut === 'critical' ? 'CRITIQUE' : 'WARNING'}
                        </Badge>
                      </div>
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)', fontStyle: 'italic' }} className="truncate">&quot;{e.phrase}&quot;</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
