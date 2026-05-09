'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getAlertes } from '../../lib/api'
import { Card, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'

export default function JournalPanel({ user }) {
  const [alertes, setAlertes] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState('all')

  useEffect(() => {
    setLoading(true)
    getAlertes(user.classe, 100)
      .then(r => setAlertes(r.data))
      .finally(() => setLoading(false))
  }, [user.classe])

  const filtered = filter === 'all'
    ? alertes
    : alertes.filter(a => a.type_alerte === filter)

  return (
    <div className="p-5 flex flex-col h-full">
      {/* Header */}
      <motion.div className="flex items-center justify-between mb-5"
        initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <h2 className="text-xl font-bold" style={{ color: '#1A3D2B' }}>Journal des incidents</h2>
          <p className="text-sm mt-0.5" style={{ color: '#6B6357' }}>
            {alertes.length} événement(s) enregistré(s) pour la classe {user.classe}
          </p>
        </div>
        {/* Filter tabs */}
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: '#EDE8DF' }}>
          {[
            { key: 'all',      label: 'Tous' },
            { key: 'warning',  label: '🟠 Warning' },
            { key: 'critical', label: '🔴 Critique' },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all"
              style={{
                background: filter === f.key ? '#FFFFFF' : 'transparent',
                color: filter === f.key ? '#1A3D2B' : '#6B6357',
                boxShadow: filter === f.key ? '0 1px 3px rgba(45,106,79,0.12)' : 'none',
              }}>
              {f.label}
            </button>
          ))}
        </div>
      </motion.div>

      <Card className="flex-1 flex flex-col overflow-hidden p-0">
        {/* Table header */}
        <div className="grid grid-cols-5 px-5 py-3 text-xs font-semibold uppercase tracking-wider border-b"
          style={{ color: '#6B6357', borderColor: '#EDE8DF', background: 'rgba(237,232,223,0.5)' }}>
          <span>Heure</span>
          <span>Élève</span>
          <span>Niveau dB</span>
          <span>Type</span>
          <span>Message</span>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-7 h-7 rounded-full"
                style={{ border: '2px solid rgba(45,106,79,0.25)', borderTopColor: '#2D6A4F' }} />
            </div>
          ) : filtered.length === 0 ? (
            <motion.div className="flex flex-col items-center justify-center h-40"
              style={{ color: '#6B6357' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <span className="text-4xl mb-2">📋</span>
              <p className="text-sm">Aucune alerte enregistrée.</p>
            </motion.div>
          ) : (
            <AnimatePresence>
              {filtered.map((a, i) => {
                const isCrit = a.type_alerte === 'critical'
                const heure  = a.horodatage ? new Date(a.horodatage).toLocaleTimeString('fr-FR') : '—'
                return (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="grid grid-cols-5 px-5 py-3 text-sm border-b transition-colors"
                    style={{
                      borderColor: '#EDE8DF',
                      background: isCrit
                        ? 'rgba(192,57,43,0.04)'
                        : 'rgba(212,118,27,0.04)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(237,232,223,0.6)'}
                    onMouseLeave={e => e.currentTarget.style.background = isCrit ? 'rgba(192,57,43,0.04)' : 'rgba(212,118,27,0.04)'}
                  >
                    <span className="font-mono text-xs pt-0.5" style={{ color: '#6B6357' }}>{heure}</span>
                    <span className="font-semibold" style={{ color: '#1A3D2B' }}>{a.prenom}</span>
                    <span className="font-bold" style={{ color: isCrit ? '#E74C3C' : '#E67E22' }}>
                      {a.niveau_db?.toFixed(1)} dB
                    </span>
                    <span>
                      <Badge variant={isCrit ? 'danger' : 'warning'}>
                        {a.type_alerte}
                      </Badge>
                    </span>
                    <span className="text-xs italic truncate pt-0.5" style={{ color: '#9E948A' }}>
                      {a.phrase || '—'}
                    </span>
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
