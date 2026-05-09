import { io } from 'socket.io-client'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const socket = io(API_URL, {
  autoConnect: false,
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 2000,
  timeout: 20000,
})

if (typeof window !== 'undefined') {
  socket.on('connect',       ()    => console.log('[Socket] CONNECTE sid=', socket.id))
  socket.on('disconnect',    (r)   => console.log('[Socket] DECONNECTE :', r))
  socket.on('connect_error', (err) => console.error('[Socket] ERREUR :', err.message, err))
}

export default socket
