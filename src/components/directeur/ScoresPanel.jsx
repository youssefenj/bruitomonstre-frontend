import { useState, useEffect } from 'react'
import { getScores, resetScore } from '../../api'

const MEDALS = ['🥇', '🥈', '🥉']

export default function ScoresPanel() {
  const [scores, setScores] = useState([])

  const charger = () => getScores().then(r => setScores(r.data))
  useEffect(() => { charger() }, [])

  const handleReset = async (classe) => {
    if (!confirm(`Remettre le score de ${classe} à 100 ?`)) return
    await resetScore(classe)
    charger()
  }

  return (
    <div className="p-6">
      {/* Titre */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-7 rounded-full" style={{ background: 'linear-gradient(#2D6A4F, #52B788)' }} />
        <h2 className="text-2xl font-bold" style={{ fontFamily: 'Georgia', color: '#15803D' }}>
          Classement des classes
        </h2>
      </div>

      {scores.length === 0 && (
        <p className="text-sm text-center py-12" style={{ color: '#B0A496' }}>Aucune classe active.</p>
      )}

      <div className="space-y-3">
        {scores.map((s, i) => {
          const col   = s.score >= 80 ? '#2D6A4F' : s.score >= 60 ? '#D4761B' : '#C0392B'
          const bgBar = s.score >= 80 ? '#D8F3DC' : s.score >= 60 ? '#FEF3E2' : '#FDECEA'
          return (
            <div key={s.id}
              className="flex items-center gap-4 px-5 py-4 rounded-2xl"
              style={{
                background: '#FFFFFF',
                border: '1.5px solid #EDE8DF',
                boxShadow: '0 2px 10px rgba(45,106,79,0.07)',
              }}>
              {/* Rang */}
              <div className="w-8 text-center">
                {i < 3
                  ? <span className="text-xl">{MEDALS[i]}</span>
                  : <span className="text-lg font-bold" style={{ color: '#D6CEBE' }}>{i + 1}</span>
                }
              </div>

              {/* Nom classe */}
              <span className="flex-1 text-sm font-semibold" style={{ color: '#2D2A24' }}>{s.classe}</span>

              {/* Barre de progression */}
              <div className="flex items-center gap-3 w-52">
                <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: bgBar }}>
                  <div className="h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${s.score}%`, background: `linear-gradient(90deg, ${col}, ${col}AA)` }} />
                </div>
                <span className="text-sm font-bold w-14 text-right" style={{ color: col }}>
                  {Math.round(s.score)}/100
                </span>
              </div>

              {/* Bouton reset */}
              <button onClick={() => handleReset(s.classe)}
                className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-all duration-150"
                style={{ border: '1.5px solid #D6CEBE', color: '#6B6357', background: 'transparent' }}
                onMouseEnter={e => { e.target.style.borderColor = '#C0392B'; e.target.style.color = '#C0392B' }}
                onMouseLeave={e => { e.target.style.borderColor = '#D6CEBE'; e.target.style.color = '#6B6357' }}>
                Reset
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
