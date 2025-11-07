import { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import { api } from '@/lib/api'
import { getSocket, disconnectSocket } from '@/lib/socket'

export default function Chat() {
  const [user, setUser] = useState(null)
  const [toUserId, setToUserId] = useState('')
  const [users, setUsers] = useState([])
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [socket, setSocket] = useState(null)
  const [isTyping, setIsTyping] = useState(false)
  const [typingTimeout, setTypingTimeout] = useState(null)

  useEffect(() => {
    (async () => {
      try {
        const me = await api('/api/users/me')
        setUser(me.user)
        // construir lista de usuarios a partir del feed general
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/posts/feed?all=true`, { credentials:'include' })
        const data = await res.json()
        const uniqueUsers = {}
        data.posts.forEach(p => { if (p.user_id !== me.user.id) uniqueUsers[p.user_id] = { id: p.user_id, username: p.username } })
        setUsers(Object.values(uniqueUsers))

        // Check if coming from a notification (localStorage)
        const chatWithUser = localStorage.getItem('chat_with_user')
        if (chatWithUser) {
          localStorage.removeItem('chat_with_user') // Clear after reading
          // Wait a bit for users to be set, then select
          setTimeout(() => selectUser(chatWithUser), 100)
        }
      } catch (e) {
        window.location.href = '/'
      }
    })()
  }, [])

  useEffect(() => {
    const s = getSocket()
    setSocket(s)
    s.on('chat:message', (msg) => setMessages(prev => [...prev, msg]))

    // Listen for typing indicator
    s.on('chat:user-typing', ({ userId, username, isTyping }) => {
      // Only show typing indicator if it's from the current chat partner
      if (toUserId && parseInt(toUserId) === userId) {
        setIsTyping(isTyping)
        if (isTyping) {
          // Auto-hide typing indicator after 3 seconds
          setTimeout(() => setIsTyping(false), 3000)
        }
      }
    })

    return () => {
      s.off('chat:message')
      s.off('chat:user-typing')
      disconnectSocket()
    }
  }, [toUserId])

  const selectUser = async (id) => {
    setToUserId(id)
    const data = await api(`/api/chat/history/${id}`)
    setMessages(data.messages)
  }

  const handleTyping = (value) => {
    setText(value)

    if (!toUserId || !socket) return

    // Clear previous timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout)
    }

    // Emit typing event
    socket.emit('chat:typing', {
      toUserId: parseInt(toUserId, 10),
      username: user?.username,
      isTyping: true
    })

    // Set timeout to stop typing indicator
    const timeout = setTimeout(() => {
      socket.emit('chat:typing', {
        toUserId: parseInt(toUserId, 10),
        username: user?.username,
        isTyping: false
      })
    }, 1000)

    setTypingTimeout(timeout)
  }

  const send = () => {
    if (!toUserId || !text.trim()) return

    // Clear typing timeout and emit stop typing
    if (typingTimeout) {
      clearTimeout(typingTimeout)
    }
    socket.emit('chat:typing', {
      toUserId: parseInt(toUserId, 10),
      username: user?.username,
      isTyping: false
    })

    socket.emit('chat:send', { toUserId: parseInt(toUserId, 10), content: text })
    setText('')
    setIsTyping(false)
  }

  return (
    <Layout user={user}>
      <div className="card" style={{ marginTop: '16px' }}>
        <h2 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          💬 Chat 1:1
        </h2>
        <select
          value={toUserId}
          onChange={e => selectUser(e.target.value)}
          style={{ width: '100%', padding: '12px' }}
        >
          <option value="">— Selecciona un usuario para chatear —</option>
          {users.map(u => (
            <option key={u.id} value={u.id}>@{u.username}</option>
          ))}
        </select>
      </div>

      <div className="card" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
        {toUserId ? (
          <>
            <div style={{ flex: 1, overflowY: 'auto', marginBottom: '16px', minHeight: '300px' }}>
              {messages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--fb-text-secondary)' }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>💬</div>
                  <div style={{ fontSize: '16px' }}>No hay mensajes aún</div>
                  <div style={{ fontSize: '14px', marginTop: '8px' }}>¡Envía el primer mensaje!</div>
                </div>
              ) : (
                <div className="list">
                  {messages.map((m, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        justifyContent: m.self ? 'flex-end' : 'flex-start',
                        marginBottom: '12px'
                      }}
                    >
                      <div style={{
                        maxWidth: '70%',
                        padding: '10px 14px',
                        borderRadius: '18px',
                        background: m.self ? 'var(--fb-blue)' : 'var(--fb-hover)',
                        color: m.self ? 'white' : 'var(--fb-text-primary)'
                      }}>
                        {!m.self && (
                          <div style={{
                            fontSize: '12px',
                            fontWeight: '600',
                            marginBottom: '4px',
                            color: 'var(--fb-blue)'
                          }}>
                            @{m.from}
                          </div>
                        )}
                        <div style={{ fontSize: '15px', lineHeight: '1.4' }}>{m.content}</div>
                        <div style={{
                          fontSize: '11px',
                          marginTop: '4px',
                          opacity: 0.8
                        }}>
                          {new Date(m.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Typing indicator */}
                  {isTyping && (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'flex-start',
                      marginBottom: '12px'
                    }}>
                      <div style={{
                        padding: '10px 14px',
                        borderRadius: '18px',
                        background: 'var(--fb-hover)',
                        color: 'var(--fb-text-secondary)',
                        fontSize: '14px',
                        fontStyle: 'italic'
                      }}>
                        <span className="typing-dots">escribiendo</span>
                        <span className="dot">.</span>
                        <span className="dot">.</span>
                        <span className="dot">.</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <hr style={{ margin: '0 0 16px 0' }} />
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                style={{ flex: 1 }}
                value={text}
                onChange={e => handleTyping(e.target.value)}
                placeholder="Escribe un mensaje..."
                onKeyPress={e => e.key === 'Enter' && send()}
              />
              <button onClick={send} style={{ padding: '10px 24px' }}>
                Enviar
              </button>
            </div>
          </>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            color: 'var(--fb-text-secondary)'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>💬</div>
            <div style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
              Selecciona una conversación
            </div>
            <div style={{ fontSize: '14px' }}>
              Elige un usuario de la lista superior para comenzar a chatear
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
