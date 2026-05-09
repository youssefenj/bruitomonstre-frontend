import { useState, useEffect } from 'react'
import { getScores } from '../../api'

const RECOMPENSES = [
  { emoji: '💧', titre: 'Visite Aquaparc',   desc: "Journée à l'Aquaparc" },
  { emoji: '🌳', titre: 'Parc Naturel',       desc: 'Excursion nature' },
  { emoji: '🎠', titre: "Parc d'Attractions", desc: 'Visite parc attractions' },
  { emoji: '🎭', titre: 'Sortie Surprise',     desc: 'Le directeur choisit !' },
]

export default function Recompenses() {
  const [scores, setScores]       = useState([])
  const [attribue, setAttribue]   = useState(null)

  useEffect(() => { getScores().then(r => setScores(r.data)) }, [])

  const gagnant = scores[0]

  return (
    <div className="p-6 space-y-6">
      {/* Titre */}
      <div className="flex items-center gap-3">
        <div className="w-1 h-7 rounded-full" style={{ background: 'linear-gradient(#2D6A4F, #52B788)' }} />
        <h2 className="text-2xl font-bold" style={{ fontFamily: 'Georgia', color: '#15803D' }}>
          Récompenses semestrielles
        </h2>
      </div>
      <p className="text-sm italic" style={{ color: '#6B6357' }}>
        La classe la plus calme gagne une sortie spéciale ! 🏆
      </p>

      {/* Bandeau gagnant */}
      {gagnant && (
        <div className="rounded-2xl p-6 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #1A3D2B, #2D6A4F)',
            boxShadow: '0 8px 32px rgba(26,61,43,0.30)',
          }}>
          {/* Orbe décoratif */}
          <div style={{
            position: 'absolute', right: -30, top: -30,
            width: 140, height: 140, borderRadius: '50%',
            background: 'rgba(82,183,136,0.15)', pointerEvents: 'none',
          }} />
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#C8A96E' }}>
            🥇 Classe gagnante — Semestre actuel
          </p>
          <p className="text-3xl font-bold text-white" style={{ fontFamily: 'Georgia' }}>{gagnant.classe}</p>
          <p className="text-sm mt-2" style={{ color: '#D8F3DC' }}>
            Score de silence : <strong>{Math.round(gagnant.score)}/100</strong>
          </p>
        </div>
      )}

      {/* Grille récompenses */}
      <div className="grid grid-cols-4 gap-4">
        {RECOMPENSES.map(r => (
          <div key={r.titre}
            className="rounded-2xl p-5 text-center flex flex-col"
            style={{
              background: '#FFFFFF',
              border: '1.5px solid #EDE8DF',
              boxShadow: '0 2px 10px rgba(45,106,79,0.07)',
            }}>
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl text-3xl mx-auto mb-3"
              style={{ background: '#D8F3DC' }}>
              {r.emoji}
            </div>
            <p className="font-bold text-sm mb-1" style={{ color: '#1A3D2B' }}>{r.titre}</p>
            <p className="text-xs mb-4 flex-1" style={{ color: '#6B6357' }}>{r.desc}</p>
            <button onClick={() => setAttribue(r.titre)}
              className="w-full py-2.5 rounded-xl text-white text-xs font-bold"
              style={{
                background: 'linear-gradient(135deg, #2D6A4F, #40916C)',
                boxShadow: '0 3px 10px rgba(45,106,79,0.30)',
              }}>
              Attribuer ✓
            </button>
          </div>
        ))}
      </div>

      {/* Modal confirmation */}
      {attribue && (
        <div className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: 'rgba(26,61,43,0.55)', backdropFilter: 'blur(4px)' }}>
          <div className="rounded-3xl p-8 text-center max-w-sm"
            style={{
              background: '#FAF7F2',
              boxShadow: '0 32px 80px rgba(0,0,0,0.30)',
              border: '1.5px solid #EDE8DF',
            }}>
            <div className="text-6xl mb-4">🎉</div>
            <p className="font-bold text-xl mb-2" style={{ color: '#1A3D2B', fontFamily: 'Georgia' }}>
              Félicitations !
            </p>
            <p className="text-sm mb-6" style={{ color: '#6B6357' }}>
              <strong style={{ color: '#2D6A4F' }}>{gagnant?.classe}</strong> remporte :{' '}
              <strong style={{ color: '#1A3D2B' }}>{attribue}</strong> !
            </p>
            <button onClick={() => setAttribue(null)}
              className="px-8 py-2.5 rounded-xl text-white font-bold text-sm"
              style={{
                background: 'linear-gradient(135deg, #2D6A4F, #40916C)',
                boxShadow: '0 4px 14px rgba(45,106,79,0.30)',
              }}>
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
