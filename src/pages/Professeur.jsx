import { useState } from 'react'
import SurveillancePanel from '../components/surveillance/SurveillancePanel'
import ElevesPanel from '../components/eleves/ElevesPanel'
import StatsPanel from '../components/stats/StatsPanel'
import JournalPanel from '../components/journal/JournalPanel'

const TABS = [
  { key: 'surveillance', label: '📡 Surveillance' },
  { key: 'eleves',       label: '👦 Mes élèves' },
  { key: 'stats',        label: '📊 Statistiques' },
  { key: 'journal',      label: '📋 Journal' },
]

export default function Professeur({ user, onLogout }) {
  const [tab, setTab] = useState('surveillance')

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
        <span className="text-sm italic" style={{ color: '#C8A96E' }}>{user.nom} — {user.classe}</span>
        <div className="flex-1" />
        <button onClick={onLogout}
          className="text-xs px-4 py-2 rounded-lg font-semibold"
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

      {/* Tabs */}
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

      {/* Content */}
      <main className="flex-1 overflow-auto">
        {tab === 'surveillance' && <SurveillancePanel user={user} />}
        {tab === 'eleves'       && <ElevesPanel user={user} />}
        {tab === 'stats'        && <StatsPanel user={user} />}
        {tab === 'journal'      && <JournalPanel user={user} />}
      </main>
    </div>
  )
}
