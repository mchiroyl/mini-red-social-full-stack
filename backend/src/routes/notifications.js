import express from 'express'
import pool from '../db/pool.js'
import { authMiddleware } from '../auth.js'

const router = express.Router()

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get all notifications for the current user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 notifications:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/Notification'
 *                       - type: object
 *                         properties:
 *                           actor_username:
 *                             type: string
 *             example:
 *               notifications:
 *                 - id: 1
 *                   user_id: 1
 *                   actor_id: 2
 *                   actor_username: janedoe
 *                   type: like
 *                   ref_id: 1
 *                   seen: false
 *                   created_at: "2024-01-15T10:30:00.000Z"
 *                 - id: 2
 *                   user_id: 1
 *                   actor_id: 3
 *                   actor_username: bobsmith
 *                   type: follow
 *                   ref_id: null
 *                   seen: false
 *                   created_at: "2024-01-15T10:25:00.000Z"
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
router.get('/', authMiddleware, async (req, res) => {
  const { rows } = await pool.query(
    `SELECT n.*, u.username as actor_username
     FROM notifications n
     JOIN users u ON u.id = n.actor_id
     WHERE n.user_id=$1
     ORDER BY n.created_at DESC
     LIMIT 50`, [req.user.id]
  )
  res.json({ notifications: rows })
})

/**
 * @swagger
 * /api/notifications/seen:
 *   post:
 *     summary: Mark all notifications as seen for the current user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as seen
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
router.post('/seen', authMiddleware, async (req, res) => {
  await pool.query('UPDATE notifications SET seen=true WHERE user_id=$1', [req.user.id])
  res.json({ ok: true })
})

export default router
