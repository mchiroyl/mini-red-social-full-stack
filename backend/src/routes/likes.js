import express from 'express'
import pool from '../db/pool.js'
import { authMiddleware } from '../auth.js'

const router = express.Router()

/**
 * @swagger
 * /api/likes/{postId}/like:
 *   post:
 *     summary: Like or unlike a post (toggle)
 *     tags: [Likes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Post ID to like/unlike
 *         example: 1
 *     responses:
 *       200:
 *         description: Like/unlike action completed successfully
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
 *                   enum: [liked, unliked]
 *                   example: liked
 *                 likes:
 *                   type: integer
 *                   description: Total number of likes on this post
 *                   example: 12
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
router.post('/:postId/like', authMiddleware, async (req, res) => {
  const pid = parseInt(req.params.postId, 10)
  const me = req.user.id
  const { rows: exists } = await pool.query('SELECT 1 FROM likes WHERE user_id=$1 AND post_id=$2', [me, pid])
  let action = 'liked'
  if (exists.length) {
    await pool.query('DELETE FROM likes WHERE user_id=$1 AND post_id=$2', [me, pid])
    action = 'unliked'
  } else {
    await pool.query('INSERT INTO likes(user_id, post_id) VALUES($1,$2)', [me, pid])
    // notify owner
    const { rows: owner } = await pool.query('SELECT user_id FROM posts WHERE id=$1', [pid])
    if (owner[0] && owner[0].user_id !== me) {
      await pool.query(
        'INSERT INTO notifications(user_id, actor_id, type, ref_id) VALUES($1,$2,$3,$4)',
        [owner[0].user_id, me, 'like', pid]
      )
      // emit real-time notification
      req.app.get('io').to(`user:${owner[0].user_id}`).emit('notification:new', {
        type: 'like',
        actor_id: me,
        ref_id: pid,
        created_at: new Date().toISOString()
      })
    }
  }
  const { rows: count } = await pool.query('SELECT COUNT(*)::int AS n FROM likes WHERE post_id=$1', [pid])
  // emitir update de feed
  req.app.get('io').emit('feed:dirty')
  res.json({ ok: true, action, likes: count[0].n })
})

export default router
