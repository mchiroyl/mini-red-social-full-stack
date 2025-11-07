import express from 'express'
import crypto from 'crypto'
import pool from '../db/pool.js'
import { hashPassword, verifyPassword, signToken, setAuthCookie, clearAuthCookie } from '../auth.js'

const router = express.Router()

// Helper function to generate secure token
function generateResetToken() {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user account
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: johndoe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: SecurePass123!
 *     responses:
 *       200:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Missing fields
 *       409:
 *         description: User or email already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: User or email already exists
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Server error
 */
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body
  if (!username || !email || !password) return res.status(400).json({ error: 'Missing fields' })
  try {
    const { rows: dupU } = await pool.query('SELECT 1 FROM users WHERE username=$1 OR email=$2', [username, email])
    if (dupU.length) return res.status(409).json({ error: 'User or email already exists' })
    const password_hash = await hashPassword(password)
    const { rows } = await pool.query(
      'INSERT INTO users(username, email, password_hash) VALUES($1,$2,$3) RETURNING id, username, email, created_at',
      [username, email, password_hash]
    )
    const token = signToken({ id: rows[0].id })
    setAuthCookie(res, token)
    res.json({ user: rows[0], token })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Server error' })
  }
})

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login with existing user credentials
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: SecurePass123!
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Missing fields
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid credentials
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Server error
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Missing fields' })
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE email=$1', [email])
    const user = rows[0]
    if (!user) return res.status(401).json({ error: 'Invalid credentials' })
    const ok = await verifyPassword(password, user.password_hash)
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' })
    const token = signToken({ id: user.id })
    setAuthCookie(res, token)
    res.json({ user: { id: user.id, username: user.username, email: user.email, created_at: user.created_at }, token })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Server error' })
  }
})

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout current user and clear authentication cookie
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 */
router.post('/logout', (_req, res) => {
  clearAuthCookie(res)
  res.json({ ok: true })
})

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *     responses:
 *       200:
 *         description: Reset token generated (always returns success for security)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Si el email existe, recibirás un enlace de recuperación
 *                 token:
 *                   type: string
 *                   description: Reset token (in production, this would be sent via email)
 *                   example: a1b2c3d4e5f6...
 *       400:
 *         description: Missing email
 *       500:
 *         description: Server error
 */
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body
  if (!email) return res.status(400).json({ error: 'Email es requerido' })

  try {
    // Find user by email
    const { rows } = await pool.query('SELECT id, username FROM users WHERE email=$1', [email])

    // Always return success message for security (don't reveal if email exists)
    if (rows.length === 0) {
      return res.json({
        message: 'Si el email existe, recibirás un enlace de recuperación',
        info: 'Email no encontrado (solo para desarrollo)'
      })
    }

    const user = rows[0]
    const token = generateResetToken()
    const expiresAt = new Date(Date.now() + 3600000) // 1 hour from now

    // Invalidate any existing tokens for this user
    await pool.query('UPDATE password_reset_tokens SET used=TRUE WHERE user_id=$1 AND used=FALSE', [user.id])

    // Create new reset token
    await pool.query(
      'INSERT INTO password_reset_tokens(user_id, token, expires_at) VALUES($1, $2, $3)',
      [user.id, token, expiresAt]
    )

    // In production, you would send an email here with the reset link
    // For now, we'll return the token in the response (ONLY FOR DEVELOPMENT)
    console.log(`[Password Reset] Token for ${email}: ${token}`)
    console.log(`[Password Reset] Link: http://localhost:3000/reset-password?token=${token}`)

    res.json({
      message: 'Si el email existe, recibirás un enlace de recuperación',
      // REMOVE THIS IN PRODUCTION - only for testing
      token,
      resetLink: `http://localhost:3000/reset-password?token=${token}`
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Error del servidor' })
  }
})

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password using token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *                 example: a1b2c3d4e5f6...
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 example: NewSecurePass123!
 *     responses:
 *       200:
 *         description: Password reset successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Contraseña actualizada exitosamente
 *       400:
 *         description: Missing fields or invalid/expired token
 *       500:
 *         description: Server error
 */
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body

  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Token y nueva contraseña son requeridos' })
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' })
  }

  try {
    // Find valid token
    const { rows } = await pool.query(
      `SELECT user_id FROM password_reset_tokens
       WHERE token=$1 AND used=FALSE AND expires_at > NOW()`,
      [token]
    )

    if (rows.length === 0) {
      return res.status(400).json({ error: 'Token inválido o expirado' })
    }

    const userId = rows[0].user_id

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword)

    // Update user password
    await pool.query('UPDATE users SET password_hash=$1 WHERE id=$2', [newPasswordHash, userId])

    // Mark token as used
    await pool.query('UPDATE password_reset_tokens SET used=TRUE WHERE token=$1', [token])

    res.json({ message: 'Contraseña actualizada exitosamente' })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Error del servidor' })
  }
})

/**
 * @swagger
 * /api/auth/verify-reset-token:
 *   post:
 *     summary: Verify if a reset token is valid
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 example: a1b2c3d4e5f6...
 *     responses:
 *       200:
 *         description: Token is valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Token is invalid or expired
 */
router.post('/verify-reset-token', async (req, res) => {
  const { token } = req.body

  if (!token) {
    return res.status(400).json({ valid: false, error: 'Token es requerido' })
  }

  try {
    const { rows } = await pool.query(
      `SELECT user_id FROM password_reset_tokens
       WHERE token=$1 AND used=FALSE AND expires_at > NOW()`,
      [token]
    )

    res.json({ valid: rows.length > 0 })
  } catch (e) {
    console.error(e)
    res.status(500).json({ valid: false, error: 'Error del servidor' })
  }
})

export default router
