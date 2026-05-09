'use client'
import { cn } from '../../lib/utils'
import { motion } from 'framer-motion'

export function Card({ children, className = '', animate = false, style = {}, ...props }) {
  const Comp = animate ? motion.div : 'div'
  const animProps = animate
    ? { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4 } }
    : {}

  return (
    <Comp
      className={cn('rounded-2xl p-5', className)}
      style={{
        background: '#FFFFFF',
        border: '1.5px solid #EDE8DF',
        boxShadow: '0 2px 12px rgba(45,106,79,0.07)',
        ...style,
      }}
      {...animProps}
      {...props}
    >
      {children}
    </Comp>
  )
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={cn('mb-4 flex items-center justify-between', className)}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className = '' }) {
  return (
    <h3 className={cn('text-xs font-bold uppercase tracking-widest', className)}
      style={{ color: '#6B6357' }}>
      {children}
    </h3>
  )
}

export function CardValue({ children, className = '' }) {
  return (
    <p className={cn('text-4xl font-bold', className)} style={{ color: '#1A3D2B' }}>
      {children}
    </p>
  )
}
