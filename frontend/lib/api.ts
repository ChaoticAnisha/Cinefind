// lib/api.ts
//
// Every single call to the backend goes through this file.
// Components never call axios directly — they call these functions.
// This means if the backend URL changes, you fix it in one place.

import axios from 'axios'
import Cookies from 'js-cookie'
import { Film, RecommendedFilm, WatchlistItem, UserPreferences } from './types'

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

// Create axios instance
const api = axios.create({ baseURL: BASE })

// Request interceptor — automatically adds JWT token to every request
// The token is stored in a cookie called 'token'
api.interceptors.request.use((config) => {
  const token = Cookies.get('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ─── AUTH ────────────────────────────────────────────────────────────────────

export async function register(email: string, password: string, username: string) {
  const res = await api.post('/api/auth/register', { email, password, username })
  return res.data // { token, user }
}

export async function login(email: string, password: string) {
  const res = await api.post('/api/auth/login', { email, password })
  return res.data // { token, user }
}

export async function getMe() {
  const res = await api.get('/api/auth/me')
  return res.data
}

// ─── FILMS ───────────────────────────────────────────────────────────────────

export async function searchFilms(params: {
  q?: string
  genre?: string
  language?: string
  year?: string
  indie?: boolean
  page?: number
}) {
  const res = await api.get('/api/films/search', { params })
  return res.data // { films, pagination }
}

export async function getFilm(tmdbId: number): Promise<Film> {
  const res = await api.get(`/api/films/${tmdbId}`)
  return res.data
}

// ─── RECOMMENDATIONS ─────────────────────────────────────────────────────────

export async function getSimilarFilms(
  filmId: number,
  model: 'tfidf' | 'embedding' | 'hybrid' = 'hybrid',
  n: number = 10
): Promise<RecommendedFilm[]> {
  const res = await api.get(`/api/recommendations/similar/${filmId}`, {
    params: { model, n },
  })
  return res.data.results
}

export async function getPromptRecommendations(
  query: string,
  model: 'tfidf' | 'embedding' | 'hybrid' = 'hybrid',
  n: number = 10
): Promise<RecommendedFilm[]> {
  const res = await api.post('/api/recommendations/prompt', { query, model, n })
  return res.data.results
}

export async function getPersonalisedRecommendations(
  n: number = 12
): Promise<RecommendedFilm[]> {
  const res = await api.get('/api/recommendations/personalised', { params: { n } })
  return res.data.results
}

export async function compareModels(query: string, n: number = 5) {
  const res = await api.post('/api/recommendations/compare', { query, n })
  return res.data // { tfidf, embedding, hybrid }
}

// ─── USER ────────────────────────────────────────────────────────────────────

export async function getWatchlist(): Promise<WatchlistItem[]> {
  const res = await api.get('/api/user/watchlist')
  return res.data.watchlist
}

export async function addToWatchlist(
  tmdbId: number,
  status: 'want_to_watch' | 'watched' | 'not_interested' = 'want_to_watch'
) {
  const res = await api.post('/api/user/watchlist', { tmdbId, status })
  return res.data
}

export async function removeFromWatchlist(tmdbId: number) {
  const res = await api.delete(`/api/user/watchlist/${tmdbId}`)
  return res.data
}

export async function updatePreferences(prefs: UserPreferences) {
  const res = await api.put('/api/user/preferences', prefs)
  return res.data
}

export async function rateFilm(tmdbId: number, rating: number) {
  const res = await api.post('/api/user/ratings', { tmdbId, rating })
  return res.data
}