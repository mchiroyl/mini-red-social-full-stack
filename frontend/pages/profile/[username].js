import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import { api } from '@/lib/api'

export default function Profile() {
  const router = useRouter()
  const { username } = router.query
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [status, setStatus] = useState('')
  const [followers, setFollowers] = useState([])
  const [following, setFollowing] = useState([])
  const [showFollowers, setShowFollowers] = useState(false)
  const [showFollowing, setShowFollowing] = useState(false)

  useEffect(() => {
    (async () => {
      try {
        const me = await api('/api/users/me')
        setUser(me.user)
      } catch (e) {
        window.location.href = '/'
      }
    })()
  }, [])

  useEffect(() => {
    if (!username) return
    fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/users/${username}`, { credentials:'include' })
      .then(r => r.json()).then(d => {
        setProfile(d.user)
        // Load followers and following
        if (d.user) {
          loadFollowers(d.user.id)
          loadFollowing(d.user.id)
        }
      })
  }, [username])

  const loadFollowers = async (userId) => {
    try {
      const data = await api(`/api/users/${userId}/followers`)
      setFollowers(data.followers || [])
    } catch (e) {
      console.error('Error loading followers:', e)
    }
  }

  const loadFollowing = async (userId) => {
    try {
      const data = await api(`/api/users/${userId}/following`)
      setFollowing(data.following || [])
    } catch (e) {
      console.error('Error loading following:', e)
    }
  }

  const toggleFollow = async () => {
    if (!profile) return
    const r = await api(`/api/users/${profile.id}/follow`, { method:'POST' })
    setStatus(r.action)
    // Reload followers list after follow/unfollow
    await loadFollowers(profile.id)
  }

  return (
    <Layout user={user}>
      <div className="card" style={{ marginTop: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div className="avatar-large" style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'var(--fb-blue)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '36px',
            flexShrink: 0
          }}>
            {username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <h2 style={{ margin: 0, fontSize: '28px', wordBreak: 'break-word' }}>@{username}</h2>
            {profile && (
              <div style={{ marginTop: '8px', color: 'var(--fb-text-secondary)', fontSize: '14px' }}>
                Usuario registrado
              </div>
            )}
          </div>
        </div>

        <hr />

        {/* Stats */}
        <div style={{
          marginTop: '16px',
          marginBottom: '16px',
          display: 'flex',
          gap: '24px',
          flexWrap: 'wrap'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--fb-blue)' }}>
              {followers.length}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--fb-text-secondary)' }}>
              Seguidores
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--fb-blue)' }}>
              {following.length}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--fb-text-secondary)' }}>
              Siguiendo
            </div>
          </div>
        </div>

        <div style={{ marginTop: '16px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={toggleFollow}
            style={{
              padding: '10px 32px',
              fontSize: '15px',
              fontWeight: 'bold'
            }}
          >
            {status === 'followed' ? '✓ Siguiendo' : status === 'unfollowed' ? '+ Seguir' : '+ Seguir / Dejar de seguir'}
          </button>
          {status && (
            <span style={{
              padding: '8px 16px',
              background: 'var(--fb-success)',
              color: 'white',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              {status === 'followed' ? 'Ahora sigues a este usuario' : 'Dejaste de seguir a este usuario'}
            </span>
          )}
        </div>
      </div>

      {/* Followers Section */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '20px' }}>
            👥 Seguidores ({followers.length})
          </h3>
          <button
            className="secondary"
            onClick={() => setShowFollowers(!showFollowers)}
            style={{ padding: '6px 16px', fontSize: '14px' }}
          >
            {showFollowers ? 'Ocultar' : 'Mostrar'}
          </button>
        </div>

        {showFollowers && (
          <div className="list">
            {followers.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '32px',
                color: 'var(--fb-text-secondary)'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '8px' }}>😔</div>
                <div>Este usuario aún no tiene seguidores</div>
              </div>
            ) : (
              followers.map(follower => (
                <div
                  key={follower.id}
                  style={{
                    padding: '12px',
                    background: 'var(--fb-gray-bg)',
                    borderRadius: '8px',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onClick={() => router.push(`/profile/${follower.username}`)}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--fb-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'var(--fb-gray-bg)'}
                >
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
                    fontSize: '16px'
                  }}>
                    {follower.username[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '15px' }}>
                      @{follower.username}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Following Section */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '20px' }}>
            ➕ Siguiendo ({following.length})
          </h3>
          <button
            className="secondary"
            onClick={() => setShowFollowing(!showFollowing)}
            style={{ padding: '6px 16px', fontSize: '14px' }}
          >
            {showFollowing ? 'Ocultar' : 'Mostrar'}
          </button>
        </div>

        {showFollowing && (
          <div className="list">
            {following.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '32px',
                color: 'var(--fb-text-secondary)'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '8px' }}>🔍</div>
                <div>Este usuario aún no sigue a nadie</div>
              </div>
            ) : (
              following.map(followed => (
                <div
                  key={followed.id}
                  style={{
                    padding: '12px',
                    background: 'var(--fb-gray-bg)',
                    borderRadius: '8px',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onClick={() => router.push(`/profile/${followed.username}`)}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--fb-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'var(--fb-gray-bg)'}
                >
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
                    fontSize: '16px'
                  }}>
                    {followed.username[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '15px' }}>
                      @{followed.username}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <div className="card">
        <h3 style={{ margin: '0 0 16px 0', fontSize: '20px' }}>Acerca de</h3>
        <div style={{
          padding: '20px',
          background: 'var(--fb-gray-bg)',
          borderRadius: '8px',
          textAlign: 'center',
          color: 'var(--fb-text-secondary)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>👤</div>
          <div style={{ fontSize: '15px' }}>
            Perfil de @{username}
          </div>
        </div>
      </div>
    </Layout>
  )
}
