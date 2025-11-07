import { useState } from 'react'
import { useRouter } from 'next/router'
import { api } from '@/lib/api'

export default function PostCard({ post, onLike, onDelete, onCommentAdded, currentUserId }) {
  const router = useRouter()
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [loadingComments, setLoadingComments] = useState(false)
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyText, setReplyText] = useState('')

  const toggleComments = async () => {
    if (!showComments && comments.length === 0) {
      setLoadingComments(true)
      try {
        const data = await api(`/api/posts/${post.id}/comments`)
        setComments(data.comments || [])
      } catch (e) {
        console.error('Error loading comments:', e)
      }
      setLoadingComments(false)
    }
    setShowComments(!showComments)
  }

  const addComment = async () => {
    if (!newComment.trim()) return
    try {
      const data = await api(`/api/posts/${post.id}/comments`, {
        method: 'POST',
        body: { content: newComment }
      })
      const commentWithUsername = {
        ...data.comment,
        username: post.current_username || 'You'
      }
      setComments([...comments, commentWithUsername])
      setNewComment('')
      if (onCommentAdded) onCommentAdded(post.id)
    } catch (e) {
      console.error('Error adding comment:', e)
    }
  }

  const deleteComment = async (commentId) => {
    try {
      await api(`/api/posts/comment/${commentId}`, { method: 'DELETE' })
      setComments(comments.filter(c => c.id !== commentId))
      if (onCommentAdded) onCommentAdded(post.id)
    } catch (e) {
      console.error('Error deleting comment:', e)
    }
  }

  const addReply = async (parentId) => {
    if (!replyText.trim()) return
    try {
      const data = await api(`/api/posts/${post.id}/comments`, {
        method: 'POST',
        body: { content: replyText, parent_id: parentId }
      })
      const replyWithUsername = {
        ...data.comment,
        username: post.current_username || 'You',
        replies: []
      }

      // Add reply to parent comment
      setComments(comments.map(c => {
        if (c.id === parentId) {
          return { ...c, replies: [...c.replies, replyWithUsername] }
        }
        return c
      }))

      setReplyText('')
      setReplyingTo(null)
      if (onCommentAdded) onCommentAdded(post.id)
    } catch (e) {
      console.error('Error adding reply:', e)
    }
  }

  return (
    <div className="card" id={`post-${post.id}`}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'var(--fb-blue)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '18px',
            marginRight: '12px',
            cursor: 'pointer'
          }}
          onClick={() => router.push(`/profile/${post.username}`)}
        >
          {post.username[0].toUpperCase()}
        </div>
        <div>
          <div
            style={{
              fontWeight: '600',
              fontSize: '15px',
              cursor: 'pointer',
              color: 'var(--fb-blue)'
            }}
            onClick={() => router.push(`/profile/${post.username}`)}
            onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
            onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
          >
            @{post.username}
          </div>
          <small className="muted">{new Date(post.created_at).toLocaleString()}</small>
        </div>
      </div>

      <div style={{ marginBottom: '12px', fontSize: '15px', lineHeight: '1.5' }}>
        {post.content}
      </div>

      <hr />

      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
        <button
          className="secondary post-action-btn"
          onClick={() => onLike(post.id)}
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', minWidth: '120px' }}
        >
          ❤️ <span className="action-text">Me gusta</span> ({post.likes_count})
        </button>
        <button
          className="secondary post-action-btn"
          onClick={toggleComments}
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', minWidth: '120px' }}
        >
          💬 <span className="action-text">Comentar</span> ({post.comments_count})
        </button>
        {onDelete && (
          <button
            className="danger"
            onClick={() => onDelete(post.id)}
            style={{ padding: '8px 16px' }}
          >
            🗑️
          </button>
        )}
      </div>

      {showComments && (
        <div style={{ marginTop: '16px', borderTop: '1px solid var(--fb-border)', paddingTop: '16px' }}>
          {loadingComments ? (
            <p style={{ color: 'var(--fb-text-secondary)' }}>Cargando comentarios...</p>
          ) : (
            <>
              <div style={{ marginBottom: '16px' }}>
                <textarea
                  placeholder="Escribe un comentario..."
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  style={{ minHeight: '60px', marginBottom: '8px' }}
                />
                <button onClick={addComment}>Comentar</button>
              </div>
              <div className="list">
                {comments.length === 0 ? (
                  <p className="muted">No hay comentarios aún</p>
                ) : (
                  comments.map(c => (
                    <div key={c.id} style={{ marginBottom: '16px' }}>
                      {/* Main comment */}
                      <div
                        style={{
                          padding: '12px',
                          background: 'var(--fb-gray-bg)',
                          borderRadius: '8px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: 'var(--fb-blue)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '14px',
                            marginRight: '8px'
                          }}>
                            {c.username[0].toUpperCase()}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '600', fontSize: '13px' }}>@{c.username}</div>
                            <small className="muted">{new Date(c.created_at).toLocaleString()}</small>
                          </div>
                          {currentUserId === c.user_id && (
                            <button
                              className="danger"
                              onClick={() => deleteComment(c.id)}
                              style={{ fontSize: '12px', padding: '4px 10px' }}
                            >
                              Eliminar
                            </button>
                          )}
                        </div>
                        <div style={{ paddingLeft: '40px', fontSize: '14px', marginBottom: '8px' }}>{c.content}</div>
                        <div style={{ paddingLeft: '40px' }}>
                          <button
                            className="secondary"
                            onClick={() => setReplyingTo(replyingTo === c.id ? null : c.id)}
                            style={{ fontSize: '12px', padding: '4px 10px' }}
                          >
                            💬 Responder
                          </button>
                        </div>

                        {/* Reply form */}
                        {replyingTo === c.id && (
                          <div style={{ paddingLeft: '40px', marginTop: '12px' }}>
                            <textarea
                              placeholder="Escribe una respuesta..."
                              value={replyText}
                              onChange={e => setReplyText(e.target.value)}
                              style={{ minHeight: '50px', marginBottom: '8px', fontSize: '13px' }}
                            />
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                onClick={() => addReply(c.id)}
                                style={{ fontSize: '12px', padding: '6px 12px' }}
                              >
                                Responder
                              </button>
                              <button
                                className="secondary"
                                onClick={() => { setReplyingTo(null); setReplyText('') }}
                                style={{ fontSize: '12px', padding: '6px 12px' }}
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Replies */}
                      {c.replies && c.replies.length > 0 && (
                        <div style={{ marginLeft: '40px', marginTop: '8px' }}>
                          {c.replies.map(reply => (
                            <div
                              key={reply.id}
                              style={{
                                marginBottom: '8px',
                                padding: '10px',
                                background: 'var(--fb-hover)',
                                borderRadius: '8px',
                                borderLeft: '3px solid var(--fb-blue)'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
                                <div style={{
                                  width: '28px',
                                  height: '28px',
                                  borderRadius: '50%',
                                  background: 'var(--fb-blue)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: 'white',
                                  fontWeight: 'bold',
                                  fontSize: '12px',
                                  marginRight: '8px'
                                }}>
                                  {reply.username[0].toUpperCase()}
                                </div>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontWeight: '600', fontSize: '12px' }}>@{reply.username}</div>
                                  <small className="muted" style={{ fontSize: '11px' }}>{new Date(reply.created_at).toLocaleString()}</small>
                                </div>
                                {currentUserId === reply.user_id && (
                                  <button
                                    className="danger"
                                    onClick={() => deleteComment(reply.id)}
                                    style={{ fontSize: '11px', padding: '3px 8px' }}
                                  >
                                    Eliminar
                                  </button>
                                )}
                              </div>
                              <div style={{ paddingLeft: '36px', fontSize: '13px' }}>{reply.content}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
