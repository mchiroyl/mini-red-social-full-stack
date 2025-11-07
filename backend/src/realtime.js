import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'

function parseCookie(str) {
  const out = {}
  if (!str) return out
  str.split(';').forEach(part => {
    const [k, v] = part.split('=').map(s => s.trim())
    if (k) out[k] = decodeURIComponent(v || '')
  })
  return out
}

export function setupRealtime(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: process.env.CORS_ORIGIN, credentials: true }
  })

  io.use((socket, next) => {
    const token =
      socket.handshake.auth?.token ||
      (socket.handshake.headers?.authorization || '').replace('Bearer ', '') ||
      parseCookie(socket.handshake.headers?.cookie || '').token
    if (!token) return next(new Error('Unauthorized'))
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET)
      socket.user = { id: payload.id }
      return next()
    } catch (e) {
      return next(new Error('Unauthorized'))
    }
  })

  io.on('connection', (socket) => {
    const userId = socket.user.id
    socket.join(`user:${userId}`)

    socket.on('chat:send', async ({ toUserId, content }) => {
      if (!toUserId || !content) return
      // Persist via HTTP routes in a real app; for demo, do a simple insert:
      // We can't import pool here without a cycle in some setups; but it's fine to import lazily:
      const { default: pool } = await import('./db/pool.js')
      await pool.query('INSERT INTO messages(sender_id, recipient_id, content) VALUES($1,$2,$3)', [userId, toUserId, content])

      // Create notification for new message
      await pool.query(
        'INSERT INTO notifications(user_id, actor_id, type) VALUES($1,$2,$3)',
        [toUserId, userId, 'message']
      )

      // Emit message to recipient and sender
      io.to(`user:${toUserId}`).emit('chat:message', { from: userId, content, created_at: new Date().toISOString() })
      io.to(`user:${userId}`).emit('chat:message', { from: userId, content, created_at: new Date().toISOString(), self: true })

      // Emit notification to recipient
      io.to(`user:${toUserId}`).emit('notification:new', {
        type: 'message',
        actor_id: userId,
        created_at: new Date().toISOString()
      })
    })

    // Handle typing indicator
    socket.on('chat:typing', ({ toUserId, username, isTyping }) => {
      if (!toUserId) return
      io.to(`user:${toUserId}`).emit('chat:user-typing', {
        userId: userId,
        username: username,
        isTyping: isTyping
      })
    })
  })

  return { io }
}
