'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getAlertesAll } from '../../lib/api'
import { Card, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'

export default function AlertesPanel() {
  const [alertes, setAlertes] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState('all')
  const [search,  setSearch]  = useState('')

  useEffect(() => {
    getAlertesAll()
      .then(r => setAlertes(r.data))
      .finally(() => setLoading(false))
  }, [])

  const filtered = alertes
    .filter(a => filter === 'all' || a.type_alerte === filter)
    .filter(a => !search || `${a.prenom} ${a.classe}`.toLowerCase().includes(search.toLowerCase()))

  const critCount = alertes.filter(a => a.type_alerte === 'critical').length
  const warnCount = alertes.filter(a => a.type_alerte === 'warning').length

  return (
    <div className="p-5 flex flex-col h-full">
      <motion.div className="flex flex-wrap items-center gap-3 mb-5"
        initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <h2 className="text-xl font-bold" style={{ color: '#15803D' }}>Journal complet — toutes classes</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            <span className="text-red-400 font-medium">{critCount} critiques</span>
            {' · '}
            <span className="text-amber-400 font-medium">{warnCount} warnings</span>
          </p>
        </div>
        <div className="flex-1" />
        {/* Search */}
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Chercher élève ou classe..."
          className="px-3 py-2 text-sm rounded-xl placeholder-gray-500 outline-none"
          style={{ color: '#2D2A24' }}
          style={{ background: '#EDE8DF', border: '1px solid rgba(214,206,190,0.6)', width: 220 }}
        />
        {/* Filter */}
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: '#EDE8DF' }}>
          {[
            { key: 'all',      label: 'Tous' },
            { key: 'warning',  label: '🟠 Warning' },
            { key: 'critical', label: '🔴 Critique' },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all"
              style={{
                background: filter === f.key ? '#374151' : 'transparent',
                color: filter === f.key ? '#F9FAFB' : '#6B7280',
              }}>
              {f.label}
            </button>
          ))}
        </div>
      </motion.div>

      <Card className="flex-1 flex flex-col overflow-hidden p-0">
        <div className="grid grid-cols-6 px-5 py-3 text-xs font-semibold uppercase tracking-wider border-b"
          style={{ color: '#4B5563', borderColor: 'rgba(214,206,190,0.4)', background: 'rgba(45,106,79,0.02)' }}>
          <span>Heure</span><span>Classe</span><span>Élève</span>
          <span>Niveau dB</span><span>Type</span><span>Message</span>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-7 h-7 border-2 border-warning/30 border-t-warning rounded-full" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-600">
              <span className="text-4xl mb-2">📋</span>
              <p className="text-sm">Aucune alerte trouvée.</p>
            </div>
          ) : (
            <AnimatePresence>
              {filtered.map((a, i) => {
                const isCrit = a.type_alerte === 'critical'
                const heure  = a.horodatage ? new Date(a.horodatage).toLocaleTimeString('fr-FR') : '—'
                return (
                  <motion.div key={a.id}
                    initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(i * 0.015, 0.3) }}
                    className="grid grid-cols-6 px-5 py-3 text-sm border-b transition-all"
                    style={{
                      borderColor: 'rgba(45,106,79,0.03)',
                      background: isCrit ? 'rgba(239,68,68,0.05)' : 'rgba(245,158,11,0.04)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(45,106,79,0.03)'}
                    onMouseLeave={e => e.currentTarget.style.background = isCrit ? 'rgba(239,68,68,0.05)' : 'rgba(245,158,11,0.04)'}
                  >
                    <span className="font-mono text-xs" style={{ color: '#6B6357' }}>{heure}</span>
                    <span className="text-xs font-medium" style={{ color: '#2D2A24' }}>{a.classe}</span>
                    <span className="font-semibold" style={{ color: '#2D2A24' }}>{a.prenom}</span>
                    <span className="font-bold text-sm" style={{ color: isCrit ? '#E74C3C' : '#E67E22' }}>
                      {a.niveau_db?.toFixed(1)} dB
                    </span>
                    <span>
                      <Badge variant={isCrit ? 'danger' : 'warning'}>{a.type_alerte}</Badge>
                    </span>
                    <span className="text-xs text-gray-500 italic truncate">{a.phrase || '—'}</span>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          )}
        </div>
      </Card>
    </div>
  )
}
