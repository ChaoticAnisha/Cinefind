// src/index.ts — Fixed entry point
// Wraps all startup in try/catch so errors are visible and don't silently exit

import 'dotenv/config'
import express from 'express'
import cors from 'cors'

const app = express()
const PORT = parseInt(process.env.PORT || '3001', 10)

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
}))
app.use(express.json())

// ── Health check (no DB needed — tests if Express is alive) ────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'running',
    timestamp: new Date().toISOString(),
    ml_service: process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000',
  })
})

// ── Debug: test Node → Python ML service connection ────────────────────────
app.get('/debug/ml', async (_req, res) => {
  try {
    const { pingMLService, getHybridRecommendations } = await import('./services/mlService')
    const ping = await pingMLService()
    const sample = await getHybridRecommendations('independent arthouse', undefined, 3)
    res.json({
      status: 'ok',
      ml_ping: ping,
      sample_results: sample,
      sample_count: sample.length,
    })
  } catch (err: any) {
    res.status(500).json({
      status: 'error',
      message: err.message,
      ml_response: err.response?.data,
      ml_status: err.response?.status,
    })
  }
})

// ── Async startup — routes loaded after DB confirmed working ───────────────
async function startServer() {
  try {
    // 1. Test database connection before loading routes
    console.log('Testing database connection...')
    const { default: prisma } = await import('./config/db')

    await prisma.$connect()
    console.log('✓ Database connected')

    // 2. Now load routes (they use prisma internally)
    const { default: authRoutes }           = await import('./routes/auth')
    const { default: filmRoutes }           = await import('./routes/films')
    const { default: recommendationRoutes } = await import('./routes/recommendations')
    const { default: userRoutes }           = await import('./routes/user')

    app.use('/api/auth',            authRoutes)
    app.use('/api/films',           filmRoutes)
    app.use('/api/recommendations', recommendationRoutes)
    app.use('/api/user',            userRoutes)

    // 3. 404 handler (must be after all routes)
    app.use((req, res) => {
      res.status(404).json({ error: `Route ${req.method} ${req.path} not found` })
    })

    // 4. Start listening
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`✓ Backend API running on http://localhost:${PORT}`)
      console.log(`✓ ML Service: ${process.env.ML_SERVICE_URL || 'http://localhost:8000'}`)
      console.log('  Server is ready. Press Ctrl+C to stop.')
    })

    // 5. Keep-alive settings
    server.keepAliveTimeout = 65000
    server.headersTimeout   = 66000

    // 6. Graceful shutdown on Ctrl+C
    process.on('SIGINT', async () => {
      console.log('\nShutting down...')
      await prisma.$disconnect()
      server.close(() => {
        console.log('Server closed.')
        process.exit(0)
      })
    })

    process.on('SIGTERM', async () => {
      await prisma.$disconnect()
      server.close(() => process.exit(0))
    })

  } catch (error) {
    // This catches ANY startup error and prints it clearly
    // instead of silently exiting
    console.error('═══════════════════════════════════════')
    console.error('STARTUP FAILED — here is the error:')
    console.error(error)
    console.error('═══════════════════════════════════════')
    process.exit(1)
  }
}

// ── Global uncaught error handlers ─────────────────────────────────────────
// These catch errors that happen AFTER startup completes
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error)
  // Don't exit — log and continue
})

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Promise Rejection:', reason)
  // Don't exit — log and continue
})

// ── Run ────────────────────────────────────────────────────────────────────
startServer()