import express from 'express'
import pool from '../db/pool.js'
import { authMiddleware, getUserById } from '../auth.js'

const router = express.Router()

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Get current authenticated user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *             example:
 *               user:
 *                 id: 1
 *                 username: johndoe
 *                 email: john@example.com
 *                 created_at: "2024-01-15T10:30:00.000Z"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unauthorized
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
router.get('/me', authMiddleware, async (req, res) => {
  const me = await getUserById(req.user.id)
  res.json({ user: me })
})

/**
 * @swagger
 * /api/users/{username}:
 *   get:
 *     summary: Get user profile by username
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: Username of the user to retrieve
 *         example: johndoe
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *             example:
 *               user:
 *                 id: 1
 *                 username: johndoe
 *                 email: john@example.com
 *                 created_at: "2024-01-15T10:30:00.000Z"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Not found
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
router.get('/:username', async (req, res) => {
  const { username } = req.params
  const { rows } = await pool.query('SELECT id, username, email, created_at FROM users WHERE username=$1', [username])
  if (!rows[0]) return res.status(404).json({ error: 'Not found' })
  res.json({ user: rows[0] })
})

/**
 * @swagger
 * /api/users/{id}/follow:
 *   post:
 *     summary: Follow or unfollow a user (toggle)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID to follow/unfollow
 *         example: 2
 *     responses:
 *       200:
 *         description: Follow/unfollow action completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 action:
 *                   type: string
 *                   enum: [followed, unfollowed]
 *                   example: followed
 *       400:
 *         description: Cannot follow yourself
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Cannot follow yourself
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unauthorized
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
router.post('/:id/follow', authMiddleware, async (req, res) => {
  const targetId = parseInt(req.params.id, 10)
  const me = req.user.id
  if (me === targetId) return res.status(400).json({ error: 'Cannot follow yourself' })

  const { rows: exists } = await pool.query(
    'SELECT 1 FROM follows WHERE follower_id=$1 AND following_id=$2', [me, targetId]
  )
  let action = 'followed'
  if (exists.length) {
    await pool.query('DELETE FROM follows WHERE follower_id=$1 AND following_id=$2', [me, targetId])
    action = 'unfollowed'
  } else {
    await pool.query('INSERT INTO follows(follower_id, following_id) VALUES($1,$2)', [me, targetId])
    // notification
    await pool.query(
      'INSERT INTO notifications(user_id, actor_id, type) VALUES($1,$2,$3)',
      [targetId, me, 'follow']
    )
    // emit real-time notification
    req.app.get('io').to(`user:${targetId}`).emit('notification:new', {
      type: 'follow',
      actor_id: me,
      created_at: new Date().toISOString()
    })
    // emit feed dirty
    req.app.get('io').emit('feed:dirty')
  }
  res.json({ ok: true, action })
})

/**
 * @swagger
 * /api/users/{id}/followers:
 *   get:
 *     summary: Get list of users following a specific user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *         example: 1
 *     responses:
 *       200:
 *         description: List of followers retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 followers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       username:
 *                         type: string
 *             example:
 *               followers:
 *                 - id: 2
 *                   username: janedoe
 *                 - id: 3
 *                   username: bobsmith
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
router.get('/:id/followers', async (req, res) => {
  const uid = parseInt(req.params.id, 10)
  const { rows } = await pool.query(
    `SELECT u.id, u.username FROM follows f
     JOIN users u ON u.id = f.follower_id
     WHERE f.following_id=$1`, [uid]
  )
  res.json({ followers: rows })
})

/**
 * @swagger
 * /api/users/{id}/following:
 *   get:
 *     summary: Get list of users that a specific user is following
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *         example: 1
 *     responses:
 *       200:
 *         description: List of following users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 following:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       username:
 *                         type: string
 *             example:
 *               following:
 *                 - id: 4
 *                   username: alicejones
 *                 - id: 5
 *                   username: charliebrown
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
router.get('/:id/following', async (req, res) => {
  const uid = parseInt(req.params.id, 10)
  const { rows } = await pool.query(
    `SELECT u.id, u.username FROM follows f
     JOIN users u ON u.id = f.following_id
     WHERE f.follower_id=$1`, [uid]
  )
  res.json({ following: rows })
})

export default router
