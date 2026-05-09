'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getEleves, deleteEleve } from '../../lib/api'
import InscriptionModal from './InscriptionModal'
import { Button } from '../ui/button'
import { Card, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'

const AVATAR_COLORS = [
  ['#2D6A4F', '#52B788'], ['#40916C', '#74C69D'],
  ['#1A3D2B', '#40916C'], ['#C8A96E', '#E8C88E'],
  ['#D4761B', '#E67E22'], ['#C0392B', '#E74C3C'],
]

function getAvatarColor(str) {
  let hash = 0
  for (let c of str) hash = c.charCodeAt(0) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

export default function ElevesPanel({ user }) {
  const [eleves,  setEleves]  = useState([])
  const [modal,   setModal]   = useState(false)
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')

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
    if (!confirm(`Supprimer ${prenom} de la classe ?`)) return
    await deleteEleve(id)
    charger()
  }

  const filtered = eleves.filter(e =>
    `${e.prenom} ${e.nom}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-5 h-full flex flex-col">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between mb-5"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h2 className="text-xl font-bold" style={{ color: '#1A3D2B' }}>Mes élèves</h2>
          <p className="text-sm" style={{ color: '#6B6357' }}>
            Classe {user.classe} — <span className="font-medium" style={{ color: '#40916C' }}>{eleves.length} élève(s)</span>
          </p>
        </div>
        <Button variant="primary" onClick={() => setModal(true)}>
          + Inscrire un élève
        </Button>
      </motion.div>

      {/* Search */}
      {eleves.length > 0 && (
        <motion.div className="mb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Rechercher un élève..."
            className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
            style={{
              background: '#FFFFFF',
              border: '1.5px solid #D6CEBE',
              color: '#2D2A24',
            }}
            onFocus={e => e.target.style.borderColor = '#2D6A4F'}
            onBlur={e => e.target.style.borderColor = '#D6CEBE'}
          />
        </motion.div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8 rounded-full"
              style={{ border: '2px solid rgba(45,106,79,0.25)', borderTopColor: '#2D6A4F' }}
            />
          </div>
        ) : eleves.length === 0 ? (
          <motion.div
            className="flex flex-col items-center justify-center h-48"
            style={{ color: '#6B6357' }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <span className="text-5xl mb-3">👦</span>
            <p className="font-medium">Aucun élève inscrit.</p>
            <p className="text-sm mt-1">Cliquez sur "Inscrire un élève" pour commencer.</p>
          </motion.div>
        ) : (
          <div className="grid gap-2">
            <AnimatePresence>
              {filtered.map((e, i) => {
                const [bg, text] = getAvatarColor(e.prenom)
                return (
                  <motion.div
                    key={e.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-4 p-4 rounded-xl transition-all group"
                    style={{
                      background: '#FFFFFF',
                      border: '1.5px solid #EDE8DF',
                      boxShadow: '0 1px 4px rgba(45,106,79,0.05)',
                    }}
                    onMouseEnter={el => el.currentTarget.style.borderColor = 'rgba(45,106,79,0.35)'}
                    onMouseLeave={el => el.currentTarget.style.borderColor = '#EDE8DF'}
                  >
                    {/* Avatar */}
                    <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-base flex-shrink-0"
                      style={{ background: `${bg}20`, color: text, border: `2px solid ${bg}40` }}>
                      {e.prenom[0].toUpperCase()}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm" style={{ color: '#1A3D2B' }}>{e.prenom} {e.nom}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {e.a_empreinte ? (
                          <Badge variant="success">🎙️ Voix enregistrée</Badge>
                        ) : (
                          <Badge variant="warning">⚠️ Sans voix</Badge>
                        )}
                      </div>
                    </div>
                    {/* Delete */}
                    <button
                      onClick={() => supprimer(e.id, e.prenom)}
                      className="opacity-0 group-hover:opacity-100 transition-all text-sm px-3 py-1.5 rounded-lg"
                      style={{ color: '#6B6357' }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#E74C3C'; e.currentTarget.style.background = 'rgba(192,57,43,0.08)' }}
                      onMouseLeave={e => { e.currentTarget.style.color = '#6B6357'; e.currentTarget.style.background = 'transparent' }}
                    >
                      ✕
                    </button>
                  </motion.div>
                )
              })}
            </AnimatePresence>
            {filtered.length === 0 && search && (
              <p className="text-center py-8 text-sm" style={{ color: '#6B6357' }}>Aucun résultat pour "{search}"</p>
            )}
          </div>
        )}
      </div>

      {modal && <InscriptionModal user={user} onClose={() => setModal(false)} onSuccess={charger} />}
    </div>
  )
}
