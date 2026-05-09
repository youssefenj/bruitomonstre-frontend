'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getScoresAll } from '../../lib/api'
import { Card, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'

const RECOMPENSES = [
  { emoji: '💧', titre: 'Visite Aquaparc',     desc: "Journée à l'Aquaparc",       color: '#0EA5E9' },
  { emoji: '🌳', titre: 'Parc Naturel',         desc: 'Excursion en pleine nature', color: '#27AE60' },
  { emoji: '🎠', titre: "Parc d'Attractions",   desc: 'Visite parc attractions',    color: '#D4761B' },
  { emoji: '🎭', titre: 'Sortie Surprise',       desc: 'Le directeur choisit !',     color: '#8B5CF6' },
]

function Confetti() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div key={i}
          className="absolute w-2 h-2 rounded-sm"
          style={{
            left: `${Math.random() * 100}%`,
            top: '-10px',
            background: ['#6366F1','#D4761B','#27AE60','#EC4899','#C0392B'][i % 5],
          }}
          animate={{ y: [0, 700], rotate: [0, 720], opacity: [1, 0] }}
          transition={{ duration: 2 + Math.random() * 1.5, delay: Math.random() * 0.5, ease: 'linear' }}
        />
      ))}
    </div>
  )
}

export default function Recompenses() {
  const [scores,   setScores]   = useState([])
  const [attribue, setAttribue] = useState(null)
  const [confetti, setConfetti] = useState(false)

  useEffect(() => { getScoresAll().then(r => setScores(r.data)) }, [])

  const classement = [...scores].sort((a, b) => b.score - a.score)
  const gagnant    = classement[0]

  const attribuer = (r) => {
    setAttribue(r)
    setConfetti(true)
    setTimeout(() => setConfetti(false), 2500)
  }

  return (
    <div className="p-5 space-y-5">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-xl font-bold" style={{ color: '#15803D' }}>🏆 Récompenses semestrielles</h2>
        <p className="text-sm mt-0.5" style={{ color: '#6B6357' }}>La classe la plus calme gagne une sortie spéciale !</p>
      </motion.div>

      {/* Gagnante */}
      {gagnant && (
        <motion.div
          className="relative overflow-hidden rounded-2xl p-6"
          style={{ background: 'linear-gradient(135deg, #1E1B4B, #2D1D4A, #1E1B4B)' }}
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        >
          {/* Stars bg */}
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div key={i}
              className="absolute w-1 h-1 rounded-full bg-white"
              style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, opacity: 0.3 }}
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
            />
          ))}
          <div className="relative z-10 flex items-center gap-5">
            <motion.div className="text-6xl"
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity }}>🏆</motion.div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#E67E22' }}>
                🥇 Classe gagnante — Semestre actuel
              </p>
              <p className="text-4xl font-bold text-white mt-1">{gagnant.classe}</p>
              <div className="flex items-center gap-3 mt-2">
                <Badge variant="success">Score : {Math.round(gagnant.score)}/100</Badge>
                <Badge variant="default">🔔 {gagnant.nb_alertes ?? 0} alertes</Badge>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Récompenses cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {RECOMPENSES.map((r, i) => (
          <motion.div key={r.titre}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.08 }}
            whileHover={{ scale: 1.03 }}
          >
            <Card className="text-center flex flex-col py-6 gap-3 relative overflow-hidden">
              <div className="absolute inset-0 opacity-5 pointer-events-none"
                style={{ background: `radial-gradient(circle at 50% 0%, ${r.color}, transparent)` }} />
              <motion.p className="text-4xl relative z-10"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 2 + i * 0.3, repeat: Infinity, ease: 'easeInOut' }}>
                {r.emoji}
              </motion.p>
              <div className="relative z-10">
                <p className="font-bold text-sm" style={{ color: '#1A3D2B' }}>{r.titre}</p>
                <p className="text-xs text-gray-500 mt-0.5">{r.desc}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="relative z-10 mx-2"
                onClick={() => attribuer(r)}
                style={{ borderColor: `${r.color}40`, color: r.color }}
              >
                Attribuer
              </Button>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Classement */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
        <Card>
          <CardTitle className="mb-4">Classement complet</CardTitle>
          <div className="space-y-2">
            {classement.map((s, i) => {
              const col = s.score >= 80 ? '#27AE60' : s.score >= 60 ? '#D4761B' : '#C0392B'
              const medals = ['🥇', '🥈', '🥉']
              return (
                <div key={s.id} className="flex items-center gap-3 py-2">
                  <span className="text-lg w-8">{medals[i] ?? `${i + 1}.`}</span>
                  <span className="flex-1 text-sm font-medium" style={{ color: '#2D2A24' }}>{s.classe}</span>
                  <div className="w-32 h-2 rounded-full overflow-hidden" style={{ background: '#EDE8DF' }}>
                    <motion.div className="h-full rounded-full"
                      initial={{ width: 0 }} animate={{ width: `${s.score}%` }}
                      transition={{ duration: 1, delay: i * 0.07 }}
                      style={{ background: col }} />
                  </div>
                  <span className="text-sm font-bold w-16 text-right" style={{ color: col }}>
                    {Math.round(s.score)}/100
                  </span>
                </div>
              )
            })}
          </div>
        </Card>
      </motion.div>

      {/* Modal récompense */}
      <AnimatePresence>
        {attribue && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50"
            style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setAttribue(null)}
          >
            {confetti && <Confetti />}
            <motion.div
              className="relative text-center rounded-3xl p-10 max-w-sm mx-4"
              style={{ background: '#FFFFFF', border: '1px solid rgba(45,106,79,0.12)' }}
              initial={{ scale: 0.7, y: 40 }} animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', bounce: 0.4 }}
              onClick={e => e.stopPropagation()}
            >
              <motion.p className="text-7xl mb-5"
                animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 1, repeat: 2 }}>
                {attribue.emoji}
              </motion.p>
              <p className="text-sm font-semibold text-gray-400 mb-1 uppercase tracking-widest">Récompense attribuée</p>
              <p className="text-2xl font-bold mb-1" style={{ color: '#1A3D2B' }}>{attribue.titre}</p>
              {gagnant && (
                <p className="text-lg font-bold mt-2" style={{ color: '#E67E22' }}>
                  🥇 {gagnant.classe}
                </p>
              )}
              <p className="text-gray-500 text-sm mt-1">Félicitations à toute la classe !</p>
              <Button variant="primary" size="lg" className="mt-6 w-full" onClick={() => setAttribue(null)}>
                🎉 Fermer
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
