import express from 'express'
import pool from '../db/pool.js'
import { authMiddleware } from '../auth.js'

const router = express.Router()

/**
 * @swagger
 * /api/posts:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 example: This is my first post on this social network!
 *     responses:
 *       200:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 post:
 *                   $ref: '#/components/schemas/Post'
 *             example:
 *               post:
 *                 id: 1
 *                 user_id: 1
 *                 content: This is my first post on this social network!
 *                 created_at: "2024-01-15T10:30:00.000Z"
 *       400:
 *         description: Content required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Content required
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
router.post('/', authMiddleware, async (req, res) => {
  const { content } = req.body
  if (!content) return res.status(400).json({ error: 'Content required' })
  const { rows } = await pool.query(
    'INSERT INTO posts(user_id, content) VALUES($1,$2) RETURNING *',
    [req.user.id, content]
  )
  req.app.get('io').emit('feed:dirty')
  res.json({ post: rows[0] })
})

/**
 * @swagger
 * /api/posts/feed:
 *   get:
 *     summary: Get personalized feed of posts (from followed users or all posts)
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: all
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: If true, returns all posts. If false/omitted, returns posts from followed users only
 *         example: false
 *     responses:
 *       200:
 *         description: Feed retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 posts:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/Post'
 *                       - type: object
 *                         properties:
 *                           username:
 *                             type: string
 *                           likes_count:
 *                             type: integer
 *                           comments_count:
 *                             type: integer
 *             example:
 *               posts:
 *                 - id: 1
 *                   user_id: 2
 *                   username: janedoe
 *                   content: Hello world!
 *                   created_at: "2024-01-15T10:30:00.000Z"
 *                   likes_count: 5
 *                   comments_count: 3
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
router.get('/feed', authMiddleware, async (req, res) => {
  const me = req.user.id
  const isAll = req.query.all === 'true'
  let query = ''
  let args = []
  if (isAll) {
    query = `SELECT p.*, u.username,
      (SELECT COUNT(*)::int FROM likes l WHERE l.post_id = p.id) as likes_count,
      (SELECT COUNT(*)::int FROM comments c WHERE c.post_id = p.id) as comments_count
    FROM posts p
    JOIN users u ON u.id = p.user_id
    ORDER BY p.created_at DESC
    LIMIT 100`
  } else {
    query = `SELECT p.*, u.username,
      (SELECT COUNT(*)::int FROM likes l WHERE l.post_id = p.id) as likes_count,
      (SELECT COUNT(*)::int FROM comments c WHERE c.post_id = p.id) as comments_count
    FROM posts p
    JOIN users u ON u.id = p.user_id
    WHERE p.user_id=$1 OR p.user_id IN (
      SELECT following_id FROM follows WHERE follower_id=$1
    )
    ORDER BY p.created_at DESC
    LIMIT 100`
    args = [me]
  }
  const { rows } = await pool.query(query, args)
  res.json({ posts: rows })
})

/**
 * @swagger
 * /api/posts/{id}:
 *   delete:
 *     summary: Delete a post (only if you are the owner)
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Post ID to delete
 *         example: 1
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
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
 *       404:
 *         description: Post not found or you are not the owner
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Not found or not owner
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
router.delete('/:id', authMiddleware, async (req, res) => {
  const pid = parseInt(req.params.id, 10)
  const { rows } = await pool.query('DELETE FROM posts WHERE id=$1 AND user_id=$2 RETURNING id', [pid, req.user.id])
  if (!rows[0]) return res.status(404).json({ error: 'Not found or not owner' })
  req.app.get('io').emit('feed:dirty')
  res.json({ ok: true })
})

export default router
