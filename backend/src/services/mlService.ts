import axios, { AxiosError } from 'axios'

// Always use 127.0.0.1, not localhost — on Windows/Node 22 localhost resolves
// to IPv6 (::1) but uvicorn binds to IPv4 (127.0.0.1) by default.
const ML_URL = (process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000').replace(
  'localhost',
  '127.0.0.1'
)

const mlClient = axios.create({
  baseURL: ML_URL,
  timeout: 60000, // 60 s — embedding calls can be slow
})

// Log every outgoing request
mlClient.interceptors.request.use((config) => {
  console.log(`[ML →] ${config.method?.toUpperCase()} ${ML_URL}${config.url}`, config.data ?? '')
  return config
})

// Log every response or error
mlClient.interceptors.response.use(
  (response) => {
    const count = response.data?.results?.length ?? '?'
    console.log(`[ML ←] ${response.status} — ${count} results`)
    return response
  },
  (error: AxiosError) => {
    console.error('[ML ✗] Request failed:')
    console.error('  URL    :', error.config?.url)
    console.error('  Status :', error.response?.status)
    console.error('  Body   :', JSON.stringify(error.response?.data))
    console.error('  Message:', error.message)
    return Promise.reject(error)
  }
)

export interface RecommendationResult {
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
  model: string
}

export async function getTFIDFRecommendations(
  query?: string,
  tmdbId?: number,
  n: number = 10
): Promise<RecommendationResult[]> {
  const response = await mlClient.post('/recommend/tfidf', {
    query,
    tmdb_id: tmdbId,
    n,
  })
  return response.data.results
}

export async function getEmbeddingRecommendations(
  query: string,
  n: number = 10,
  filters?: Record<string, unknown>
): Promise<RecommendationResult[]> {
  const response = await mlClient.post('/recommend/embedding', {
    query,
    n,
    filters,
  })
  return response.data.results
}

export async function getHybridRecommendations(
  query?: string,
  tmdbId?: number,
  n: number = 10,
  alpha: number = 0.4,
  beta: number = 0.6
): Promise<RecommendationResult[]> {
  const response = await mlClient.post('/recommend/hybrid', {
    query,
    tmdb_id: tmdbId,
    n,
    alpha,
    beta,
  })
  return response.data.results
}

export async function getFilmFromML(tmdbId: number) {
  const response = await mlClient.get(`/film/${tmdbId}`)
  return response.data
}

// Health-check used by /debug/ml endpoint
export async function pingMLService() {
  const response = await mlClient.get('/')
  return response.data
}
