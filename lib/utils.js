import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatTime(date = new Date()) {
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export function formatDate(date = new Date()) {
  return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
}

export function dbToPercent(db, min = 30, max = 100) {
  return Math.min(100, Math.max(0, ((db - min) / (max - min)) * 100))
}

export function getStatusColor(statut) {
  switch (statut) {
    case 'critical': return { text: '#EF4444', bg: 'rgba(239,68,68,0.15)', glow: '0 0 20px rgba(239,68,68,0.4)' }
    case 'warning':  return { text: '#F59E0B', bg: 'rgba(245,158,11,0.15)', glow: '0 0 20px rgba(245,158,11,0.4)' }
    default:         return { text: '#10B981', bg: 'rgba(16,185,129,0.15)', glow: '0 0 20px rgba(16,185,129,0.35)' }
  }
}
