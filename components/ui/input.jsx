'use client'
import { cn } from '../../lib/utils'

export function Input({ className = '', label, error, icon, ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-bold mb-1.5 uppercase tracking-widest"
          style={{ color: '#6B6357' }}>
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#40916C' }}>
            {icon}
          </div>
        )}
        <input
          className={cn(
            'w-full rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200',
            icon && 'pl-10',
            className
          )}
          style={{
            background: '#FFFFFF',
            border: error ? '1.5px solid #C0392B' : '1.5px solid #D6CEBE',
            color: '#2D2A24',
          }}
          onFocus={e => e.target.style.borderColor = '#2D6A4F'}
          onBlur={e => e.target.style.borderColor = error ? '#C0392B' : '#D6CEBE'}
          {...props}
        />
      </div>
      {error && <p className="mt-1.5 text-xs" style={{ color: '#C0392B' }}>{error}</p>}
    </div>
  )
}
