import { Router, Response } from 'express'
import { AxiosError } from 'axios'
import { requireAuth, AuthRequest } from '../middleware/auth'
import {
  getTFIDFRecommendations,
  getEmbeddingRecommendations,
  getHybridRecommendations,
} from '../services/mlService'
import prisma from '../config/db'

const router = Router()

function mlError(err: unknown) {
  const ax = err as AxiosError
  return {
    error: 'ML service call failed',
    detail: ax.message,
    ml_status: ax.response?.status,
    ml_body: ax.response?.data,
    ml_url: ax.config?.url,
  }
}

// GET /api/recommendations/similar/:filmId?model=tfidf|embedding|hybrid
router.get('/similar/:filmId', async (req: AuthRequest, res: Response) => {
  try {
    const tmdbId = parseInt(req.params.filmId as string)
    const model = (req.query.model as string) || 'hybrid'
    const n = parseInt((req.query.n as string) || '10')

    if (isNaN(tmdbId)) return res.status(400).json({ error: 'Invalid film ID' })

    let results
    if (model === 'tfidf') {
      results = await getTFIDFRecommendations(undefined, tmdbId, n)
    } else if (model === 'embedding') {
      results = await getEmbeddingRecommendations('', n)
    } else {
      results = await getHybridRecommendations(undefined, tmdbId, n)
    }

    await prisma.recommendationLog.create({
      data: { userId: req.userId || null, modelUsed: model, query: `similar:${tmdbId}`, results: results as any },
    })

    return res.json({ results, model, count: results.length })
  } catch (err) {
    console.error('[similar] error:', (err as AxiosError).response?.data ?? err)
    return res.status(500).json(mlError(err))
  }
})

// POST /api/recommendations/prompt — no auth required
// Body: { query, model?, n? }
router.post('/prompt', async (req: AuthRequest, res: Response) => {
  try {
    const { query, model = 'hybrid', n = 10 } = req.body

    if (!query || String(query).trim() === '') {
      return res.status(400).json({ error: 'query is required' })
    }

    let results
    if (model === 'tfidf') {
      results = await getTFIDFRecommendations(query, undefined, n)
    } else if (model === 'embedding') {
      results = await getEmbeddingRecommendations(query, n)
    } else {
      results = await getHybridRecommendations(query, undefined, n)
    }

    await prisma.recommendationLog.create({
      data: { userId: req.userId || null, modelUsed: model, query, results: results as any },
    })

    return res.json({ results, model, query, count: results.length })
  } catch (err) {
    console.error('[prompt] error:', (err as AxiosError).response?.data ?? err)
    return res.status(500).json(mlError(err))
  }
})

// GET /api/recommendations/personalised — auth required
router.get('/personalised', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const n = parseInt((req.query.n as string) || '12')

    const prefs = await prisma.userPreferences.findUnique({ where: { userId: req.userId } })
    const watchlist = await prisma.watchlist.findMany({
      where: { userId: req.userId },
      select: { tmdbId: true },
    })
    const watchlistIds = new Set(watchlist.map((w) => w.tmdbId))

    let query = 'independent film festival arthouse'
    if (prefs && prefs.preferredGenres.length > 0) query = prefs.preferredGenres.join(' ')

    if (prefs && prefs.preferredLanguages.length > 0) {
      const langMap: Record<string, string> = {
        ko: 'Korean', fr: 'French', ja: 'Japanese', es: 'Spanish',
        de: 'German', it: 'Italian', zh: 'Chinese', en: 'English',
      }
      query += ' ' + prefs.preferredLanguages.map((l) => langMap[l] || l).join(' ')
    }

    let results = await getHybridRecommendations(query, undefined, n + watchlistIds.size)
    results = results.filter((r) => !watchlistIds.has(r.tmdb_id)).slice(0, n)

    return res.json({ results, model: 'hybrid-personalised', query, count: results.length })
  } catch (err) {
    console.error('[personalised] error:', (err as AxiosError).response?.data ?? err)
    return res.status(500).json(mlError(err))
  }
})

// POST /api/recommendations/compare — no auth required
// Body: { query, n? }
router.post('/compare', async (req: AuthRequest, res: Response) => {
  try {
    const { query, n = 5 } = req.body
    if (!query) return res.status(400).json({ error: 'query is required' })

    const [tfidf, embedding, hybrid] = await Promise.all([
      getTFIDFRecommendations(query, undefined, n),
      getEmbeddingRecommendations(query, n),
      getHybridRecommendations(query, undefined, n),
    ])

    return res.json({
      query,
      tfidf: { results: tfidf, count: tfidf.length },
      embedding: { results: embedding, count: embedding.length },
      hybrid: { results: hybrid, count: hybrid.length },
    })
  } catch (err) {
    console.error('[compare] error:', (err as AxiosError).response?.data ?? err)
    return res.status(500).json(mlError(err))
  }
})

export default router
