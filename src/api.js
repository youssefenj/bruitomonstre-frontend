import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const api = axios.create({ baseURL: `${API_URL}/api`, timeout: 60000 })

export const login       = (identifiant, password) => api.post('/auth/login', { identifiant, password })
export const getEleves   = (classe)  => api.get('/eleves/', { params: { classe } })
export const createEleve = (data)    => api.post('/eleves/', data)
export const updateEmpreinte = (id, empreinte) => api.put(`/eleves/${id}/empreinte`, { empreinte })
export const deleteEleve = (id)      => api.delete(`/eleves/${id}`)
export const getAlertes  = (classe, limite = 50) => api.get('/alertes/', { params: { classe, limite } })
export const getScores   = ()        => api.get('/scores/')
export const getScore    = (classe)  => api.get(`/scores/${classe}`)
export const resetScore  = (classe)  => api.post(`/scores/${classe}/reset`)
export default api
