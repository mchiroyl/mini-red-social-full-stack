import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import pool from './db/pool.js'

const COOKIE_NAME = 'token'

export function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' })
}

export function setAuthCookie(res, token) {
  const isProd = process.env.COOKIE_SECURE === 'true'
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: isProd ? 'none' : 'lax',
    secure: isProd,
    path: '/'
  })
}

export function clearAuthCookie(res) {
  const isProd = process.env.COOKIE_SECURE === 'true'
  res.cookie(COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: isProd ? 'none' : 'lax',
    secure: isProd,
    path: '/',
    expires: new Date(0)
  })
}

export function authMiddleware(req, res, next) {
  const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Unauthorized' })
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.user = payload
    next()
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

export async function hashPassword(password) {
  const saltRounds = 10
  return await bcrypt.hash(password, saltRounds)
}

export async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash)
}

export async function getUserById(id) {
  const { rows } = await pool.query('SELECT id, username, email, created_at FROM users WHERE id=$1', [id])
  return rows[0] || null
}
