'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getScoresAll, resetScore } from '../../lib/api'
import { Card, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'

export default function ScoresPanel() {
  const [scores,  setScores]  = useState([])
  const [loading, setLoading] = useState(true)

  const charger = () => {
    setLoading(true)
    getScoresAll().then(r => setScores(r.data)).finally(() => setLoading(false))
  }
  useEffect(() => { charger() }, [])

  const handleReset = async (classe) => {
    if (!confirm(`Remettre le score de la classe ${classe} à 100 ?`)) return
    await resetScore(classe)
    charger()
  }

  const MEDALS = ['🥇', '🥈', '🥉']

  return (
    <div className="p-5">
      <motion.div className="flex items-center justify-between mb-5"
        initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <h2 className="text-xl font-bold" style={{ color: '#15803D' }}>Classement des classes</h2>
          <p className="text-sm mt-0.5" style={{ color: '#6B6357' }}>{scores.length} classe(s) enregistrée(s)</p>
        </div>
        <Button variant="ghost" size="sm" onClick={charger}>↻ Actualiser</Button>
      </motion.div>

      {loading ? (
        <div className="flex justify-center h-40 items-center">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-7 h-7 border-2 border-warning/30 border-t-warning rounded-full" />
        </div>
      ) : scores.length === 0 ? (
        <Card className="text-center py-16">
          <p className="text-4xl mb-3">🏫</p>
          <p className="text-gray-500">Aucune classe active.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {scores
              .sort((a, b) => b.score - a.score)
              .map((s, i) => {
                const col    = s.score >= 80 ? '#27AE60' : s.score >= 60 ? '#D4761B' : '#C0392B'
                const medal  = MEDALS[i] ?? `#${i + 1}`
                const isTop  = i < 3
                return (
                  <motion.div key={s.id}
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}>
                    <Card className={`flex items-center gap-4 py-4 px-5 ${isTop ? 'gradient-border' : ''}`}
                      style={isTop ? { background: 'rgba(45,106,79,0.03)' } : {}}>
                      <span className="text-2xl w-8 flex-shrink-0">{medal}</span>
                      <div className="flex-1">
                        <p className="font-bold" style={{ color: '#2D2A24' }}>{s.classe}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: '#EDE8DF' }}>
                            <motion.div className="h-full rounded-full"
                              initial={{ width: 0 }} animate={{ width: `${s.score}%` }}
                              transition={{ duration: 1, delay: i * 0.05 + 0.1, ease: 'easeOut' }}
                              style={{ background: col, boxShadow: `0 0 8px ${col}60` }} />
                          </div>
                          <span className="text-sm font-bold w-14 flex-shrink-0" style={{ color: col }}>
                            {Math.round(s.score)}/100
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Alertes</p>
                          <p className="text-sm font-bold" style={{ color: '#C0392B' }}>{s.nb_alertes ?? 0}</p>
                        </div>
                        <Badge variant={s.score >= 80 ? 'success' : s.score >= 60 ? 'warning' : 'danger'}>
                          {s.score >= 80 ? '✓ Excellent' : s.score >= 60 ? '~ Correct' : '✗ Difficile'}
                        </Badge>
                        <Button variant="ghost" size="sm" onClick={() => handleReset(s.classe)}>
                          Reset
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                )
              })}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
