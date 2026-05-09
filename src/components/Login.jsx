import { useState } from 'react'
import { login } from '../api'

export default function Login({ onLogin }) {
  const [tab, setTab]       = useState('prof')
  const [id, setId]         = useState('')
  const [pwd, setPwd]       = useState('')
  const [erreur, setErreur] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErreur('')
    try {
      const res = await login(id.trim(), pwd.trim())
      onLogin(res.data)
    } catch {
      setErreur('Identifiant ou mot de passe incorrect')
      setPwd('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{
      background: 'linear-gradient(135deg, #1A3D2B 0%, #2D6A4F 55%, #40916C 100%)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Orbes décoratifs */}
      <div style={{
        position: 'absolute', top: '8%', left: '3%',
        width: 340, height: 340, borderRadius: '50%',
        background: 'rgba(82,183,136,0.09)', filter: 'blur(70px)', pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', bottom: '8%', right: '3%',
        width: 240, height: 240, borderRadius: '50%',
        background: 'rgba(200,169,110,0.11)', filter: 'blur(55px)', pointerEvents: 'none'
      }} />

      <div className="w-full max-w-md px-4 relative">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 text-5xl"
            style={{
              background: 'rgba(255,255,255,0.13)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
              border: '1px solid rgba(255,255,255,0.18)',
            }}>
            👾
          </div>
          <h1 className="text-4xl font-bold text-white" style={{ fontFamily: 'Georgia, serif', letterSpacing: '-0.5px' }}>
            BruitoMonstre
          </h1>
          <p className="text-sm italic mt-2" style={{ color: '#C8A96E' }}>Le Gardien Rigolo du Silence</p>
          <div className="mt-3 mx-auto h-px w-44" style={{
            background: 'linear-gradient(90deg, transparent, #C8A96E, transparent)'
          }} />
        </div>

        {/* Card */}
        <div className="rounded-3xl p-8 relative" style={{
          background: '#FAF7F2',
          boxShadow: '0 24px 64px rgba(0,0,0,0.28)',
        }}>
          {/* Bande accent en haut */}
          <div className="absolute top-0 left-8 right-8 h-1 rounded-b-full"
            style={{ background: 'linear-gradient(90deg, #2D6A4F, #52B788, #C8A96E)' }} />

          {/* Tabs */}
          <div className="flex rounded-xl overflow-hidden mb-6 p-1" style={{ background: '#EDE8DF' }}>
            {['prof', 'dir'].map(t => (
              <button key={t} onClick={() => { setTab(t); setId(''); setErreur('') }}
                className="flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200"
                style={{
                  background: tab === t ? '#2D6A4F' : 'transparent',
                  color: tab === t ? '#FFFFFF' : '#6B6357',
                  boxShadow: tab === t ? '0 2px 10px rgba(45,106,79,0.28)' : 'none',
                }}>
                {t === 'prof' ? '🧑‍🏫 Professeur' : '🏫 Directeur'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold mb-1.5 uppercase tracking-widest" style={{ color: '#6B6357' }}>
                Identifiant
              </label>
              <input value={id} onChange={e => setId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm"
                style={{
                  border: '1.5px solid #D6CEBE',
                  background: '#FFFFFF',
                  color: '#2D2A24',
                  outline: 'none',
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => e.target.style.borderColor = '#2D6A4F'}
                onBlur={e => e.target.style.borderColor = '#D6CEBE'}
                placeholder={tab === 'prof' ? 'PROF-2024-001' : 'directeur'} autoFocus />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5 uppercase tracking-widest" style={{ color: '#6B6357' }}>
                Mot de passe
              </label>
              <input type="password" value={pwd} onChange={e => setPwd(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm"
                style={{
                  border: '1.5px solid #D6CEBE',
                  background: '#FFFFFF',
                  color: '#2D2A24',
                  outline: 'none',
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => e.target.style.borderColor = '#2D6A4F'}
                onBlur={e => e.target.style.borderColor = '#D6CEBE'}
                placeholder="••••••••" />
            </div>

            {erreur && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium"
                style={{ background: '#FDECEA', color: '#C0392B' }}>
                ⚠️ {erreur}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-white text-sm"
              style={{
                background: 'linear-gradient(135deg, #2D6A4F, #40916C)',
                opacity: loading ? 0.8 : 1,
                boxShadow: '0 4px 16px rgba(45,106,79,0.35)',
                letterSpacing: '0.4px',
                transition: 'opacity 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={e => !loading && (e.target.style.boxShadow = '0 6px 22px rgba(45,106,79,0.45)')}
              onMouseLeave={e => e.target.style.boxShadow = '0 4px 16px rgba(45,106,79,0.35)'}>
              {loading ? '⏳ Connexion...' : '→ Se connecter'}
            </button>
          </form>

          <p className="text-center text-xs mt-5" style={{ color: '#B0A496' }}>
            Prof : PROF-2024-001 / Roux#4521 &nbsp;·&nbsp; Dir : directeur / dir2025
          </p>
        </div>
      </div>
    </div>
  )
}
