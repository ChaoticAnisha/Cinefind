// src/routes/films.ts
// Handles: GET /api/films/search, GET /api/films/:id

import { Router, Request, Response } from 'express'
import prisma from '../config/db'

const router = Router()

// --- SEARCH FILMS ---
// GET /api/films/search?q=thriller&genre=Drama&language=ko&year=2000&indie=true&page=1
router.get('/search', async (req: Request, res: Response) => {
  try {
    const {
      q,          // text search
      genre,      // filter by genre
      language,   // filter by language code (en, ko, fr...)
      year,       // filter by release year
      indie,      // "true" to show only indie films
      page = '1',
      limit = '20',
    } = req.query as Record<string, string>

    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const skip = (pageNum - 1) * limitNum

    // Build the Prisma where clause dynamically
    // Only add conditions for filters that were actually provided
    const where: any = {}

    if (q) {
      // Prisma's contains for case-insensitive search
      // mode: 'insensitive' means "Drama" and "drama" both match
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { overview: { contains: q, mode: 'insensitive' } },
        { director: { contains: q, mode: 'insensitive' } },
        { castList: { contains: q, mode: 'insensitive' } },
      ]
    }

    if (genre) {
      where.genres = { contains: genre, mode: 'insensitive' }
    }

    if (language) {
      where.originalLanguage = language
    }

    if (year) {
      where.releaseYear = parseInt(year)
    }

    if (indie === 'true') {
      where.isIndie = true
    }

    // Run search + count in parallel (faster than sequential)
    const [films, total] = await Promise.all([
      prisma.film.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { voteAverage: 'desc' },
        select: {
          tmdbId: true,
          title: true,
          overview: true,
          genres: true,
          releaseYear: true,
          originalLanguage: true,
          voteAverage: true,
          voteCount: true,
          runtime: true,
          posterPath: true,
          isIndie: true,
          director: true,
        },
      }),
      prisma.film.count({ where }),
    ])

    return res.json({
      films,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    })
  } catch (err) {
    console.error('Search error:', err)
    return res.status(500).json({ error: 'Search failed' })
  }
})

// --- GET FILM DETAILS ---
// GET /api/films/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const tmdbId = parseInt(req.params.id as string)

    if (isNaN(tmdbId)) {
      return res.status(400).json({ error: 'Invalid film ID' })
    }

    const film = await prisma.film.findUnique({
      where: { tmdbId },
    })

    if (!film) {
      return res.status(404).json({ error: 'Film not found' })
    }

    // Convert BigInt fields to strings for JSON serialisation
    // (JavaScript JSON.stringify can't handle BigInt natively)
    return res.json({
      ...film,
      budget: film.budget?.toString() || null,
      revenue: film.revenue?.toString() || null,
    })
  } catch (err) {
    console.error('Film detail error:', err)
    return res.status(500).json({ error: 'Failed to get film' })
  }
})

export default router