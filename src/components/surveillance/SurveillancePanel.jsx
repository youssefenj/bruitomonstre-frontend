import { useState, useEffect, useRef, useCallback } from 'react'
import socket from '../../socket'
import DbMeter from './DbMeter'
import MonsterScene from './MonsterScene'

const SEUIL_ALERTE_COOLDOWN = 3000  // ms entre deux alertes TTS

/* ── Palette forest-dark (vert profond) ── */
const C = {
  bg:       '#0A1A12',   // fond principal très foncé
  surf:     '#0F2318',   // surface cartes
  surf2:    '#152D1F',   // surface secondaire
  border:   '#1E3D2A',   // bordures
  green:    '#52B788',   // vert clair (normal)
  greenDim: 'rgba(82,183,136,0.15)',
  gold:     '#C8A96E',   // accent doré
  warn:     '#E67E22',
  crit:     '#E74C3C',
}

// Bannière flash nom élève
function AlerteBanniere({ prenom, statut, visible }) {
  if (!visible || !prenom || prenom === 'Inconnu') return null
  const isCritical = statut === 'critical'
  return (
    <div style={{
      position: 'fixed', top: 24, left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999,
      background: isCritical
        ? 'linear-gradient(135deg, #8B0000, #C0392B)'
        : 'linear-gradient(135deg, #8B4500, #D4761B)',
      color: 'white',
      borderRadius: 20,
      padding: '16px 36px',
      boxShadow: `0 12px 40px ${isCritical ? 'rgba(192,57,43,0.5)' : 'rgba(212,118,27,0.5)'}`,
      display: 'flex', alignItems: 'center', gap: 16,
      minWidth: 320,
      animation: 'slideDown 0.3s ease',
      border: `1px solid ${isCritical ? 'rgba(255,100,80,0.4)' : 'rgba(255,180,80,0.4)'}`,
    }}>
      <span style={{ fontSize: 32 }}>{isCritical ? '🔴' : '🟠'}</span>
      <div>
        <p style={{ fontSize: 22, fontWeight: 900, letterSpacing: 1 }}>{prenom.toUpperCase()}</p>
        <p style={{ fontSize: 13, opacity: 0.9, marginTop: 2 }}>
          {isCritical ? '⚠️ BRUIT CRITIQUE détecté !' : '⚡ BRUIT excessif détecté !'}
        </p>
      </div>
    </div>
  )
}

