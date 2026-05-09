import axios from 'axios'

const BACKEND =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== 'undefined' && !window.location.hostname.includes('localhost')
    ? 'https://bruitomonstre-backend.onrender.com'
    : 'http://localhost:8000')

const api = axios.create({
  baseURL: `${BACKEND}/api`,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

// ── Auth ──────────────────────────────────────────────────────────────────
export const login = (identifiant, password) =>
  api.post('/auth/login', { identifiant, password })

// ── Eleves ────────────────────────────────────────────────────────────────
export const getEleves   = (classe)        => api.get('/eleves/', { params: { classe } })
export const addEleve    = (data)          => api.post('/eleves/', data)
export const deleteEleve = (id)            => api.delete(`/eleves/${id}`)

// ── Scores ────────────────────────────────────────────────────────────────
export const getScores    = (classe)       => api.get(`/scores/${classe}`)
export const getScoresAll = ()             => api.get('/scores/')
export const resetScore   = (classe)       => api.post(`/scores/${classe}/reset`)

// ── Alertes ───────────────────────────────────────────────────────────────
export const getAlertes    = (classe, limite = 50) =>
  api.get('/alertes/', { params: { classe, limite } })
export const getAlertesAll = (limite = 100) =>
  api.get('/alertes/', { params: { limite } })

export default api
