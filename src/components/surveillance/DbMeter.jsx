/**
 * DbMeter — jauge visuelle du niveau sonore en temps réel.
 * Props : db (number 0-100), statut ("normal"|"warning"|"critical")
 * Thème forest-dark : fond vert très foncé, barres vertes → orange → rouge
 */
export default function DbMeter({ db = 0, statut = 'normal' }) {
  const color = statut === 'critical' ? '#E74C3C' : statut === 'warning' ? '#E67E22' : '#52B788'
  const pct   = Math.min(100, Math.max(0, db))

  const segments = Array.from({ length: 30 }, (_, i) => {
    const threshold = (i / 30) * 100
    const active    = pct >= threshold
    const col = threshold >= 80 ? '#E74C3C' : threshold >= 60 ? '#E67E22' : '#52B788'
    return { active, col }
  })

  return (
    <div className="w-full">
      <div className="flex gap-0.5 h-12 items-end">
        {segments.map((seg, i) => (
          <div key={i} className="flex-1 rounded-sm transition-all duration-75"
            style={{
              height: `${30 + (i / 30) * 70}%`,
              background: seg.active ? seg.col : 'rgba(82,183,136,0.15)',
              opacity: seg.active ? 1 : 1,
            }} />
        ))}
      </div>
      <div className="flex justify-between mt-2.5">
        <span className="text-xs" style={{ color: '#40916C' }}>0 dB</span>
        <span className="text-2xl font-bold tabular-nums" style={{ color }}>{Math.round(db)} dB</span>
        <span className="text-xs" style={{ color: '#40916C' }}>100 dB</span>
      </div>
    </div>
  )
}
