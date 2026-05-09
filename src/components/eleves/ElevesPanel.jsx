import { useState, useEffect } from 'react'
import { getEleves, deleteEleve } from '../../api'
import InscriptionModal from './InscriptionModal'

const COLORS = ['#2D6A4F', '#40916C', '#52B788', '#1A3D2B', '#C8A96E']

export default function ElevesPanel({ user }) {
  const [eleves, setEleves]   = useState([])
  const [modal, setModal]     = useState(false)
  const [loading, setLoading] = useState(true)

  const charger = async () => {
    setLoading(true)
    try {
      const res = await getEleves(user.classe)
      setEleves(res.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { charger() }, [user.classe])

  const supprimer = async (id, prenom) => {
    if (!confirm(`Supprimer ${prenom} ?`)) return
    await deleteEleve(id)
    charger()
  }

  return (
    <div className="p-6">
      {/* En-tête */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-1 h-7 rounded-full" style={{ background: 'linear-gradient(#2D6A4F, #52B788)' }} />
          <div>
            <h2 className="text-2xl font-bold" style={{ fontFamily: 'Georgia', color: '#1A3D2B' }}>Mes élèves</h2>
            <p className="text-sm" style={{ color: '#6B6357' }}>{user.classe} — {eleves.length} élève(s)</p>
          </div>
        </div>
        <button onClick={() => setModal(true)}
          className="px-5 py-2.5 rounded-xl font-bold text-white text-sm"
          style={{
            background: 'linear-gradient(135deg, #2D6A4F, #40916C)',
            boxShadow: '0 4px 14px rgba(45,106,79,0.30)',
          }}>
          + Inscrire un élève
        </button>
      </div>

      {loading ? (
        <p className="text-center py-12" style={{ color: '#B0A496' }}>Chargement…</p>
      ) : eleves.length === 0 ? (
        <div className="text-center py-16" style={{ color: '#B0A496' }}>
          <div className="text-5xl mb-3">👦</div>
          <p className="font-medium">Aucun élève inscrit.</p>
          <p className="text-sm mt-1">Cliquez sur "+ Inscrire un élève" pour commencer.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {eleves.map((e, i) => (
            <div key={e.id}
              className="flex items-center gap-4 px-5 py-4 rounded-2xl"
              style={{
                background: '#FFFFFF',
                border: '1.5px solid #EDE8DF',
                boxShadow: '0 2px 10px rgba(45,106,79,0.06)',
              }}>
              {/* Avatar coloré */}
              <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 text-white"
                style={{ background: COLORS[i % COLORS.length] }}>
                {e.prenom[0].toUpperCase()}
              </div>

              {/* Infos */}
              <div className="flex-1">
                <p className="font-semibold" style={{ color: '#2D2A24' }}>{e.prenom} {e.nom}</p>
                <span className="inline-flex items-center gap-1 text-xs mt-0.5 px-2 py-0.5 rounded-full"
                  style={{
                    background: e.a_empreinte ? '#D8F3DC' : '#FEF3E2',
                    color: e.a_empreinte ? '#2D6A4F' : '#D4761B',
                  }}>
                  {e.a_empreinte ? '🎙️ Voix enregistrée' : '⚠️ Pas de voix enregistrée'}
                </span>
              </div>

              {/* Supprimer */}
              <button onClick={() => supprimer(e.id, e.prenom)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-base transition-all"
                style={{ color: '#D6CEBE', background: 'transparent' }}
                onMouseEnter={e => { e.target.style.background = '#FDECEA'; e.target.style.color = '#C0392B' }}
                onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = '#D6CEBE' }}>
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <InscriptionModal user={user} onClose={() => setModal(false)} onSuccess={charger} />
      )}
    </div>
  )
}
