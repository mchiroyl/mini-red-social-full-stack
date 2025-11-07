import express from 'express'
import pool from '../db/pool.js'
import { authMiddleware } from '../auth.js'

const router = express.Router()

/**
 * @swagger
 * /api/chat/history/{userId}:
 *   get:
 *     summary: Get chat message history between current user and another user
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID to get chat history with
 *         example: 2
 *     responses:
 *       200:
 *         description: Chat history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 messages:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Message'
 *             example:
 *               messages:
 *                 - id: 1
 *                   sender_id: 1
 *                   recipient_id: 2
 *                   content: Hello!
 *                   created_at: "2024-01-15T10:30:00.000Z"
 *                 - id: 2
 *                   sender_id: 2
 *                   recipient_id: 1
 *                   content: Hi there!
 *                   created_at: "2024-01-15T10:31:00.000Z"
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
router.get('/history/:userId', authMiddleware, async (req, res) => {
  const other = parseInt(req.params.userId, 10)
  const me = req.user.id
  const { rows } = await pool.query(
    `SELECT * FROM messages
     WHERE (sender_id=$1 AND recipient_id=$2) OR (sender_id=$2 AND recipient_id=$1)
     ORDER BY created_at ASC
     LIMIT 200`, [me, other]
  )
  res.json({ messages: rows })
})

export default router