export default function SurveillancePanel({ user }) {
  const [actif, setActif]     = useState(false)
  const [db, setDb]           = useState(0)
  const [statut, setStatut]   = useState('normal')
  const [score, setScore]     = useState(100)
  const [stats, setStats]     = useState(null)
  const [phrase, setPhrase]   = useState('')
  const [etatMonster, setEtat] = useState('dort')
  const [journal, setJournal] = useState([])
  const [dernierPrenom, setDernierPrenom] = useState('')
  const [banniereVisible, setBanniereVisible] = useState(false)
  const lastAlerte = useRef(0)

  // ── Socket.IO listeners ────────────────────────────────
  useEffect(() => {
    socket.connect()
    socket.emit('join_classe', { classe: user.classe })

    socket.on('db_update', ({ db: niveau, statut: s }) => {
      setDb(niveau)
      setStatut(s)
      if (s === 'normal' && actif) setEtat('ecoute')
    })

    socket.on('alerte_event', ({ prenom, db: niveau, statut: s, phrase: p, score: sc, stats: st }) => {
      const now = Date.now()
      setDb(niveau); setStatut(s); setScore(sc); setStats(st)
      setPhrase(p); setEtat('alerte'); setDernierPrenom(prenom)
      setJournal(j => [{
        heure: new Date().toLocaleTimeString('fr-FR'),
        prenom, niveau, statut: s, phrase: p
      }, ...j].slice(0, 50))

      if (prenom && prenom !== 'Inconnu') {
        setBanniereVisible(true)
        setTimeout(() => setBanniereVisible(false), 4000)
      }

      if (now - lastAlerte.current > SEUIL_ALERTE_COOLDOWN) {
        lastAlerte.current = now
        const utt = new SpeechSynthesisUtterance(p)
        utt.lang = 'fr-FR'; utt.rate = 1.1
        speechSynthesis.speak(utt)
      }
      setTimeout(() => { setEtat('ecoute'); setPhrase('') }, 4000)
    })

    return () => {
      socket.off('db_update'); socket.off('alerte_event')
      socket.disconnect()
    }
  }, [user.classe])

  // ── Web Audio API ──────────────────────────────────────
  const audioCtxRef    = useRef(null)
  const workletNodeRef = useRef(null)
  const streamRef      = useRef(null)

  const demarrer = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { sampleRate: 16000, channelCount: 1 } })
      streamRef.current = stream
      const ctx = new AudioContext({ sampleRate: 16000 })
      audioCtxRef.current = ctx
      await ctx.audioWorklet.addModule('/workers/audio-processor.worklet.js')
      const src  = ctx.createMediaStreamSource(stream)
      const node = new AudioWorkletNode(ctx, 'audio-processor')
      workletNodeRef.current = node
      node.port.onmessage = (e) => {
        if (!socket.connected) return
        socket.emit('audio_chunk', { signal: e.data.audioData, classe: user.classe })
      }
      src.connect(node); node.connect(ctx.destination)
      setActif(true); setEtat('ecoute')
    } catch (err) {
      alert('Microphone non accessible : ' + err.message)
    }
  }, [user.classe])

  const arreter = useCallback(() => {
    workletNodeRef.current?.disconnect()
    audioCtxRef.current?.close()
    streamRef.current?.getTracks().forEach(t => t.stop())
    setActif(false); setEtat('dort'); setDb(0); setStatut('normal'); setPhrase('')
  }, [])

  const scoreColor = score >= 80 ? C.green : score >= 60 ? C.warn : C.crit
  const badgeStyle = statut === 'critical'
    ? { background: 'rgba(231,76,60,0.20)', color: C.crit, border: `1px solid ${C.crit}` }
    : statut === 'warning'
    ? { background: 'rgba(230,126,34,0.20)', color: C.warn, border: `1px solid ${C.warn}` }
    : { background: 'rgba(82,183,136,0.18)', color: C.green, border: `1px solid ${C.green}` }

  return (
    <div className="flex gap-0 h-full" style={{ background: C.bg, color: 'white', minHeight: '600px' }}>

      <AlerteBanniere prenom={dernierPrenom} statut={statut} visible={banniereVisible} />

      {/* ── Colonne gauche ── */}
      <div className="w-72 flex flex-col items-center gap-4 p-5 flex-shrink-0"
        style={{ borderRight: `1px solid ${C.border}`, background: C.surf }}>

        <MonsterScene etat={etatMonster} phrase={phrase} />

        {/* Score silence */}
        <div className="w-full text-center rounded-2xl p-4"
          style={{ background: C.surf2, border: `1px solid ${C.border}` }}>
          <p className="text-xs uppercase tracking-widest mb-1" style={{ color: '#40916C' }}>Score silence</p>
          <p className="text-5xl font-bold tabular-nums" style={{ color: scoreColor }}>
            {Math.round(score)}
          </p>
          <p className="text-xs mt-1" style={{ color: '#2D6A4F' }}>/ 100</p>
        </div>

        {/* Statut badge */}
        <span className="px-4 py-1.5 rounded-full text-xs font-bold uppercase"
          style={badgeStyle}>
          {statut === 'critical' ? '🔴 CRITIQUE' : statut === 'warning' ? '🟠 WARNING' : '🟢 Normal'}
        </span>

        {/* Bouton démarrer / arrêter */}
        {!actif ? (
          <button onClick={demarrer}
            className="w-full py-3 rounded-xl font-bold text-white text-sm"
            style={{
              background: 'linear-gradient(135deg, #1A3D2B, #2D6A4F)',
              boxShadow: '0 4px 16px rgba(45,106,79,0.40)',
            }}>
            ▶ Démarrer surveillance
          </button>
        ) : (
          <button onClick={arreter}
            className="w-full py-3 rounded-xl font-bold text-white text-sm"
            style={{
              background: 'linear-gradient(135deg, #7B0000, #C0392B)',
              boxShadow: '0 4px 16px rgba(192,57,43,0.40)',
            }}>
            ⏹ Arrêter
          </button>
        )}

        {/* Mini stats */}
        {stats && (
          <div className="w-full grid grid-cols-2 gap-2 text-center">
            {[
              ['Alertes', stats.nb_alertes],
              ['Warning', stats.nb_warning],
              ['Critique', stats.nb_critical],
              ['Durée', stats.duree],
            ].map(([label, val]) => (
              <div key={label} className="rounded-xl p-2.5"
                style={{ background: C.surf2, border: `1px solid ${C.border}` }}>
                <p className="text-xs mb-0.5" style={{ color: '#40916C' }}>{label}</p>
                <p className="text-sm font-bold text-white">{val}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Colonne droite ── */}
      <div className="flex-1 flex flex-col gap-4 p-5 overflow-hidden">

        {/* Jauge dB */}
        <div className="rounded-2xl p-5"
          style={{ background: C.surf, border: `1px solid ${C.border}` }}>
          <p className="text-xs uppercase tracking-widest mb-3" style={{ color: '#40916C' }}>
            Niveau sonore temps réel
          </p>
          <DbMeter db={db} statut={statut} />
        </div>

        {/* Dernier élève identifié */}
        {dernierPrenom && dernierPrenom !== 'Inconnu' && (
          <div className="rounded-2xl p-4 flex items-center gap-4"
            style={{
              background: statut === 'critical' ? 'rgba(139,0,0,0.25)' : 'rgba(139,70,0,0.20)',
              border: `2px solid ${statut === 'critical' ? C.crit : C.warn}`,
            }}>
            <div className="text-4xl">🎙️</div>
            <div>
              <p className="text-xs uppercase tracking-widest mb-1" style={{ color: '#40916C' }}>
                Dernier élève détecté
              </p>
              <p className="text-2xl font-black"
                style={{ color: statut === 'critical' ? C.crit : C.warn }}>
                {dernierPrenom}
              </p>
              <p className="text-xs mt-0.5" style={{ color: '#40916C' }}>
                {db.toFixed(1)} dB — {statut === 'critical' ? 'CRITIQUE' : 'WARNING'}
              </p>
            </div>
          </div>
        )}

        {/* Journal des incidents */}
        <div className="flex-1 rounded-2xl p-4 overflow-y-auto"
          style={{ background: C.surf, border: `1px solid ${C.border}` }}>
          <p className="text-xs uppercase tracking-widest mb-3" style={{ color: '#40916C' }}>
            Journal des incidents
          </p>
          {journal.length === 0 && (
            <p className="text-sm text-center mt-8" style={{ color: '#2D6A4F' }}>
              Aucun incident pour l'instant…
            </p>
          )}
          {journal.map((e, i) => (
            <div key={i} className="flex items-start gap-3 mb-2.5 p-3 rounded-xl"
              style={{
                background: e.statut === 'critical'
                  ? 'rgba(139,0,0,0.25)'
                  : C.surf2,
                border: `1px solid ${e.statut === 'critical' ? 'rgba(231,76,60,0.3)' : C.border}`,
              }}>
              <span className="text-xs w-16 flex-shrink-0 pt-0.5" style={{ color: '#2D6A4F' }}>{e.heure}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-black"
                    style={{ color: e.statut === 'critical' ? C.crit : C.warn }}>
                    {e.prenom === 'Inconnu' ? '❓ Inconnu' : `🎙️ ${e.prenom}`}
                  </span>
                  <span className="text-xs" style={{ color: '#40916C' }}>{e.niveau.toFixed(1)} dB</span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                    style={{
                      background: e.statut === 'critical' ? 'rgba(231,76,60,0.25)' : 'rgba(230,126,34,0.25)',
                      color: e.statut === 'critical' ? C.crit : C.warn,
                    }}>
                    {e.statut === 'critical' ? 'CRITIQUE' : 'WARNING'}
                  </span>
                </div>
                <p className="text-xs mt-1 italic truncate" style={{ color: '#52B788' }}>"{e.phrase}"</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
