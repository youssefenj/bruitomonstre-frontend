import axios from 'axios'

// Utilise le proxy Next.js (next.config.js rewrites /api/* → localhost:8000/api/*)
// Pas besoin de CORS côté navigateur — les requêtes restent sur le même domaine
const api = axios.create({
  baseURL: '/api',
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
