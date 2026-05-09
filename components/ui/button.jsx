'use client'
import { cn } from '../../lib/utils'
import { motion } from 'framer-motion'

const variants = {
  primary: 'text-white font-bold',
  success: 'text-white font-bold',
  danger:  'text-white font-bold',
  ghost:   'font-semibold border',
  outline: 'font-semibold border',
}

const sizes = {
  sm:   'px-3 py-1.5 text-xs rounded-lg',
  md:   'px-4 py-2.5 text-sm rounded-xl',
  lg:   'px-6 py-3 text-base rounded-xl',
  icon: 'p-2.5 rounded-xl',
}

const styleMap = {
  primary: {
    background: 'linear-gradient(135deg, #2D6A4F, #40916C)',
    boxShadow: '0 3px 12px rgba(45,106,79,0.30)',
    border: 'none',
    color: '#FFFFFF',
  },
  success: {
    background: 'linear-gradient(135deg, #27AE60, #2ECC71)',
    boxShadow: '0 3px 12px rgba(39,174,96,0.30)',
    border: 'none',
    color: '#FFFFFF',
  },
  danger: {
    background: 'linear-gradient(135deg, #C0392B, #E74C3C)',
    boxShadow: '0 3px 12px rgba(192,57,43,0.30)',
    border: 'none',
    color: '#FFFFFF',
  },
  ghost: {
    background: 'rgba(45,106,79,0.08)',
    border: '1.5px solid rgba(45,106,79,0.20)',
    color: '#2D6A4F',
    boxShadow: 'none',
  },
  outline: {
    background: 'transparent',
    border: '1.5px solid #2D6A4F',
    color: '#2D6A4F',
    boxShadow: 'none',
  },
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  style = {},
  ...props
}) {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer select-none',
        variants[variant],
        sizes[size],
        disabled && 'opacity-45 cursor-not-allowed pointer-events-none',
        className
      )}
      style={{ ...styleMap[variant], ...style }}
      {...props}
    >
      {children}
    </motion.button>
  )
}
