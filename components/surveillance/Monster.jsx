'use client'
import { motion } from 'framer-motion'

export default function Monster({ etat = 'dort', phrase = '' }) {
  const isDort   = etat === 'dort'
  const isColere = etat === 'alerte'
  const isEcoute = etat === 'ecoute'

  const bodyVariants = {
    dort:   { scale: [1, 1.03, 1],   transition: { duration: 3.2, repeat: Infinity, ease: 'easeInOut' } },
    ecoute: { scale: [1, 1.015, 1],  transition: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' } },
    alerte: {
      x: [-6, 6, -5, 5, -3, 3, 0],
      rotate: [-2, 2, -1.5, 1.5, 0],
      transition: { duration: 0.4, repeat: Infinity, ease: 'easeInOut' }
    },
  }

  const eyeVariants = {
    dort:   { scaleY: 0.15 },
    ecoute: { scaleY: 1 },
    alerte: { scaleY: 1, scale: 1.15 },
  }

  const pupilColor = isColere ? '#7F1D1D' : '#0A1A12'

  /* ── Palette vert forêt (normal/écoute) vs rouge (alerte) ── */
  const C = {
    feet:  isColere ? '#7C3AED' : '#1A3D2B',
    body:  isColere ? '#7C3AED' : '#2D6A4F',
    arms:  isColere ? '#6D28D9' : '#40916C',
    head:  isColere ? '#6D28D9' : '#2D6A4F',
    horns: isColere ? '#5B21B6' : '#1A3D2B',
    zz1:   '#52B788',
    zz2:   '#40916C',
    zz3:   '#2D6A4F',
  }

  return (
    <div className="flex flex-col items-center gap-2 relative">
      {/* Glow ring */}
      <motion.div
        className="absolute top-8 left-1/2 -translate-x-1/2 w-28 h-28 rounded-full blur-2xl"
        animate={{
          background: isColere
            ? 'radial-gradient(circle, rgba(239,68,68,0.5), transparent)'
            : isEcoute
            ? 'radial-gradient(circle, rgba(45,106,79,0.45), transparent)'
            : 'radial-gradient(circle, rgba(45,106,79,0.20), transparent)',
          scale: isColere ? [1, 1.2, 1] : 1,
        }}
        transition={{ duration: isColere ? 0.6 : 1.5, repeat: Infinity }}
      />

      {/* Monster body */}
      <motion.div
        className="relative flex-shrink-0"
        variants={bodyVariants}
        animate={etat}
        style={{ transformOrigin: 'center 88%', width: 160, height: 176, minHeight: 176 }}
      >
        <svg viewBox="0 0 200 220" width="160" height="176" style={{ display: 'block' }}>
          {/* Shadow */}
          <ellipse cx="100" cy="210" rx="52" ry="8" fill="rgba(0,0,0,0.3)" />

          {/* Feet */}
          <ellipse cx="72"  cy="188" rx="22" ry="12" fill={C.feet} />
          <ellipse cx="128" cy="188" rx="22" ry="12" fill={C.feet} />

          {/* Body */}
          <ellipse cx="100" cy="140" rx="62" ry="55" fill={C.body} />

          {/* Body shine */}
          <ellipse cx="74" cy="118" rx="20" ry="12" fill="rgba(255,255,255,0.10)" transform="rotate(-25 74 118)" />

          {/* Arms */}
          <motion.ellipse
            cx="38" cy="128" rx="14" ry="22" fill={C.arms}
            animate={{ rotate: isColere ? [-15, -25, -15] : -20 }}
            transition={{ duration: 0.5, repeat: isColere ? Infinity : 0 }}
            style={{ transformOrigin: '38px 115px' }}
          />
          <motion.ellipse
            cx="162" cy="128" rx="14" ry="22" fill={C.arms}
            animate={{ rotate: isColere ? [15, 25, 15] : 20 }}
            transition={{ duration: 0.5, repeat: isColere ? Infinity : 0 }}
            style={{ transformOrigin: '162px 115px' }}
          />

          {/* Head */}
          <ellipse cx="100" cy="84" rx="56" ry="52" fill={C.head} />

          {/* Head shine */}
          <ellipse cx="80" cy="64" rx="18" ry="11" fill="rgba(255,255,255,0.14)" transform="rotate(-22 80 64)" />

          {/* Horns */}
          <polygon points="68,36 56,8 82,36"   fill={C.horns} />
          <polygon points="132,36 118,8 144,36" fill={C.horns} />

          {/* Eyebrows — angry when alerte */}
          {isColere && (
            <>
              <line x1="62" y1="62" x2="92" y2="70" stroke="#0A1A12" strokeWidth="4" strokeLinecap="round" />
              <line x1="138" y1="62" x2="108" y2="70" stroke="#0A1A12" strokeWidth="4" strokeLinecap="round" />
            </>
          )}

          {/* Eyes */}
          <ellipse cx="78"  cy="80" rx="16" ry="16" fill="white" />
          <ellipse cx="122" cy="80" rx="16" ry="16" fill="white" />

          {/* Pupils */}
          <motion.ellipse
            cx="82" cy="82" rx="9" ry="9"
            fill={pupilColor}
            animate={eyeVariants[etat]}
            transition={{ duration: 0.2 }}
          />
          <motion.ellipse
            cx="126" cy="82" rx="9" ry="9"
            fill={pupilColor}
            animate={eyeVariants[etat]}
            transition={{ duration: 0.2 }}
          />

          {/* Eye shine */}
          {!isDort && (
            <>
              <circle cx="85"  cy="79" r="3" fill="white" opacity="0.8" />
              <circle cx="129" cy="79" r="3" fill="white" opacity="0.8" />
            </>
          )}

          {/* Zzz (sleeping) */}
          {isDort && (
            <>
              <motion.text x="130" y="52" fontSize="14" fill={C.zz1} fontWeight="bold" opacity={0.9}
                animate={{ y: [52, 36, 20], opacity: [0, 0.9, 0], scale: [0.8, 1.1, 0.7] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut' }}
              >z</motion.text>
              <motion.text x="142" y="40" fontSize="10" fill={C.zz2} fontWeight="bold"
                animate={{ y: [40, 24, 8], opacity: [0, 0.7, 0] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut', delay: 0.7 }}
              >z</motion.text>
              <motion.text x="150" y="30" fontSize="8" fill={C.zz3} fontWeight="bold"
                animate={{ y: [30, 14, 0], opacity: [0, 0.5, 0] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut', delay: 1.4 }}
              >z</motion.text>
            </>
          )}

          {/* Mouth */}
          {isDort && (
            <path d="M 78 104 Q 100 110 122 104" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.6" />
          )}
          {isEcoute && (
            <path d="M 76 104 Q 100 116 124 104" stroke="white" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          )}
          {isColere && (
            <>
              <path d="M 76 108 Q 100 96 124 108" stroke="white" strokeWidth="3.5" fill="none" strokeLinecap="round" />
              {/* Teeth */}
              <path d="M 80 107 Q 90 100 100 107 Q 110 100 120 107" stroke="white" strokeWidth="2" fill="rgba(255,255,255,0.2)" />
            </>
          )}
        </svg>
      </motion.div>

      {/* State label */}
      <motion.p
        className="text-xs font-semibold uppercase tracking-widest"
        animate={{ color: isColere ? '#F87171' : isEcoute ? '#52B788' : '#40916C' }}
      >
        {isDort ? '💤 Repos' : isEcoute ? '👂 Écoute...' : '😡 Alerte !'}
      </motion.p>
    </div>
  )
}
