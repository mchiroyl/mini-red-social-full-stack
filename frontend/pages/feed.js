import { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import PostCard from '@/components/PostCard'
import { api } from '@/lib/api'
import { getSocket, disconnectSocket } from '@/lib/socket'

export default function Feed() {
  const [user, setUser] = useState(null)
  const [posts, setPosts] = useState([])
  const [content, setContent] = useState('')
  const [all, setAll] = useState(false)

  const load = async () => {
    try {
      const me = await api('/api/users/me')
      setUser(me.user)
      const data = await api(`/api/posts/feed?all=${all}`)
      setPosts(data.posts)
    } catch (e) {
      window.location.href = '/'
    }
  }

  useEffect(() => { load() }, [all])

  useEffect(() => {
    const s = getSocket()
    s.on('feed:dirty', load)
    return () => { s.off('feed:dirty'); disconnectSocket() }
  }, [all])

  const createPost = async () => {
    if (!content.trim()) return
    await api('/api/posts', { method: 'POST', body: { content } })
    setContent('')
    // load() is triggered by feed:dirty
  }

  const likePost = async (id) => {
    const res = await api(`/api/posts/${id}/like`, { method: 'POST' })
    setPosts(ps => ps.map(p => p.id===id? { ...p, likes_count: res.likes }: p))
  }

  const deletePost = async (id) => {
    await api(`/api/posts/${id}`, { method: 'DELETE' })
    setPosts(ps => ps.filter(p => p.id !== id))
  }

  const handleCommentAdded = (postId) => {
    setPosts(ps => ps.map(p =>
      p.id === postId ? { ...p, comments_count: p.comments_count + 1 } : p
    ))
  }

  return (
    <Layout user={user}>
      <div className="card" style={{ marginTop: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{
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
            flexShrink: 0
          }}>
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <textarea
            placeholder="¿Qué estás pensando?"
            value={content}
            onChange={e => setContent(e.target.value)}
            style={{ flex: 1, minHeight: '50px', resize: 'none', border: 'none', background: 'var(--fb-gray-bg)', padding: '8px' }}
          />
        </div>
        <hr />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <button onClick={createPost} style={{ flex: '1 1 auto', minWidth: '120px' }}>
            📝 Publicar
          </button>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--fb-text-secondary)', flexShrink: 0 }}>
            <input type="checkbox" checked={all} onChange={e => setAll(e.target.checked)} />
            <span className="feed-toggle-text">Ver todas</span>
          </label>
        </div>
      </div>

      <div className="list">
        {posts.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--fb-text-secondary)' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📝</div>
            <div style={{ fontSize: '18px', marginBottom: '8px' }}>No hay publicaciones aún</div>
            <div style={{ fontSize: '14px' }}>¡Sé el primero en publicar algo!</div>
          </div>
        ) : (
          posts.map(p => (
            <PostCard
              key={p.id}
              post={{ ...p, current_username: user?.username }}
              onLike={likePost}
              onDelete={user?.id === p.user_id ? deletePost : undefined}
              onCommentAdded={handleCommentAdded}
              currentUserId={user?.id}
            />
          ))
        )}
      </div>
    </Layout>
  )
}
