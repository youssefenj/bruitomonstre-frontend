'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getScoresAll, getAlertesAll } from '../../lib/api'
import { Card, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'

export default function Dashboard() {
  const [scores,  setScores]  = useState([])
  const [alertes, setAlertes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getScoresAll(), getAlertesAll()])
      .then(([s, a]) => { setScores(s.data); setAlertes(a.data.slice(0, 10)) })
      .finally(() => setLoading(false))
  }, [])

  const totalAlertes = scores.reduce((s, x) => s + (x.nb_alertes || 0), 0)
  const scoreMoyen   = scores.length
    ? Math.round(scores.reduce((s, x) => s + x.score, 0) / scores.length)
    : 0
  const scoreColor = scoreMoyen >= 80 ? '#27AE60' : scoreMoyen >= 60 ? '#D4761B' : '#C0392B'

  const kpis = [
    { icon: '🏫', label: 'Classes actives',   val: scores.length,  color: '#2D6A4F' },
    { icon: '🎯', label: 'Score moyen',        val: scoreMoyen,     color: scoreColor },
    { icon: '🔔', label: 'Alertes totales',    val: totalAlertes,   color: '#C0392B' },
    { icon: '📈', label: 'Classes > 80',       val: scores.filter(s => s.score >= 80).length, color: '#27AE60' },
  ]

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-8 h-8 border-2 border-warning/30 border-t-warning rounded-full" />
    </div>
  )

  return (
    <div className="p-5 space-y-5">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-xl font-bold" style={{ color: '#15803D' }}>Tableau de bord</h2>
        <p className="text-sm mt-0.5" style={{ color: '#6B6357' }}>Vue globale de l'établissement</p>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpis.map((k, i) => (
          <motion.div key={k.label}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}>
            <Card className="text-center py-5">
              <p className="text-2xl mb-2">{k.icon}</p>
              <p className="text-xs mb-1" style={{ color: '#6B6357' }}>{k.label}</p>
              <motion.p className="text-4xl font-bold"
                initial={{ scale: 0.6 }} animate={{ scale: 1 }}
                transition={{ delay: i * 0.07 + 0.2, type: 'spring', bounce: 0.4 }}
                style={{ color: k.color }}>
                {k.val}
              </motion.p>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Scores par classe */}
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardTitle className="mb-4">Scores par classe</CardTitle>
            {scores.length === 0 ? (
              <p className="text-gray-600 text-sm text-center py-6">Aucune classe active</p>
            ) : (
              <div className="space-y-3">
                {scores.slice(0, 6).map((s, i) => {
                  const col = s.score >= 80 ? '#27AE60' : s.score >= 60 ? '#D4761B' : '#C0392B'
                  return (
                    <motion.div key={s.id} className="flex items-center gap-3"
                      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.35 + i * 0.05 }}>
                      <span className="text-xs text-gray-600 w-4 font-bold">#{i + 1}</span>
                      <span className="text-sm font-medium w-24 flex-shrink-0" style={{ color: '#2D2A24' }}>{s.classe}</span>
                      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: '#EDE8DF' }}>
                        <motion.div className="h-full rounded-full"
                          initial={{ width: 0 }} animate={{ width: `${s.score}%` }}
                          transition={{ duration: 1, delay: 0.4 + i * 0.05, ease: 'easeOut' }}
                          style={{ background: col }} />
                      </div>
                      <span className="text-xs font-bold w-12 text-right" style={{ color: col }}>
                        {Math.round(s.score)}
                      </span>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </Card>
        </motion.div>

        {/* Alertes récentes */}
        <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}>
          <Card>
            <CardTitle className="mb-4">Alertes récentes</CardTitle>
            {alertes.length === 0 ? (
              <p className="text-gray-600 text-sm text-center py-6">🤫 Aucune alerte</p>
            ) : (
              <div className="space-y-2">
                {alertes.map((a, i) => {
                  const isCrit = a.type_alerte === 'critical'
                  const heure  = a.horodatage ? new Date(a.horodatage).toLocaleTimeString('fr-FR') : '—'
                  return (
                    <motion.div key={a.id}
                      initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.04 }}
                      className="flex items-center gap-3 p-2.5 rounded-lg"
                      style={{ background: isCrit ? 'rgba(239,68,68,0.07)' : 'rgba(245,158,11,0.06)' }}>
                      <span className="text-base">{isCrit ? '🔴' : '🟠'}</span>
                      <span className="text-xs font-mono w-14 flex-shrink-0" style={{ color: '#6B6357' }}>{heure}</span>
                      <span className="text-sm font-semibold flex-1" style={{ color: '#2D2A24' }}>{a.prenom}</span>
                      <span className="text-xs font-bold" style={{ color: isCrit ? '#E74C3C' : '#E67E22' }}>
                        {a.niveau_db?.toFixed(1)} dB
                      </span>
                      <Badge variant="default" className="text-xs">{a.classe}</Badge>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
