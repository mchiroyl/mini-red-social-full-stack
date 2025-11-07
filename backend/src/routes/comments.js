import express from 'express'
import pool from '../db/pool.js'
import { authMiddleware } from '../auth.js'

const router = express.Router()

/**
 * @swagger
 * /api/posts/{postId}/comments:
 *   get:
 *     summary: Get all comments for a specific post
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Post ID to get comments from
 *         example: 1
 *     responses:
 *       200:
 *         description: Comments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 comments:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/Comment'
 *                       - type: object
 *                         properties:
 *                           username:
 *                             type: string
 *             example:
 *               comments:
 *                 - id: 1
 *                   post_id: 1
 *                   user_id: 2
 *                   username: janedoe
 *                   content: Great post!
 *                   created_at: "2024-01-15T10:35:00.000Z"
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
router.get('/:postId/comments', async (req, res) => {
  const pid = parseInt(req.params.postId, 10)
  const { rows } = await pool.query(
    `SELECT c.*, u.username FROM comments c
     JOIN users u ON u.id = c.user_id
     WHERE c.post_id=$1 ORDER BY c.created_at ASC`, [pid]
  )
  // Organize comments into tree structure (parent comments and replies)
  const commentMap = {}
  const topLevelComments = []

  rows.forEach(comment => {
    comment.replies = []
    commentMap[comment.id] = comment
  })

  rows.forEach(comment => {
    if (comment.parent_id) {
      // This is a reply
      if (commentMap[comment.parent_id]) {
        commentMap[comment.parent_id].replies.push(comment)
      }
    } else {
      // This is a top-level comment
      topLevelComments.push(comment)
    }
  })

  res.json({ comments: topLevelComments })
})

/**
 * @swagger
 * /api/posts/{postId}/comments:
 *   post:
 *     summary: Create a new comment on a post
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Post ID to comment on
 *         example: 1
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
 *                 example: This is a great post!
 *     responses:
 *       200:
 *         description: Comment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 comment:
 *                   $ref: '#/components/schemas/Comment'
 *             example:
 *               comment:
 *                 id: 1
 *                 post_id: 1
 *                 user_id: 1
 *                 content: This is a great post!
 *                 created_at: "2024-01-15T10:35:00.000Z"
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
router.post('/:postId/comments', authMiddleware, async (req, res) => {
  const pid = parseInt(req.params.postId, 10)
  const { content, parent_id } = req.body
  if (!content) return res.status(400).json({ error: 'Content required' })
  const { rows } = await pool.query(
    'INSERT INTO comments(post_id, user_id, content, parent_id) VALUES($1,$2,$3,$4) RETURNING *',
    [pid, req.user.id, content, parent_id || null]
  )
  // notify owner
  const { rows: owner } = await pool.query('SELECT user_id FROM posts WHERE id=$1', [pid])
  if (owner[0] && owner[0].user_id !== req.user.id) {
    await pool.query(
      'INSERT INTO notifications(user_id, actor_id, type, ref_id) VALUES($1,$2,$3,$4)',
      [owner[0].user_id, req.user.id, 'comment', pid]
    )
    // emit real-time notification
    req.app.get('io').to(`user:${owner[0].user_id}`).emit('notification:new', {
      type: 'comment',
      actor_id: req.user.id,
      ref_id: pid,
      created_at: new Date().toISOString()
    })
  }
  // emit feed refresh
  req.app.get('io').emit('feed:dirty')
  res.json({ comment: rows[0] })
})

/**
 * @swagger
 * /api/posts/comment/{id}:
 *   delete:
 *     summary: Delete a comment (only if you are the owner)
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Comment ID to delete
 *         example: 1
 *     responses:
 *       200:
 *         description: Comment deleted successfully
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
 *         description: Comment not found or you are not the owner
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
router.delete('/comment/:id', authMiddleware, async (req, res) => {
  const cid = parseInt(req.params.id, 10)
  const { rows } = await pool.query('DELETE FROM comments WHERE id=$1 AND user_id=$2 RETURNING id', [cid, req.user.id])
  if (!rows[0]) return res.status(404).json({ error: 'Not found or not owner' })
  req.app.get('io').emit('feed:dirty')
  res.json({ ok: true })
})

export default router
