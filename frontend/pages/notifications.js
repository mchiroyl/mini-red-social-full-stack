import { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import { api } from '@/lib/api'
import { getSocket, disconnectSocket } from '@/lib/socket'

export default function Notifications() {
  const [user, setUser] = useState(null)
  const [notifications, setNotifications] = useState([])

  const load = async () => {
    try {
      const me = await api('/api/users/me')
      setUser(me.user)
      const data = await api('/api/notifications')
      setNotifications(data.notifications)
    } catch (e) {
      window.location.href = '/'
    }
  }

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    const s = getSocket()
    s.on('notification:new', (notif) => {
      // Add new notification to the top of the list
      load() // Reload to get complete notification with username
    })
    return () => {
      s.off('notification:new')
      disconnectSocket()
    }
  }, [])

  const markAsSeen = async () => {
    await api('/api/notifications/seen', { method: 'POST' })
    setNotifications(ns => ns.map(n => ({ ...n, seen: true })))
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return '❤️'
      case 'comment':
        return '💬'
      case 'follow':
        return '👤'
      case 'message':
        return '📩'
      default:
        return '🔔'
    }
  }

  const getNotificationText = (n) => {
    switch (n.type) {
      case 'like':
        return (
          <>
            <strong>@{n.actor_username}</strong> le dio like a tu publicación
          </>
        )
      case 'comment':
        return (
          <>
            <strong>@{n.actor_username}</strong> comentó tu publicación
          </>
        )
      case 'follow':
        return (
          <>
            <strong>@{n.actor_username}</strong> comenzó a seguirte
          </>
        )
      case 'message':
        return (
          <>
            <strong>@{n.actor_username}</strong> te envió un mensaje
          </>
        )
      default:
        return 'Nueva notificación'
    }
  }

  const handleNotificationClick = (n) => {
    // Mark as seen when clicking
    if (!n.seen) {
      api('/api/notifications/seen', { method: 'POST' }).catch(console.error)
    }

    // Navigate to specific location
    switch (n.type) {
      case 'like':
      case 'comment':
        // For now, go to feed. In a more advanced version, we could:
        // - Store post_id in ref_id
        // - Navigate to /feed#post-{ref_id} with smooth scroll
        // - Or create a /post/[id] page
        window.location.href = `/feed#post-${n.ref_id}`
        break
      case 'follow':
        window.location.href = `/profile/${n.actor_username}`
        break
      case 'message':
        // Store the user to chat with in localStorage
        localStorage.setItem('chat_with_user', n.actor_id)
        window.location.href = `/chat`
        break
      default:
        window.location.href = '/feed'
    }
  }

  const unseenCount = notifications.filter(n => !n.seen).length

  return (
    <Layout user={user}>
      <div className="card" style={{ marginTop: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🔔 Notificaciones
            </h2>
            {unseenCount > 0 && (
              <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: 'var(--fb-text-secondary)' }}>
                Tienes {unseenCount} notificación{unseenCount !== 1 ? 'es' : ''} nueva{unseenCount !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          {unseenCount > 0 && (
            <button
              onClick={markAsSeen}
              className="secondary"
              style={{ padding: '8px 16px' }}
            >
              ✓ Marcar todas como vistas
            </button>
          )}
        </div>
      </div>

      <div className="list">
        {notifications.length === 0 && (
          <div className="card" style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: 'var(--fb-text-secondary)'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔔</div>
            <div style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
              No tienes notificaciones
            </div>
            <div style={{ fontSize: '14px' }}>
              Cuando alguien interactúe contigo, aparecerán aquí
            </div>
          </div>
        )}
        {notifications.map(n => (
          <div
            key={n.id}
            className="card"
            onClick={() => handleNotificationClick(n)}
            style={{
              backgroundColor: n.seen ? 'var(--fb-white)' : 'var(--fb-blue-light)',
              borderLeft: n.seen ? '4px solid var(--fb-border)' : '4px solid var(--fb-blue)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              padding: '16px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{
                fontSize: '32px',
                flexShrink: 0,
                width: '50px',
                height: '50px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: n.seen ? 'var(--fb-gray-bg)' : 'var(--fb-white)',
                borderRadius: '50%'
              }}>
                {getNotificationIcon(n.type)}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '15px',
                  lineHeight: '1.5',
                  color: 'var(--fb-text-primary)',
                  marginBottom: '6px',
                  fontWeight: n.seen ? 'normal' : '600'
                }}>
                  {getNotificationText(n)}
                </div>
                <div style={{
                  fontSize: '13px',
                  color: 'var(--fb-text-secondary)'
                }}>
                  {new Date(n.created_at).toLocaleString('es-ES', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>

              {!n.seen && (
                <div style={{
                  width: '12px',
                  height: '12px',
                  backgroundColor: 'var(--fb-blue)',
                  borderRadius: '50%',
                  flexShrink: 0,
                  marginTop: '8px'
                }} />
              )}
            </div>
          </div>
        ))}
      </div>
    </Layout>
  )
}
