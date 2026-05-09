import { useState, useEffect } from 'react'
import { getScore, getAlertes } from '../../api'

export default function StatsPanel({ user }) {
  const [score, setScore]     = useState(null)
  const [alertes, setAlertes] = useState([])

  useEffect(() => {
    getScore(user.classe).then(r => setScore(r.data))
    getAlertes(user.classe, 100).then(r => setAlertes(r.data))
  }, [user.classe])

  if (!score) return <p className="p-6" style={{ color: '#B0A496' }}>Chargement…</p>

  const scoreColor = score.score >= 80 ? '#2D6A4F' : score.score >= 60 ? '#D4761B' : '#C0392B'
  const scoreBg    = score.score >= 80 ? '#D8F3DC' : score.score >= 60 ? '#FEF3E2' : '#FDECEA'

  const kpis = [
    { label: 'Score silence',     val: Math.round(score.score), icon: '🎯', col: scoreColor, bg: scoreBg },
    { label: 'Total alertes',     val: score.nb_alertes,        icon: '🔔', col: '#2D6A4F',  bg: '#D8F3DC' },
    { label: 'Alertes warning',   val: score.nb_warning,        icon: '🟠', col: '#D4761B',  bg: '#FEF3E2' },
    { label: 'Alertes critiques', val: score.nb_critical,       icon: '🔴', col: '#C0392B',  bg: '#FDECEA' },
  ]

  const parEleve   = alertes.reduce((acc, a) => { acc[a.prenom] = (acc[a.prenom] || 0) + 1; return acc }, {})
  const classement = Object.entries(parEleve).sort((a, b) => b[1] - a[1]).slice(0, 5)

  return (
    <div className="p-6 space-y-6">
      {/* Titre */}
      <div className="flex items-center gap-3">
        <div className="w-1 h-7 rounded-full" style={{ background: 'linear-gradient(#2D6A4F, #52B788)' }} />
        <h2 className="text-2xl font-bold" style={{ fontFamily: 'Georgia', color: '#1A3D2B' }}>
          Statistiques — {user.classe}
        </h2>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {kpis.map(k => (
          <div key={k.label}
            className="rounded-2xl p-5 text-center"
            style={{
              background: '#FFFFFF',
              border: '1.5px solid #EDE8DF',
              boxShadow: '0 2px 10px rgba(45,106,79,0.07)',
            }}>
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl text-xl mb-3"
              style={{ background: k.bg }}>
              {k.icon}
            </div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#6B6357' }}>
              {k.label}
            </p>
            <p className="text-4xl font-bold tabular-nums" style={{ color: k.col }}>{k.val}</p>
          </div>
        ))}
      </div>

      {/* Top élèves bruyants */}
      {classement.length > 0 && (
        <div className="rounded-2xl overflow-hidden"
          style={{
            background: '#FFFFFF',
            border: '1.5px solid #EDE8DF',
            boxShadow: '0 2px 10px rgba(45,106,79,0.07)',
          }}>
          <div className="px-5 py-4 border-b flex items-center gap-2"
            style={{ borderColor: '#EDE8DF', background: '#FAFAF8' }}>
            <span>📢</span>
            <h3 className="text-sm font-bold uppercase tracking-widest" style={{ color: '#6B6357' }}>
              Top élèves bruyants
            </h3>
          </div>
          <div className="px-5 py-4 space-y-3">
            {classement.map(([prenom, nb], i) => (
              <div key={prenom} className="flex items-center gap-3">
                <span className="text-sm font-bold w-5 text-right" style={{ color: '#D6CEBE' }}>{i + 1}</span>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 text-white"
                  style={{ background: i === 0 ? '#C8A96E' : '#40916C' }}>
                  {prenom[0]}
                </div>
                <span className="flex-1 text-sm font-medium" style={{ color: '#2D2A24' }}>{prenom}</span>
                <div className="flex items-center gap-3">
                  <div className="h-2 rounded-full overflow-hidden" style={{ width: 120, background: '#EDE8DF' }}>
                    <div className="h-2 rounded-full"
                      style={{
                        width: `${(nb / classement[0][1]) * 100}%`,
                        background: 'linear-gradient(90deg, #D4761B, #E67E22)',
                      }} />
                  </div>
                  <span className="text-sm font-bold w-6 text-right" style={{ color: '#D4761B' }}>{nb}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
