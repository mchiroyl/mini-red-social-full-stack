import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { getSocket } from '@/lib/socket'

export default function Layout({ user, children }) {
  const [unseenCount, setUnseenCount] = useState(0)

  useEffect(() => {
    if (!user) return

    // Load initial notification count
    const loadNotifications = async () => {
      try {
        const data = await api('/api/notifications')
        const unseen = data.notifications.filter(n => !n.seen).length
        setUnseenCount(unseen)
      } catch (e) {
        console.error('Error loading notifications:', e)
      }
    }
    loadNotifications()

    // Listen for new notifications
    const s = getSocket()
    s.on('notification:new', () => {
      setUnseenCount(prev => prev + 1)
    })

    return () => {
      s.off('notification:new')
    }
  }, [user])

  return (
    <>
      <div style={{
        background: 'var(--fb-white)',
        borderBottom: '1px solid var(--fb-border)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
      }}>
        <div className="container">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 0'
          }}>
            <div style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: 'var(--fb-blue)',
              fontFamily: 'sans-serif',
              letterSpacing: '-0.5px'
            }}>
              Mini Red Social
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              {user ? (
                <>
                  <a href="/feed" style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    transition: 'background 0.2s',
                    background: window.location.pathname === '/feed' ? 'var(--fb-blue-light)' : 'transparent',
                    fontSize: '14px',
                    whiteSpace: 'nowrap'
                  }}>
                    🏠 <span className="nav-text">Inicio</span>
                  </a>
                  <a href="/chat" style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    transition: 'background 0.2s',
                    background: window.location.pathname === '/chat' ? 'var(--fb-blue-light)' : 'transparent',
                    fontSize: '14px',
                    whiteSpace: 'nowrap'
                  }}>
                    💬 <span className="nav-text">Chat</span>
                  </a>
                  <a href="/notifications" style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    transition: 'background 0.2s',
                    background: window.location.pathname === '/notifications' ? 'var(--fb-blue-light)' : 'transparent',
                    position: 'relative',
                    fontSize: '14px',
                    whiteSpace: 'nowrap'
                  }}>
                    🔔 <span className="nav-text">Notif</span>
                    {unseenCount > 0 && (
                      <span style={{
                        position: 'absolute',
                        top: '2px',
                        right: '4px',
                        backgroundColor: 'var(--fb-danger)',
                        color: 'white',
                        borderRadius: '10px',
                        minWidth: '18px',
                        height: '18px',
                        fontSize: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        padding: '0 4px'
                      }}>
                        {unseenCount > 9 ? '9+' : unseenCount}
                      </span>
                    )}
                  </a>
                  <span className="badge" style={{ display: 'none' }}>@{user.username}</span>
                  <a href="/" style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    background: 'var(--fb-hover)',
                    color: 'var(--fb-text-primary)',
                    fontSize: '14px'
                  }}>
                    👋
                  </a>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>
      <div className="container">
        {children}
      </div>

      <style jsx>{`
        @media screen and (max-width: 480px) {
          .nav-text {
            display: none;
          }
          .badge {
            display: none !important;
          }
        }

        @media screen and (min-width: 481px) {
          .badge {
            display: inline-block !important;
          }
        }
      `}</style>
    </>
  )
}
