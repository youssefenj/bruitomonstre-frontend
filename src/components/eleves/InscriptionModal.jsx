import { useState, useRef, useCallback } from 'react'
import socket from '../../socket'
import { createEleve } from '../../api'

const DUREE_ENREGISTREMENT = 10000  // 10 secondes

export default function InscriptionModal({ user, onClose, onSuccess }) {
  const [prenom, setPrenom]     = useState('')
  const [nom, setNom]           = useState('')
  const [etape, setEtape]       = useState('formulaire')
  const [compte, setCompte]     = useState(3)
  const [progress, setProgress] = useState(0)
  const [eleveId, setEleveId]   = useState(null)

  const audioCtxRef  = useRef(null)
  const workletRef   = useRef(null)
  const streamRef    = useRef(null)
  const bufferRef    = useRef([])
  const intervalRef  = useRef(null)

  const handleSuivant = async () => {
    if (!prenom.trim() || !nom.trim()) return
    try {
      const res = await createEleve({ prenom: prenom.trim(), nom: nom.trim(), classe: user.classe })
      setEleveId(res.data.id)
      setEtape('compte')
      let c = 3
      const iv = setInterval(() => {
        c--
        setCompte(c)
        if (c === 0) { clearInterval(iv); lancerEnregistrement(res.data.id) }
      }, 1000)
    } catch {
      setEtape('erreur')
    }
  }

  const lancerEnregistrement = useCallback(async (id) => {
    setEtape('enregistrement')
    bufferRef.current = []
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { sampleRate: 16000, channelCount: 1 } })
      streamRef.current = stream
      const ctx = new AudioContext({ sampleRate: 16000 })
      audioCtxRef.current = ctx
      await ctx.audioWorklet.addModule('/workers/audio-processor.worklet.js')
      const src  = ctx.createMediaStreamSource(stream)
      const node = new AudioWorkletNode(ctx, 'audio-processor')
      workletRef.current = node
      node.port.onmessage = (e) => { bufferRef.current.push(...e.data.audioData) }
      src.connect(node)

      const debut = Date.now()
      intervalRef.current = setInterval(() => {
        const pct = Math.min(100, ((Date.now() - debut) / DUREE_ENREGISTREMENT) * 100)
        setProgress(pct)
        if (pct >= 100) { clearInterval(intervalRef.current); arreterEtSoumettre(id) }
      }, 100)
    } catch {
      setEtape('erreur')
    }
  }, [])

  const arreterEtSoumettre = (id) => {
    workletRef.current?.disconnect()
    audioCtxRef.current?.close()
    streamRef.current?.getTracks().forEach(t => t.stop())
    socket.emit('enregistrement_voix', {
      signal: bufferRef.current, prenom: prenom.trim(), eleve_id: id, classe: user.classe,
    })
    socket.once('inscription_result', ({ ok }) => {
      setEtape(ok ? 'ok' : 'erreur')
      if (ok) setTimeout(() => { onSuccess(); onClose() }, 1500)
    })
  }

  const inputStyle = {
    width: '100%', padding: '12px 16px', borderRadius: 12,
    border: '1.5px solid #D6CEBE', background: '#FFFFFF',
    color: '#2D2A24', fontSize: 14, outline: 'none',
    transition: 'border-color 0.15s',
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: 'rgba(26,61,43,0.50)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-md rounded-3xl p-8 relative"
        style={{
          background: '#FAF7F2',
          boxShadow: '0 32px 80px rgba(0,0,0,0.25)',
          border: '1.5px solid #EDE8DF',
        }}>
        {/* Bande accent */}
        <div className="absolute top-0 left-8 right-8 h-1 rounded-b-full"
          style={{ background: 'linear-gradient(90deg, #2D6A4F, #52B788, #C8A96E)' }} />

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold" style={{ fontFamily: 'Georgia', color: '#1A3D2B' }}>
            Inscrire un élève
          </h2>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-base transition-all"
            style={{ color: '#6B6357', background: '#EDE8DF' }}
            onMouseEnter={e => e.target.style.background = '#D6CEBE'}
            onMouseLeave={e => e.target.style.background = '#EDE8DF'}>
            ✕
          </button>
        </div>

        {/* Formulaire */}
        {etape === 'formulaire' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold mb-1.5 uppercase tracking-widest" style={{ color: '#6B6357' }}>
                Prénom *
              </label>
              <input value={prenom} onChange={e => setPrenom(e.target.value)} autoFocus
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#2D6A4F'}
                onBlur={e => e.target.style.borderColor = '#D6CEBE'} />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5 uppercase tracking-widest" style={{ color: '#6B6357' }}>
                Nom *
              </label>
              <input value={nom} onChange={e => setNom(e.target.value)}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#2D6A4F'}
                onBlur={e => e.target.style.borderColor = '#D6CEBE'} />
            </div>
            <button onClick={handleSuivant} disabled={!prenom || !nom}
              className="w-full py-3.5 rounded-xl font-bold text-white text-sm"
              style={{
                background: 'linear-gradient(135deg, #2D6A4F, #40916C)',
                opacity: (!prenom || !nom) ? 0.45 : 1,
                boxShadow: '0 4px 14px rgba(45,106,79,0.30)',
              }}>
              Suivant → Enregistrer la voix
            </button>
          </div>
        )}

        {/* Compte à rebours */}
        {etape === 'compte' && (
          <div className="text-center py-10">
            <p className="text-sm mb-5" style={{ color: '#6B6357' }}>
              Prépare-toi à parler dans {compte} seconde{compte > 1 ? 's' : ''}…
            </p>
            <p className="text-8xl font-bold tabular-nums" style={{ color: '#2D6A4F' }}>{compte}</p>
          </div>
        )}

        {/* Enregistrement */}
        {etape === 'enregistrement' && (
          <div className="text-center py-6 space-y-5">
            <div className="text-5xl animate-pulse">🎙️</div>
            <p className="font-bold text-lg" style={{ color: '#C0392B' }}>
              PARLE maintenant ! ({prenom})
            </p>
            <p className="text-sm" style={{ color: '#6B6357' }}>Lis un texte pendant 10 secondes</p>
            <div className="w-full rounded-full h-3 overflow-hidden" style={{ background: '#EDE8DF' }}>
              <div className="h-3 rounded-full transition-all"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #2D6A4F, #52B788)',
                }} />
            </div>
            <p className="text-xs font-bold" style={{ color: '#40916C' }}>{Math.round(progress)}%</p>
          </div>
        )}

        {/* Succès */}
        {etape === 'ok' && (
          <div className="text-center py-10 space-y-3">
            <div className="text-6xl">✅</div>
            <p className="font-bold text-lg" style={{ color: '#2D6A4F' }}>
              {prenom} inscrit(e) avec succès !
            </p>
          </div>
        )}

        {/* Erreur */}
        {etape === 'erreur' && (
          <div className="text-center py-10 space-y-4">
            <div className="text-6xl">❌</div>
            <p className="font-bold" style={{ color: '#C0392B' }}>Une erreur est survenue</p>
            <button onClick={() => setEtape('formulaire')}
              className="px-7 py-2.5 rounded-xl text-white text-sm font-bold"
              style={{ background: 'linear-gradient(135deg, #2D6A4F, #40916C)' }}>
              Réessayer
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
