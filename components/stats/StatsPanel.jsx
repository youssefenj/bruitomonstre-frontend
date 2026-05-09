'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getScores, getAlertes } from '../../lib/api'
import { Card, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'

const AVATAR_COLORS = ['#2D6A4F','#40916C','#C8A96E','#D4761B','#C0392B']

export default function StatsPanel({ user }) {
  const [score,   setScore]   = useState(null)
  const [alertes, setAlertes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getScores(user.classe),
      getAlertes(user.classe, 100),
    ]).then(([s, a]) => {
      setScore(s.data)
      setAlertes(a.data)
    }).finally(() => setLoading(false))
  }, [user.classe])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-8 h-8 rounded-full"
        style={{ border: '2px solid rgba(45,106,79,0.25)', borderTopColor: '#2D6A4F' }} />
    </div>
  )

  if (!score) return <p className="p-6" style={{ color: '#6B6357' }}>Aucune donnée disponible.</p>

  const scoreColor = score.score >= 80 ? '#27AE60' : score.score >= 60 ? '#D4761B' : '#C0392B'

  const parEleve = alertes.reduce((acc, a) => {
    acc[a.prenom] = (acc[a.prenom] || 0) + 1
    return acc
  }, {})
  const classement = Object.entries(parEleve).sort((a, b) => b[1] - a[1]).slice(0, 5)
  const maxVal = classement[0]?.[1] || 1

  const kpis = [
    { icon: '🎯', label: 'Score silence',     val: Math.round(score.score ?? 0), variant: 'primary',  suffix: '/100' },
    { icon: '🔔', label: 'Total alertes',     val: score.nb_alertes ?? 0,        variant: 'default' },
    { icon: '🟠', label: 'Alertes warning',   val: score.nb_warning ?? 0,        variant: 'warning' },
    { icon: '🔴', label: 'Alertes critiques', val: score.nb_critical ?? 0,       variant: 'danger' },
  ]

  return (
    <div className="p-5 space-y-5">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-xl font-bold" style={{ color: '#1A3D2B' }}>Statistiques — Classe {user.classe}</h2>
        <p className="text-sm mt-0.5" style={{ color: '#6B6357' }}>Vue d'ensemble de la session</p>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpis.map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}>
            <Card className="text-center py-5">
              <p className="text-2xl mb-2">{k.icon}</p>
              <p className="text-xs mb-1" style={{ color: '#6B6357' }}>{k.label}</p>
              <p className="text-4xl font-bold" style={{
                color: k.variant === 'primary' ? scoreColor
                     : k.variant === 'warning' ? '#D4761B'
                     : k.variant === 'danger'  ? '#C0392B'
                     : '#1A3D2B'
              }}>
                {k.val}
                {k.suffix && <span className="text-lg ml-1" style={{ color: '#6B6357' }}>{k.suffix}</span>}
              </p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Score ring */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
          <Card className="flex flex-col items-center py-8">
            <CardTitle className="mb-6">Score global</CardTitle>
            <div className="relative w-36 h-36">
              <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#EDE8DF" strokeWidth="10" />
                <motion.circle
                  cx="60" cy="60" r="50" fill="none"
                  stroke={scoreColor} strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 50}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 50 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 50 * (1 - score.score / 100) }}
                  transition={{ duration: 1.2, ease: 'easeOut', delay: 0.4 }}
                  style={{ filter: `drop-shadow(0 0 8px ${scoreColor})` }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold" style={{ color: scoreColor }}>
                  {Math.round(score.score)}
                </span>
                <span className="text-xs" style={{ color: '#6B6357' }}>/ 100</span>
              </div>
            </div>
            <p className="text-sm font-medium mt-4" style={{ color: scoreColor }}>
              {score.score >= 80 ? '🟢 Excellent !' : score.score >= 60 ? '🟠 Passable' : '🔴 À améliorer'}
            </p>
          </Card>
        </motion.div>

        {/* Top bruyants */}
        {classement.length > 0 && (
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}>
            <Card>
              <CardTitle className="mb-4">🏆 Top élèves bruyants</CardTitle>
              <div className="space-y-3">
                {classement.map(([prenom, nb], i) => (
                  <motion.div key={prenom} className="flex items-center gap-3"
                    initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.06 }}>
                    <span className="text-xs font-bold w-4" style={{ color: '#6B6357' }}>#{i + 1}</span>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: `${AVATAR_COLORS[i]}20`, color: AVATAR_COLORS[i] }}>
                      {prenom[0].toUpperCase()}
                    </div>
                    <span className="flex-1 text-sm font-medium" style={{ color: '#1A3D2B' }}>{prenom}</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 rounded-full transition-all"
                        style={{ width: `${(nb / maxVal) * 80}px`, background: AVATAR_COLORS[i] }} />
                      <Badge variant="default">{nb}</Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}
