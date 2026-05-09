import { useState } from 'react'
import Login from './components/Login'
import Professeur from './pages/Professeur'
import Directeur from './pages/Directeur'

export default function App() {
  const [user, setUser] = useState(null)

  if (!user) return <Login onLogin={setUser} />
  if (user.role === 'dir') return <Directeur user={user} onLogout={() => setUser(null)} />
  return <Professeur user={user} onLogout={() => setUser(null)} />
}
