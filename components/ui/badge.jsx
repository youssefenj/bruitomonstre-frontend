'use client'
import { cn } from '../../lib/utils'

const variantStyles = {
  default:  { background: '#EDE8DF',             color: '#6B6357', border: '1px solid #D6CEBE' },
  primary:  { background: '#D8F3DC',             color: '#2D6A4F', border: '1px solid rgba(45,106,79,0.30)' },
  success:  { background: 'rgba(39,174,96,0.12)', color: '#27AE60', border: '1px solid rgba(39,174,96,0.30)' },
  warning:  { background: 'rgba(212,118,27,0.12)',color: '#D4761B', border: '1px solid rgba(212,118,27,0.30)' },
  danger:   { background: 'rgba(192,57,43,0.12)', color: '#C0392B', border: '1px solid rgba(192,57,43,0.30)' },
  outline:  { background: 'transparent',          color: '#2D6A4F', border: '1.5px solid #2D6A4F' },
}

export function Badge({ children, variant = 'default', className = '', style = {} }) {
  return (
    <span
      className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold', className)}
      style={{ ...variantStyles[variant], ...style }}
    >
      {children}
    </span>
  )
}
