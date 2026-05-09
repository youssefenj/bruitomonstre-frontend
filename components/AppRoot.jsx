'use client'
import { useState } from 'react'
import Login from './Login'
import ProfesseurLayout from './ProfesseurLayout'
import DirecteurLayout from './DirecteurLayout'

export default function AppRoot() {
  const [user, setUser] = useState(null)

  if (!user) return <Login onLogin={setUser} />
  if (user.role === 'dir') return <DirecteurLayout user={user} onLogout={() => setUser(null)} />
  return <ProfesseurLayout user={user} onLogout={() => setUser(null)} />
}
