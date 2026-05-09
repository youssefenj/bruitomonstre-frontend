'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SurveillancePanel from './surveillance/SurveillancePanel'
import ElevesPanel from './eleves/ElevesPanel'
import StatsPanel from './stats/StatsPanel'
import JournalPanel from './journal/JournalPanel'

/* ── Palette sidebar vert forêt foncé ── */
const SB = {
  bg:     '#0F2318',
  surf:   '#112A1E',
  border: 'rgba(82,183,136,0.12)',
  active: 'rgba(45,106,79,0.25)',
  text:   'rgba(82,183,136,0.65)',
  textOn: '#52B788',
  accent: '#C8A96E',
}

const TABS = [
  { key: 'surveillance', icon: '📡', label: 'Surveillance' },
  { key: 'eleves',       icon: '👦', label: 'Mes élèves'  },
  { key: 'stats',        icon: '📊', label: 'Statistiques' },
  { key: 'journal',      icon: '📋', label: 'Journal'      },
]

const PANEL = {
  surveillance: SurveillancePanel,
  eleves:       ElevesPanel,
  stats:        StatsPanel,
  journal:      JournalPanel,
}

export default function ProfesseurLayout({ user, onLogout }) {
  const [tab, setTab]             = useState('surveillance')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const Panel = PANEL[tab]

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#FAF7F2' }}>

      {/* ── Sidebar ── */}
      <motion.aside
        animate={{ width: sidebarOpen ? 224 : 64 }}
        transition={{ type: 'spring', bounce: 0.1, duration: 0.4 }}
        className="flex-shrink-0 flex flex-col overflow-hidden relative"
        style={{
          background: SB.bg,
          borderRight: `1px solid ${SB.border}`,
          boxShadow: '4px 0 20px rgba(0,0,0,0.15)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b" style={{ borderColor: SB.border }}>
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl text-xl"
            style={{ background: 'rgba(82,183,136,0.15)', border: `1px solid ${SB.border}` }}
          >
            👾
          </motion.div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-sm font-bold leading-tight" style={{ color: '#FFFFFF' }}>BruitoMonstre</p>
                <p className="text-xs font-medium" style={{ color: SB.accent }}>Espace Prof</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-left"
              style={{
                background: tab === t.key ? SB.active : 'transparent',
                color:      tab === t.key ? SB.textOn  : SB.text,
                boxShadow:  tab === t.key ? `inset 3px 0 0 #2D6A4F` : 'none',
              }}
            >
              <span className="text-lg flex-shrink-0">{t.icon}</span>
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="truncate"
                  >
                    {t.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          ))}
        </nav>

        {/* User + logout */}
        <div className="p-3 border-t space-y-2" style={{ borderColor: SB.border }}>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="px-2 py-2 rounded-lg"
                style={{ background: 'rgba(82,183,136,0.08)', border: `1px solid ${SB.border}` }}
              >
                <p className="text-xs font-bold truncate" style={{ color: '#FFFFFF' }}>{user.nom}</p>
                <p className="text-xs" style={{ color: SB.accent }}>Classe {user.classe}</p>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all"
            style={{ color: SB.text }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(192,57,43,0.15)'; e.currentTarget.style.color = '#F87171' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = SB.text }}
          >
            <span className="text-lg flex-shrink-0">🚪</span>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  Déconnexion
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* Toggle */}
        <button
          onClick={() => setSidebarOpen(o => !o)}
          className="absolute bottom-24 -right-3 w-6 h-6 rounded-full flex items-center justify-center text-xs"
          style={{ background: '#1A3D2B', border: `1px solid ${SB.border}`, color: '#52B788' }}
        >
          {sidebarOpen ? '‹' : '›'}
        </button>
      </motion.aside>

      {/* ── Main ── */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {/* Topbar */}
        <header className="flex items-center gap-4 px-6 py-3.5 border-b flex-shrink-0"
          style={{
            background: '#FFFFFF',
            borderColor: '#EDE8DF',
            boxShadow: '0 1px 8px rgba(45,106,79,0.06)',
          }}>
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(#2D6A4F, #52B788)' }} />
            <p className="text-sm font-bold" style={{ color: '#1A3D2B' }}>
              {TABS.find(t => t.key === tab)?.icon} {TABS.find(t => t.key === tab)?.label}
            </p>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{ background: '#D8F3DC' }}>
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#27AE60' }} />
            <span className="text-xs font-semibold" style={{ color: '#2D6A4F' }}>Classe {user.classe}</span>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto" style={{ background: '#FAF7F2' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.25 }}
              className="h-full"
            >
              <Panel user={user} />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
