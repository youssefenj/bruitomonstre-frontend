import { useState } from 'react'
import Dashboard from '../components/directeur/Dashboard'
import ScoresPanel from '../components/directeur/ScoresPanel'
import AlertesPanel from '../components/directeur/AlertesPanel'
import Recompenses from '../components/directeur/Recompenses'

const TABS = [
  { key: 'dashboard',   label: '📊 Vue d\'ensemble' },
  { key: 'scores',      label: '🏆 Scores classes' },
  { key: 'alertes',     label: '🔔 Alertes' },
  { key: 'recompenses', label: '🎉 Récompenses' },
]

export default function Directeur({ user, onLogout }) {
  const [tab, setTab] = useState('dashboard')

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#FAF7F2' }}>

      {/* Header */}
      <header className="flex items-center gap-4 px-6 py-3.5"
        style={{
          background: 'linear-gradient(90deg, #1A3D2B, #2D6A4F)',
          boxShadow: '0 2px 16px rgba(26,61,43,0.30)',
        }}>
        <div className="flex items-center justify-center w-9 h-9 rounded-xl text-xl"
          style={{ background: 'rgba(255,255,255,0.13)', border: '1px solid rgba(255,255,255,0.15)' }}>
          👾
        </div>
        <span className="text-white font-bold text-lg" style={{ fontFamily: 'Georgia' }}>BruitoMonstre</span>
        <div className="h-4 w-px mx-1" style={{ background: 'rgba(255,255,255,0.25)' }} />
        <span className="text-sm italic" style={{ color: '#C8A96E' }}>Espace Directeur — {user.nom}</span>
        <div className="flex-1" />
        <button onClick={onLogout}
          className="text-xs px-4 py-2 rounded-lg font-semibold transition-all"
          style={{
            background: 'rgba(255,255,255,0.13)',
            color: '#FFFFFF',
            border: '1px solid rgba(255,255,255,0.20)',
          }}
          onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.22)'}
          onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.13)'}>
          Déconnexion
        </button>
      </header>

      {/* Navigation onglets */}
      <nav className="flex border-b" style={{ background: '#FFFFFF', borderColor: '#D6CEBE' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className="px-6 py-3.5 text-sm transition-all duration-150"
            style={{
              color:        tab === t.key ? '#2D6A4F' : '#6B6357',
              fontWeight:   tab === t.key ? 700 : 400,
              borderBottom: tab === t.key ? '2.5px solid #2D6A4F' : '2.5px solid transparent',
              background:   tab === t.key ? 'linear-gradient(to bottom, #FFFFFF, #F4FAF6)' : 'transparent',
            }}>
            {t.label}
          </button>
        ))}
      </nav>

      <main className="flex-1 overflow-auto">
        {tab === 'dashboard'   && <Dashboard />}
        {tab === 'scores'      && <ScoresPanel />}
        {tab === 'alertes'     && <AlertesPanel />}
        {tab === 'recompenses' && <Recompenses />}
      </main>
    </div>
  )
}
