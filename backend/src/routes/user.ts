// src/routes/user.ts
// All routes require login (requireAuth middleware)
//
// Handles:
// GET    /api/user/watchlist
// POST   /api/user/watchlist
// DELETE /api/user/watchlist/:tmdbId
// PUT    /api/user/preferences
// POST   /api/user/ratings
// GET    /api/user/ratings

import { Router, Response } from 'express'
import { requireAuth, AuthRequest } from '../middleware/auth'
import prisma from '../config/db'

const router = Router()

// All user routes require auth — apply middleware to whole router
router.use(requireAuth)

// --- GET WATCHLIST ---
router.get('/watchlist', async (req: AuthRequest, res: Response) => {
  try {
    const watchlist = await prisma.watchlist.findMany({
      where: { userId: req.userId },
      include: {
        film: {
          select: {
            tmdbId: true,
            title: true,
            posterPath: true,
            genres: true,
            releaseYear: true,
            voteAverage: true,
            isIndie: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return res.json({ watchlist })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to get watchlist' })
  }
})

// --- ADD TO WATCHLIST ---
// POST /api/user/watchlist
// Body: { tmdbId: 550, status: "want_to_watch" }
router.post('/watchlist', async (req: AuthRequest, res: Response) => {
  try {
    const { tmdbId, status = 'want_to_watch' } = req.body

    const validStatuses = ['want_to_watch', 'watched', 'not_interested']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' })
    }

    // upsert = update if exists, create if not
    const item = await prisma.watchlist.upsert({
      where: {
        userId_tmdbId: { userId: req.userId!, tmdbId },
      },
      update: { status },
      create: { userId: req.userId!, tmdbId, status },
    })

    return res.json({ item, message: 'Watchlist updated' })
  } catch (err) {
    console.error('Watchlist add error:', err)
    return res.status(500).json({ error: 'Failed to update watchlist' })
  }
})

// --- REMOVE FROM WATCHLIST ---
// DELETE /api/user/watchlist/:tmdbId
router.delete('/watchlist/:tmdbId', async (req: AuthRequest, res: Response) => {
  try {
    const tmdbId = parseInt(req.params.filmId as string)

    await prisma.watchlist.deleteMany({
      where: { userId: req.userId, tmdbId },
    })

    return res.json({ message: 'Removed from watchlist' })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to remove from watchlist' })
  }
})

// --- UPDATE PREFERENCES ---
// PUT /api/user/preferences
// Body: { preferredGenres: ["Drama","Thriller"], preferredLanguages: ["ko","fr"], preferredEras: ["2000s","2010s"] }
router.put('/preferences', async (req: AuthRequest, res: Response) => {
  try {
    const { preferredGenres, preferredLanguages, preferredEras } = req.body

    const preferences = await prisma.userPreferences.upsert({
      where: { userId: req.userId! },
      update: {
        preferredGenres: preferredGenres || [],
        preferredLanguages: preferredLanguages || [],
        preferredEras: preferredEras || [],
      },
      create: {
        userId: req.userId!,
        preferredGenres: preferredGenres || [],
        preferredLanguages: preferredLanguages || [],
        preferredEras: preferredEras || [],
      },
    })

    return res.json({ preferences, message: 'Preferences updated' })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update preferences' })
  }
})

// --- RATE A FILM ---
// POST /api/user/ratings
// Body: { tmdbId: 550, rating: 4 }
router.post('/ratings', async (req: AuthRequest, res: Response) => {
  try {
    const { tmdbId, rating } = req.body

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' })
    }

    const savedRating = await prisma.rating.upsert({
      where: {
        userId_tmdbId: { userId: req.userId!, tmdbId },
      },
      update: { rating },
      create: { userId: req.userId!, tmdbId, rating },
    })

    return res.json({ rating: savedRating, message: 'Rating saved' })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to save rating' })
  }
})

// --- GET USER'S RATINGS ---
router.get('/ratings', async (req: AuthRequest, res: Response) => {
  try {
    const ratings = await prisma.rating.findMany({
      where: { userId: req.userId },
      include: {
        film: {
          select: {
            tmdbId: true,
            title: true,
            posterPath: true,
            genres: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return res.json({ ratings })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to get ratings' })
  }
})

export default router