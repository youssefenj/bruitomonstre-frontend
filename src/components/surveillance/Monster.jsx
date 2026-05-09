/**
 * Monster 3D — mascotte SVG avec rendu volumétrique.
 * etat : "dort"   → silence (dort, yeux fermés, z z z)
 *        "ecoute" → petit bruit (réveillé, bouche entrouverte)
 *        "alerte" → trop de bruit (en colère, bouche ouverte, sourcils froncés, tremble)
 */
export default function Monster({ etat = 'dort', phrase = '' }) {
  const isDort   = etat === 'dort'
  const isColere = etat === 'alerte'

  return (
    <>
      <style>{`
        @keyframes m-breathe {
          0%,100% { transform: scale(1);        }
          50%      { transform: scale(1.032);    }
        }
        @keyframes m-shake {
          0%,100% { transform: translateX(0)   rotate(0deg);   }
          20%     { transform: translateX(-7px) rotate(-2deg);  }
          40%     { transform: translateX(7px)  rotate(2deg);   }
          60%     { transform: translateX(-5px) rotate(-1.5deg);}
          80%     { transform: translateX(5px)  rotate(1.5deg); }
        }
        @keyframes m-alert-pulse {
          0%,100% { transform: scale(1);     }
          50%     { transform: scale(1.015); }
        }
        @keyframes z1 {
          0%   { opacity: 0;   transform: translate(0px, 0px)   scale(0.8); }
          20%  { opacity: 0.9; }
          100% { opacity: 0;   transform: translate(8px,-28px)  scale(1.1); }
        }
        @keyframes z2 {
          0%   { opacity: 0;   transform: translate(0px, 0px)   scale(0.7); }
          20%  { opacity: 0.7; }
          100% { opacity: 0;   transform: translate(12px,-36px) scale(1.0); }
        }
        @keyframes z3 {
          0%   { opacity: 0;   transform: translate(0px, 0px)   scale(0.6); }
          20%  { opacity: 0.5; }
          100% { opacity: 0;   transform: translate(16px,-42px) scale(0.9); }
        }
        .m-z1 { animation: z1 2.4s ease-out infinite; }
        .m-z2 { animation: z2 2.4s ease-out 0.7s infinite; }
        .m-z3 { animation: z3 2.4s ease-out 1.4s infinite; }
      `}</style>

      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'10px' }}>

        {/* Wrapper animation */}
        <div style={{
          display: 'inline-block',
          transformOrigin: 'center 88%',
          animation: isDort
            ? 'm-breathe 3.2s ease-in-out infinite'
            : isColere
            ? 'm-shake 0.38s ease-in-out infinite'
            : 'm-alert-pulse 1.6s ease-in-out infinite',
        }}>

          <svg width="220" height="248" viewBox="0 0 220 248" xmlns="http://www.w3.org/2000/svg">
            <defs>
              {/* Corps — gradient radial 3D */}
              <radialGradient id="gBody" cx="36%" cy="28%" r="70%">
                <stop offset="0%"   stopColor="#DDFBEE"/>
                <stop offset="45%"  stopColor="#9ADFC6"/>
                <stop offset="100%" stopColor="#5FB99C"/>
              </radialGradient>
              {/* Corne */}
              <radialGradient id="gHorn" cx="28%" cy="18%" r="72%">
                <stop offset="0%"   stopColor="#C8F0E2"/>
                <stop offset="100%" stopColor="#72C4AB"/>
              </radialGradient>
              {/* Reflet brillant */}
              <radialGradient id="gShine" cx="30%" cy="22%" r="52%">
                <stop offset="0%"   stopColor="white" stopOpacity="0.52"/>
                <stop offset="100%" stopColor="white" stopOpacity="0"/>
              </radialGradient>
              {/* Pied */}
              <radialGradient id="gFoot" cx="35%" cy="30%" r="65%">
                <stop offset="0%"   stopColor="#C8F0E2"/>
                <stop offset="100%" stopColor="#68C0A6"/>
              </radialGradient>
              {/* Ombre portée */}
              <filter id="fShadow" x="-25%" y="-20%" width="150%" height="150%">
                <feDropShadow dx="0" dy="6" stdDeviation="9" floodColor="#1A5040" floodOpacity="0.28"/>
              </filter>
              {/* Yeux — brillance */}
              <radialGradient id="gEye" cx="30%" cy="28%" r="60%">
                <stop offset="0%"   stopColor="#2A3D2E"/>
                <stop offset="100%" stopColor="#0D1A10"/>
              </radialGradient>
            </defs>

            {/* Ombre au sol */}
            <ellipse cx="110" cy="242" rx="66" ry="7" fill="#1A5040" opacity="0.18"/>

            {/* ══ CORNES ══ */}
            {/* Corne gauche */}
            <path d="M 82 82 C 65 60 46 30 56 10 C 61 1 70 7 68 22 C 66 36 76 57 88 73 Z"
                  fill="url(#gHorn)" stroke="#4FA88C" strokeWidth="1.8" strokeLinejoin="round"/>
            <line x1="59" y1="52" x2="70" y2="56" stroke="#4FA88C" strokeWidth="2.8" strokeLinecap="round" opacity="0.65"/>
            <line x1="58" y1="38" x2="68" y2="41" stroke="#4FA88C" strokeWidth="2.2" strokeLinecap="round" opacity="0.65"/>
            <line x1="59" y1="25" x2="67" y2="26" stroke="#4FA88C" strokeWidth="1.8" strokeLinecap="round" opacity="0.55"/>

            {/* Corne droite */}
            <path d="M 138 82 C 155 60 174 30 164 10 C 159 1 150 7 152 22 C 154 36 144 57 132 73 Z"
                  fill="url(#gHorn)" stroke="#4FA88C" strokeWidth="1.8" strokeLinejoin="round"/>
            <line x1="161" y1="52" x2="150" y2="56" stroke="#4FA88C" strokeWidth="2.8" strokeLinecap="round" opacity="0.65"/>
            <line x1="162" y1="38" x2="152" y2="41" stroke="#4FA88C" strokeWidth="2.2" strokeLinecap="round" opacity="0.65"/>
            <line x1="161" y1="25" x2="153" y2="26" stroke="#4FA88C" strokeWidth="1.8" strokeLinecap="round" opacity="0.55"/>

            {/* ══ FOURRURE (bosses périphériques) ══ */}
            {[0,14,28,42,56,70,84,98,112,126,140,154,168,182,196,210,224,238,252,266,280,294,308,322,336,350].map((deg, i) => {
              const a  = (deg * Math.PI) / 180
              const r  = 74
              const cx = 110 + r * Math.cos(a)
              const cy = 140 + r * Math.sin(a)
              const sz = 9 + (i % 4) * 2
              return <circle key={i} cx={cx} cy={cy} r={sz}
                             fill="url(#gBody)" stroke="#4FA88C" strokeWidth="1.2"/>
            })}

            {/* ══ CORPS PRINCIPAL ══ */}
            <circle cx="110" cy="140" r="68" fill="url(#gBody)"
                    stroke="#4FA88C" strokeWidth="1.8" filter="url(#fShadow)"/>

            {/* Reflet 3D */}
            <ellipse cx="86" cy="110" rx="34" ry="25" fill="url(#gShine)"/>

            {/* Teinte rouge si colère */}
            {isColere && (
              <circle cx="110" cy="140" r="68" fill="#FF4444" opacity="0.10"/>
            )}

            {/* ══ YEUX ══ */}
            {isDort ? (
              /* Yeux fermés — sourires */
              <>
                <path d="M 83 130 Q 95 121 107 130"
                      stroke="#2A6248" strokeWidth="4.5" fill="none" strokeLinecap="round"/>
                <path d="M 113 130 Q 125 121 137 130"
                      stroke="#2A6248" strokeWidth="4.5" fill="none" strokeLinecap="round"/>
              </>
            ) : (
              <>
                {/* Œil gauche */}
                <circle cx="92"  cy="128" r="18" fill="white" stroke="#2A6248" strokeWidth="1.5"/>
                <circle cx="95"  cy="131" r="11" fill="url(#gEye)"/>
                <circle cx="100" cy="124" r="4"  fill="white" opacity="0.9"/>
                <circle cx="88"  cy="135" r="1.5" fill="white" opacity="0.5"/>
                {/* Sourcil gauche colère */}
                {isColere && (
                  <path d="M 74 113 Q 88 107 101 115"
                        stroke="#2A6248" strokeWidth="4" fill="none" strokeLinecap="round"/>
                )}

                {/* Œil droit */}
                <circle cx="128" cy="128" r="18" fill="white" stroke="#2A6248" strokeWidth="1.5"/>
                <circle cx="125" cy="131" r="11" fill="url(#gEye)"/>
                <circle cx="134" cy="124" r="4"  fill="white" opacity="0.9"/>
                <circle cx="122" cy="135" r="1.5" fill="white" opacity="0.5"/>
                {/* Sourcil droit colère */}
                {isColere && (
                  <path d="M 146 113 Q 132 107 119 115"
                        stroke="#2A6248" strokeWidth="4" fill="none" strokeLinecap="round"/>
                )}
              </>
            )}

            {/* ══ BOUCHE ══ */}
            {isDort ? (
              /* Petit sourire calme */
              <path d="M 96 162 Q 110 172 124 162"
                    stroke="#2A6248" strokeWidth="3" fill="none" strokeLinecap="round"/>
            ) : isColere ? (
              /* Bouche grande ouverte — dents en zigzag */
              <>
                <path d="M 68 158 Q 110 180 152 158 Q 145 192 110 198 Q 75 192 68 158 Z"
                      fill="#2A5240"/>
                {/* Dents supérieures */}
                <path d="M 73 160 L 81 172 L 89 160 L 97 172 L 105 160 L 113 172 L 121 160 L 129 172 L 137 160 L 145 172 L 150 160"
                      fill="white" stroke="#2A5240" strokeWidth="1.2" strokeLinejoin="round"/>
                {/* Langue */}
                <ellipse cx="110" cy="188" rx="17" ry="8" fill="#FF8FA8" opacity="0.88"/>
              </>
            ) : (
              /* Réveillé — bouche entrouverte, quelques dents */
              <>
                <path d="M 82 156 Q 110 170 138 156 Q 131 176 110 180 Q 89 176 82 156 Z"
                      fill="#2A5240"/>
                <path d="M 87 158 L 94 167 L 102 158 L 110 167 L 118 158 L 126 167 L 133 158"
                      fill="white" stroke="#2A5240" strokeWidth="1" strokeLinejoin="round"/>
              </>
            )}

            {/* ══ PIEDS ══ */}
            {/* Pied gauche */}
            <ellipse cx="82"  cy="208" rx="26" ry="14" fill="url(#gFoot)" stroke="#4FA88C" strokeWidth="1.5"/>
            <path d="M 62 205 C 55 195 60 202 62 205" stroke="#2A6248" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
            <path d="M 71 202 C 66 191 71 199 71 202" stroke="#2A6248" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
            <path d="M 81 201 C 80 190 82 198 81 201" stroke="#2A6248" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
            <path d="M 91 202 C 93 191 91 199 91 202" stroke="#2A6248" strokeWidth="2.2" fill="none" strokeLinecap="round"/>

            {/* Pied droit */}
            <ellipse cx="138" cy="208" rx="26" ry="14" fill="url(#gFoot)" stroke="#4FA88C" strokeWidth="1.5"/>
            <path d="M 158 205 C 165 195 160 202 158 205" stroke="#2A6248" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
            <path d="M 149 202 C 154 191 149 199 149 202" stroke="#2A6248" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
            <path d="M 139 201 C 140 190 138 198 139 201" stroke="#2A6248" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
            <path d="M 129 202 C 127 191 129 199 129 202" stroke="#2A6248" strokeWidth="2.2" fill="none" strokeLinecap="round"/>

            {/* ══ Z Z Z (dort) ══ */}
            {isDort && (
              <>
                <text className="m-z1" x="155" y="94"  fontSize="20" fontWeight="bold" fill="#7ECFB8">z</text>
                <text className="m-z2" x="167" y="75"  fontSize="15" fontWeight="bold" fill="#7ECFB8">z</text>
                <text className="m-z3" x="176" y="59"  fontSize="11" fontWeight="bold" fill="#7ECFB8">z</text>
              </>
            )}

            {/* ══ !! (colère) ══ */}
            {isColere && (
              <>
                <text x="152" y="64" fontSize="24" fontWeight="bold" fill="#FF5252" opacity="0.9">!</text>
                <text x="166" y="50" fontSize="17" fontWeight="bold" fill="#FF5252" opacity="0.7">!</text>
              </>
            )}
          </svg>
        </div>

        {/* Bulle phrase mascotte */}
        {phrase && (
          <div style={{
            maxWidth: '270px',
            textAlign: 'center',
            padding: '10px 16px',
            borderRadius: '18px',
            fontSize: '13px',
            fontWeight: '500',
            lineHeight: '1.5',
            background: isColere ? '#FFF0F0' : isDort ? '#F0FFF8' : '#F0FFF8',
            border: `1.5px solid ${isColere ? '#FFAAAA' : '#A8E6CF'}`,
            color: '#1A2B22',
          }}>
            {phrase}
          </div>
        )}
      </div>
    </>
  )
}
