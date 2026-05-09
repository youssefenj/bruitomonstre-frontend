'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { login } from '../lib/api'
import { Button } from './ui/button'
import { Input } from './ui/input'

/* Monstre recolorisé en vert */
const Monster3D = () => (
  <motion.div
    className="relative w-36 h-36 mx-auto mb-2"
    animate={{ y: [0, -8, 0] }}
    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
  >
    <div className="absolute inset-0 rounded-full blur-2xl opacity-35 pointer-events-none"
      style={{ background: 'radial-gradient(circle, #2D6A4F 0%, transparent 70%)' }} />
    <svg viewBox="0 0 200 200" className="w-full h-full relative z-10">
      <ellipse cx="100" cy="120" rx="62" ry="58" fill="#1A3D2B" />
      <ellipse cx="100" cy="80" rx="56" ry="52" fill="#2D6A4F" />
      <ellipse cx="82" cy="62" rx="16" ry="10" fill="rgba(255,255,255,0.15)" transform="rotate(-20 82 62)" />
      <circle cx="80" cy="76" r="16" fill="white" />
      <circle cx="120" cy="76" r="16" fill="white" />
      <circle cx="84" cy="78" r="9" fill="#0A1A12" />
      <circle cx="124" cy="78" r="9" fill="#0A1A12" />
      <circle cx="87" cy="75" r="3" fill="white" />
      <circle cx="127" cy="75" r="3" fill="white" />
      <path d="M 76 100 Q 100 116 124 100" stroke="white" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <polygon points="70,34 60,10 80,34" fill="#1A3D2B" />
      <polygon points="130,34 120,10 140,34" fill="#1A3D2B" />
      <ellipse cx="42" cy="118" rx="14" ry="22" fill="#40916C" transform="rotate(-20 42 118)" />
      <ellipse cx="158" cy="118" rx="14" ry="22" fill="#40916C" transform="rotate(20 158 118)" />
      <ellipse cx="74" cy="172" rx="20" ry="10" fill="#2D6A4F" />
      <ellipse cx="126" cy="172" rx="20" ry="10" fill="#2D6A4F" />
    </svg>
  </motion.div>
)

const TAB_ITEMS = [
  { key: 'prof', label: '🎓 Professeur' },
  { key: 'dir',  label: '🏫 Directeur'  },
]
const PLACEHOLDERS = {
  prof: { id: 'PROF-2024-001', pwd: 'Roux#4521' },
  dir:  { id: 'directeur',     pwd: 'dir2025'   },
}

export default function Login({ onLogin }) {
  const [tab,     setTab]     = useState('prof')
  const [id,      setId]      = useState('')
  const [pwd,     setPwd]     = useState('')
  const [erreur,  setErreur]  = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErreur('')
    try {
      const res = await login(id.trim(), pwd.trim())
      onLogin(res.data)
    } catch (err) {
      if (!err.response) {
        setErreur('❌ Impossible de joindre le serveur. Vérifie que le backend tourne sur le port 8000.')
      } else if (err.response.status === 401) {
        setErreur('Identifiant ou mot de passe incorrect')
        setPwd('')
      } else {
        setErreur(`Erreur serveur (${err.response.status}) — réessaie.`)
      }
    } finally {
      setLoading(false)
    }
  }

  const switchTab = (t) => { setTab(t); setId(''); setPwd(''); setErreur('') }

  return (
    <div className="min-h-screen flex items-center justify-center bg-grid relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #1A3D2B 0%, #2D6A4F 55%, #40916C 100%)',
      }}>

      {/* Orbes de fond */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #52B788, transparent)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full blur-3xl opacity-15 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #C8A96E, transparent)' }} />

      <motion.div
        className="relative w-full max-w-sm mx-4"
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Monstre animé */}
        <Monster3D />

        {/* Titre */}
        <div className="text-center mb-8">
          <motion.h1
            className="text-4xl font-bold text-gradient"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          >
            BruitoMonstre
          </motion.h1>
          <motion.p
            className="text-sm mt-1.5 font-medium"
            style={{ color: '#C8A96E' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          >
            Le Gardien du Silence 👾
          </motion.p>
          <motion.div
            className="mx-auto mt-3 h-px w-40"
            style={{ background: 'linear-gradient(90deg, transparent, #C8A96E, transparent)' }}
            initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.4, duration: 0.5 }}
          />
        </div>

        {/* Carte */}
        <motion.div
          className="rounded-3xl p-1"
          style={{
            background: 'linear-gradient(135deg, rgba(45,106,79,0.5), rgba(82,183,136,0.3), rgba(200,169,110,0.3))',
          }}
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.5 }}
        >
          <div className="rounded-3xl p-6 relative" style={{ background: '#FAF7F2' }}>
            {/* Bande accent */}
            <div className="absolute top-0 left-8 right-8 h-1 rounded-b-full"
              style={{ background: 'linear-gradient(90deg, #2D6A4F, #52B788, #C8A96E)' }} />

            {/* Tabs */}
            <div className="flex rounded-xl p-1 mb-6 gap-1" style={{ background: '#EDE8DF' }}>
              {TAB_ITEMS.map(t => (
                <button
                  key={t.key}
                  onClick={() => switchTab(t.key)}
                  className="relative flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors"
                  style={{ color: tab === t.key ? '#FFFFFF' : '#6B6357' }}
                >
                  {tab === t.key && (
                    <motion.div
                      layoutId="tab-bg"
                      className="absolute inset-0 rounded-lg"
                      style={{ background: 'linear-gradient(135deg, #2D6A4F, #40916C)' }}
                      transition={{ type: 'spring', bounce: 0.25, duration: 0.4 }}
                    />
                  )}
                  <span className="relative z-10">{t.label}</span>
                </button>
              ))}
            </div>

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Identifiant"
                value={id}
                onChange={e => setId(e.target.value)}
                placeholder={PLACEHOLDERS[tab].id}
                autoFocus
                autoComplete="username"
              />
              <Input
                label="Mot de passe"
                type="password"
                value={pwd}
                onChange={e => setPwd(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />

              <AnimatePresence>
                {erreur && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="rounded-xl px-4 py-2.5 text-sm font-medium"
                    style={{ background: 'rgba(192,57,43,0.10)', border: '1px solid rgba(192,57,43,0.25)', color: '#C0392B' }}
                  >
                    ⚠️ {erreur}
                  </motion.div>
                )}
              </AnimatePresence>

              <Button type="submit" size="lg" className="w-full mt-2" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                    Connexion...
                  </span>
                ) : 'Se connecter →'}
              </Button>
            </form>

            <p className="text-center text-xs mt-4" style={{ color: '#B0A496' }}>
              Demo : <span style={{ color: '#6B6357' }}>{PLACEHOLDERS[tab].id}</span>
              {' / '}
              <span style={{ color: '#6B6357' }}>{PLACEHOLDERS[tab].pwd}</span>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
