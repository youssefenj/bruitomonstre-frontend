import { useState, useEffect } from 'react'
import { getScores, getAlertes } from '../../api'

export default function Dashboard() {
  const [scores, setScores]   = useState([])
  const [alertes, setAlertes] = useState([])

  useEffect(() => {
    getScores().then(r => setScores(r.data))
    getAlertes(null, 10).then(r => setAlertes(r.data))
  }, [])

  const totalAlertes = scores.reduce((s, x) => s + x.nb_alertes, 0)
  const scoreMoyen   = scores.length ? Math.round(scores.reduce((s, x) => s + x.score, 0) / scores.length) : 0

  const kpis = [
    { label: 'Classes actives', val: scores.length,  icon: '🏫', col: '#2D6A4F', bg: '#D8F3DC' },
    { label: 'Score moyen',     val: scoreMoyen,      icon: '🎯', col: scoreMoyen >= 80 ? '#2D6A4F' : '#D4761B', bg: scoreMoyen >= 80 ? '#D8F3DC' : '#FEF3E2' },
    { label: 'Alertes totales', val: totalAlertes,    icon: '🔔', col: '#C0392B', bg: '#FDECEA' },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Titre */}
      <div className="flex items-center gap-3">
        <div className="w-1 h-7 rounded-full" style={{ background: 'linear-gradient(#2D6A4F, #52B788)' }} />
        <h2 className="text-2xl font-bold" style={{ fontFamily: 'Georgia', color: '#15803D' }}>
          Tableau de bord
        </h2>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        {kpis.map(k => (
          <div key={k.label}
            className="rounded-2xl p-5 text-center"
            style={{
              background: '#FFFFFF',
              border: '1.5px solid #EDE8DF',
              boxShadow: '0 2px 12px rgba(45,106,79,0.07)',
            }}>
            <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl text-2xl mb-3"
              style={{ background: k.bg }}>
              {k.icon}
            </div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#6B6357' }}>
              {k.label}
            </p>
            <p className="text-4xl font-bold" style={{ color: k.col }}>{k.val}</p>
          </div>
        ))}
      </div>

      {/* Alertes récentes */}
      <div className="rounded-2xl overflow-hidden"
        style={{
          background: '#FFFFFF',
          border: '1.5px solid #EDE8DF',
          boxShadow: '0 2px 12px rgba(45,106,79,0.07)',
        }}>
        <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: '#EDE8DF', background: '#FAFAF8' }}>
          <span>🔔</span>
          <h3 className="text-sm font-bold uppercase tracking-widest" style={{ color: '#6B6357' }}>
            Alertes récentes
          </h3>
        </div>
        <div className="px-5">
          {alertes.length === 0 && (
            <p className="text-sm py-8 text-center" style={{ color: '#B0A496' }}>Aucune alerte pour le moment.</p>
          )}
          {alertes.map(a => {
            const isCrit = a.type_alerte === 'critical'
            return (
              <div key={a.id}
                className="flex items-center gap-3 py-3 border-b last:border-0"
                style={{ borderColor: '#F5F2EE' }}>
                <span className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: isCrit ? '#C0392B' : '#D4761B' }} />
                <span className="text-xs w-16 flex-shrink-0" style={{ color: '#B0A496' }}>
                  {a.horodatage ? new Date(a.horodatage).toLocaleTimeString('fr-FR') : '—'}
                </span>
                <span className="text-sm font-semibold flex-1" style={{ color: '#2D2A24' }}>{a.prenom}</span>
                <span className="text-sm font-bold" style={{ color: isCrit ? '#C0392B' : '#D4761B' }}>
                  {a.niveau_db.toFixed(1)} dB
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                  style={{
                    background: isCrit ? '#FDECEA' : '#FEF3E2',
                    color: isCrit ? '#C0392B' : '#D4761B',
                  }}>
                  {a.classe}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
