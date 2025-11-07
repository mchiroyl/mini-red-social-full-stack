import express from 'express'
import http from 'http'
import morgan from 'morgan'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'

import { runMigrations } from './db/migrate.js'
import { setupRealtime } from './realtime.js'
import { mountSwagger } from './swagger.js'

import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'
import postRoutes from './routes/posts.js'
import likeRoutes from './routes/likes.js'
import commentRoutes from './routes/comments.js'
import chatRoutes from './routes/chat.js'
import notificationRoutes from './routes/notifications.js'

dotenv.config()

const app = express()
const server = http.createServer(app)

app.use(morgan('dev'))
app.use(express.json())
app.use(cookieParser())
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }))

mountSwagger(app)

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/posts', likeRoutes)
app.use('/api/posts', commentRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/notifications', notificationRoutes)

/**
 * @swagger
 * /:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is healthy and running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 */
app.get('/', (_req, res) => res.json({ ok: true }))

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Detailed health check with status information
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Detailed health status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-15T10:30:00.000Z"
 *                 uptime:
 *                   type: number
 *                   example: 12345.67
 *                 environment:
 *                   type: string
 *                   example: production
 */
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  })
})

const rt = setupRealtime(server)
app.set('io', rt.io)

const PORT = process.env.PORT || 4000

;(async () => {
  if (process.env.RUN_MIGRATIONS === 'true') {
    console.log('[startup] Running migrations...')
    await runMigrations()
  }
  server.listen(PORT, () => console.log('API ready on :' + PORT))
})()
