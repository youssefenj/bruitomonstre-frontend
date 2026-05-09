import { useState, useEffect } from 'react'
import { getAlertes } from '../../api'

export default function AlertesPanel() {
  const [alertes, setAlertes] = useState([])

  useEffect(() => {
    getAlertes(null, 100).then(r => setAlertes(r.data))
  }, [])

  return (
    <div className="p-6">
      {/* Titre */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-7 rounded-full" style={{ background: 'linear-gradient(#2D6A4F, #52B788)' }} />
        <h2 className="text-2xl font-bold" style={{ fontFamily: 'Georgia', color: '#15803D' }}>
          Journal complet — toutes classes
        </h2>
      </div>

      <div className="rounded-2xl overflow-hidden"
        style={{
          background: '#FFFFFF',
          border: '1.5px solid #EDE8DF',
          boxShadow: '0 2px 12px rgba(45,106,79,0.07)',
        }}>
        {/* En-tête tableau */}
        <div className="grid grid-cols-5 px-5 py-3.5 text-xs font-bold uppercase tracking-widest"
          style={{ background: '#F4FAF6', borderBottom: '1.5px solid #D8F3DC', color: '#40916C' }}>
          <span>Heure</span>
          <span>Classe</span>
          <span>Élève</span>
          <span>Niveau</span>
          <span>Type</span>
        </div>

        {alertes.length === 0 && (
          <p className="text-center py-14 text-sm" style={{ color: '#B0A496' }}>Aucune alerte enregistrée.</p>
        )}

        {alertes.map((a, idx) => {
          const isCrit = a.type_alerte === 'critical'
          const heure  = a.horodatage ? new Date(a.horodatage).toLocaleTimeString('fr-FR') : '—'
          return (
            <div key={a.id}
              className="grid grid-cols-5 px-5 py-3 text-sm items-center"
              style={{
                background: isCrit
                  ? 'rgba(253,236,234,0.6)'
                  : idx % 2 === 0 ? '#FDFAF6' : '#FFFFFF',
                borderBottom: '1px solid #F5F2EE',
              }}>
              <span style={{ color: '#B0A496' }}>{heure}</span>
              <span className="font-medium" style={{ color: '#2D2A24' }}>{a.classe}</span>
              <span className="font-semibold" style={{ color: '#2D2A24' }}>{a.prenom}</span>
              <span className="font-bold" style={{ color: isCrit ? '#C0392B' : '#D4761B' }}>
                {a.niveau_db.toFixed(1)} dB
              </span>
              <span className="inline-flex">
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold"
                  style={{
                    background: isCrit ? '#FDECEA' : '#FEF3E2',
                    color: isCrit ? '#C0392B' : '#D4761B',
                  }}>
                  {a.type_alerte === 'critical' ? 'CRITIQUE' : 'WARNING'}
                </span>
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
