/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        /* ── Palette vert + beige moderne ── */
        vert: {
          DEFAULT: '#2D6A4F',   /* boutons, onglets actifs */
          fonce:   '#1A3D2B',   /* header/topbar */
          moyen:   '#40916C',   /* hover, accents */
          clair:   '#52B788',   /* highlights, icônes */
          pale:    '#D8F3DC',   /* badges, fonds légers */
          sombre:  '#0D1F17',   /* fond dark surveillance */
          surf:    '#112A1E',   /* surface dark surveillance */
        },
        beige: {
          DEFAULT: '#FAF7F2',   /* fond page principal */
          card:    '#FFFFFF',   /* cartes */
          moyen:   '#EDE8DF',   /* sections secondaires */
          bord:    '#D6CEBE',   /* bordures */
          texte:   '#6B6357',   /* texte secondaire */
        },
        or:      '#C8A96E',     /* accent chaud / titre */
        danger:  { DEFAULT: '#C0392B', light: '#E74C3C' },
        warning: { DEFAULT: '#D4761B', light: '#E67E22' },
        success: { DEFAULT: '#27AE60', light: '#2ECC71' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card:        '0 2px 12px rgba(45,106,79,0.08)',
        'card-hover':'0 6px 24px rgba(45,106,79,0.15)',
        'glow-green':'0 0 20px rgba(45,106,79,0.30)',
        'glow-red':  '0 0 20px rgba(192,57,43,0.35)',
        header:      '0 2px 16px rgba(26,61,43,0.25)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        shimmer: 'shimmer 2s infinite',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
