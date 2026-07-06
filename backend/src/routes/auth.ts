// src/routes/auth.ts
// Handles: POST /api/auth/register, POST /api/auth/login, GET /api/auth/me

import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../config/db'
import { requireAuth, AuthRequest } from '../middleware/auth'

const router = Router()

// --- REGISTER ---
// POST /api/auth/register
// Body: { email, password, username }
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, username } = req.body

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' })
    }

    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' })
    }

    // Hash the password
    // bcrypt adds a "salt" (random data) before hashing
    // The 12 is the "cost factor" — higher = slower = more secure
    const passwordHash = await bcrypt.hash(password, 12)

    // Create the user in the database
    const user = await prisma.user.create({
      data: { email, passwordHash, username },
    })

    // Create default empty preferences for this user
    await prisma.userPreferences.create({
      data: {
        userId: user.id,
        preferredGenres: [],
        preferredLanguages: [],
        preferredEras: [],
      },
    })

    // Create a JWT token
    // The payload { userId } is stored inside the token
    // expiresIn: '7d' means the token expires after 7 days
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    return res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    })
  } catch (err) {
    console.error('Register error:', err)
    return res.status(500).json({ error: 'Registration failed' })
  }
})

// --- LOGIN ---
// POST /api/auth/login
// Body: { email, password }
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    // Find the user
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      // Don't say "email not found" — that tells attackers which emails exist
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Compare the provided password against the stored hash
    const passwordMatch = await bcrypt.compare(password, user.passwordHash)
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Create a fresh token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    })
  } catch (err) {
    console.error('Login error:', err)
    return res.status(500).json({ error: 'Login failed' })
  }
})

// --- GET CURRENT USER ---
// GET /api/auth/me
// Requires: Authorization header with Bearer token
router.get('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: { preferences: true },  // also return their preferences
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    return res.json({
      id: user.id,
      email: user.email,
      username: user.username,
      preferences: user.preferences,
    })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to get user' })
  }
})

export default router