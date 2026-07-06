// lib/types.ts
// Shared types used across the whole frontend.
// These match exactly what the backend API returns.

export interface Film {
  tmdbId: number
  title: string
  overview: string
  genres: string
  releaseYear: number
  originalLanguage: string
  voteAverage: number
  voteCount: number
  runtime: number
  posterPath: string
  director: string
  castList: string
  isIndie: boolean
  tagline?: string
  budget?: string
  revenue?: string
  productionCountries?: string
  keywords?: string
}

export interface RecommendedFilm {
  tmdb_id: number
  title: string
  overview: string
  genres: string
  release_year: number
  vote_average: number
  vote_count: number
  poster_path: string
  is_indie: boolean
  similarity_score: number
  final_score?: number
  tfidf_score?: number
  embedding_score?: number
  indie_bonus?: number
  model: string
}

export interface User {
  id: string
  email: string
  username: string | null
}

export interface UserPreferences {
  preferredGenres: string[]
  preferredLanguages: string[]
  preferredEras: string[]
}

export interface WatchlistItem {
  id: string
  tmdbId: number
  status: 'want_to_watch' | 'watched' | 'not_interested'
  film: {
    tmdbId: number
    title: string
    posterPath: string
    genres: string
    releaseYear: number
    voteAverage: number
    isIndie: boolean
  }
}