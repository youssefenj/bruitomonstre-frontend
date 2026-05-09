'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Dashboard    from './directeur/Dashboard'
import ScoresPanel  from './directeur/ScoresPanel'
import AlertesPanel from './directeur/AlertesPanel'
import Recompenses  from './directeur/Recompenses'

/* ── Palette sidebar vert forêt foncé ── */
const SB = {
  bg:     '#0F2318',
  border: 'rgba(82,183,136,0.12)',
  active: 'rgba(200,169,110,0.20)',
  text:   'rgba(82,183,136,0.60)',
  textOn: '#C8A96E',
  accent: '#C8A96E',
}

const TABS = [
  { key: 'dashboard',   icon: '📊', label: "Vue d'ensemble" },
  { key: 'scores',      icon: '🏆', label: 'Scores classes' },
  { key: 'alertes',     icon: '🔔', label: 'Alertes' },
  { key: 'recompenses', icon: '🎉', label: 'Récompenses' },
]

const PANEL = { dashboard: Dashboard, scores: ScoresPanel, alertes: AlertesPanel, recompenses: Recompenses }

export default function DirecteurLayout({ user, onLogout }) {
  const [tab, setTab] = useState('dashboard')
  const Panel = PANEL[tab]

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#FAF7F2' }}>

      {/* ── Sidebar ── */}
      <aside className="w-56 flex-shrink-0 flex flex-col"
        style={{
          background: SB.bg,
          borderRight: `1px solid ${SB.border}`,
          boxShadow: '4px 0 20px rgba(0,0,0,0.15)',
        }}>

        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b" style={{ borderColor: SB.border }}>
          <div className="w-9 h-9 flex items-center justify-center rounded-xl text-xl flex-shrink-0"
            style={{ background: 'rgba(200,169,110,0.15)', border: `1px solid rgba(200,169,110,0.25)` }}>
            <motion.span animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>👾</motion.span>
          </div>
          <div>
            <p className="text-sm font-bold leading-tight" style={{ color: '#FFFFFF' }}>BruitoMonstre</p>
            <p className="text-xs font-medium" style={{ color: SB.accent }}>Espace Directeur</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all text-left"
              style={{
                background: tab === t.key ? SB.active : 'transparent',
                color:      tab === t.key ? SB.textOn : SB.text,
                boxShadow:  tab === t.key ? `inset 3px 0 0 ${SB.accent}` : 'none',
              }}>
              <span className="text-lg">{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </nav>

        {/* User */}
        <div className="p-3 border-t space-y-2" style={{ borderColor: SB.border }}>
          <div className="px-2 py-2 rounded-lg"
            style={{ background: 'rgba(200,169,110,0.08)', border: `1px solid ${SB.border}` }}>
            <p className="text-xs font-bold" style={{ color: '#FFFFFF' }}>{user.nom}</p>
            <p className="text-xs" style={{ color: SB.accent }}>Directeur</p>
          </div>
          <button onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all text-left"
            style={{ color: SB.text }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(192,57,43,0.15)'; e.currentTarget.style.color = '#F87171' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = SB.text }}>
            <span className="text-lg">🚪</span>
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 overflow-hidden flex flex-col">
        <header className="flex items-center gap-4 px-6 py-3.5 border-b flex-shrink-0"
          style={{
            background: '#FFFFFF',
            borderColor: '#EDE8DF',
            boxShadow: '0 1px 8px rgba(45,106,79,0.06)',
          }}>
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(#C8A96E, #2D6A4F)' }} />
            <p className="text-sm font-bold" style={{ color: '#1A3D2B' }}>
              {TABS.find(t => t.key === tab)?.icon} {TABS.find(t => t.key === tab)?.label}
            </p>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{ background: '#FEF3E2' }}>
            <div className="w-2 h-2 rounded-full" style={{ background: '#C8A96E', boxShadow: '0 0 6px #C8A96E' }} />
            <span className="text-xs font-semibold" style={{ color: '#8B6914' }}>Administration</span>
          </div>
        </header>

        <div className="flex-1 overflow-auto" style={{ background: '#FAF7F2' }}>
          <AnimatePresence mode="wait">
            <motion.div key={tab}
              initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.22 }} className="h-full">
              <Panel />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
