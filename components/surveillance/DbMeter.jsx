'use client'
import { motion } from 'framer-motion'
import { dbToPercent } from '../../lib/utils'

function getBarColor(pct) {
  if (pct < 50) return 'linear-gradient(90deg, #27AE60, #52B788)'
  if (pct < 72) return 'linear-gradient(90deg, #D4761B, #E67E22)'
  return 'linear-gradient(90deg, #C0392B, #E74C3C)'
}

function getGlow(statut) {
  if (statut === 'critical') return '0 0 24px rgba(192,57,43,0.65)'
  if (statut === 'warning')  return '0 0 20px rgba(212,118,27,0.55)'
  return '0 0 16px rgba(39,174,96,0.45)'
}

function getDbColor(pct) {
  if (pct > 71) return '#E74C3C'
  if (pct > 49) return '#E67E22'
  return '#52B788'
}

export default function DbMeter({ db = 0, statut = 'normal' }) {
  const pct = dbToPercent(db)

  return (
    <div className="space-y-4">
      {/* Barre principale */}
      <div className="relative">
        <div className="flex justify-between text-xs mb-2 font-mono" style={{ color: '#40916C' }}>
          <span>30 dB</span>
          <span className="font-bold text-base" style={{ color: getDbColor(pct) }}>
            {db.toFixed(1)} dB
          </span>
          <span>100 dB</span>
        </div>

        {/* Track */}
        <div className="relative h-7 rounded-full overflow-hidden"
          style={{ background: 'rgba(10,26,18,0.8)', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)' }}>

          {/* Marqueurs de zone */}
          <div className="absolute top-0 bottom-0 left-0"
            style={{ width: '50%', borderRight: '2px dashed rgba(82,183,136,0.15)' }} />
          <div className="absolute top-0 bottom-0 left-0"
            style={{ width: '71%', borderRight: '2px dashed rgba(82,183,136,0.15)' }} />

          {/* Fill animé */}
          <motion.div
            className="absolute top-0 left-0 bottom-0 rounded-full"
            animate={{
              width: `${pct}%`,
              background: getBarColor(pct),
              boxShadow: getGlow(statut),
            }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
          />

          {/* Shimmer */}
          <motion.div
            className="absolute top-0 left-0 bottom-0 rounded-full opacity-25"
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 2s infinite',
            }}
          />

          {/* Valeur dans la barre */}
          {pct > 15 && (
            <motion.span
              className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold"
              style={{ color: 'rgba(255,255,255,0.85)' }}
              animate={{ opacity: 1 }}
            >
              {db.toFixed(1)} dB
            </motion.span>
          )}
        </div>

        {/* Labels de zone */}
        <div className="flex justify-between mt-1.5 text-xs" style={{ color: '#2D6A4F' }}>
          <span>🟢 Normal</span>
          <span style={{ marginLeft: '38%' }}>🟠 Warning</span>
          <span>🔴 Critique</span>
        </div>
      </div>

      {/* Mini barres visuelles */}
      <div className="flex items-end gap-1 h-10">
        {Array.from({ length: 20 }).map((_, i) => {
          const threshold = (i + 1) * 5
          const active = pct >= threshold
          const color = threshold <= 50 ? '#52B788' : threshold <= 72 ? '#E67E22' : '#E74C3C'
          return (
            <motion.div
              key={i}
              className="flex-1 rounded-sm"
              animate={{
                height: active ? `${40 + (i / 20) * 40}%` : '20%',
                background: active ? color : 'rgba(82,183,136,0.12)',
                opacity: active ? 1 : 1,
              }}
              transition={{ duration: 0.1 }}
              style={{ minHeight: '4px' }}
            />
          )
        })}
      </div>
    </div>
  )
}
