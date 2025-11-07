import { useState } from 'react'
import { api } from '@/lib/api'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [resetLink, setResetLink] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setResetLink('')
    setLoading(true)

    try {
      const response = await api('/api/auth/forgot-password', {
        method: 'POST',
        body: { email }
      })

      setMessage(response.message)

      // In development, show the reset link
      if (response.resetLink) {
        setResetLink(response.resetLink)
      }
    } catch (e) {
      setError(e.message || 'Error al solicitar recuperación de contraseña')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--fb-gray-bg)',
      padding: '16px'
    }}>
      <div style={{
        fontSize: '48px',
        fontWeight: 'bold',
        color: 'var(--fb-blue)',
        marginBottom: '16px',
        letterSpacing: '-1px'
      }} className="login-logo">
        Mini Red Social
      </div>

      <div className="card" style={{ maxWidth: '420px', width: '100%', padding: '24px' }}>
        <h2 style={{ marginBottom: '12px', textAlign: 'center' }}>¿Olvidaste tu contraseña?</h2>
        <p style={{
          textAlign: 'center',
          color: 'var(--fb-text-secondary)',
          fontSize: '14px',
          marginBottom: '24px'
        }}>
          Ingresa tu correo electrónico y te enviaremos un enlace para recuperar tu cuenta.
        </p>

        <form onSubmit={onSubmit}>
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Correo electrónico"
            type="email"
            required
            disabled={loading}
            style={{ marginBottom: '16px' }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '17px',
              fontWeight: 'bold',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
          </button>
        </form>

        {message && (
          <div style={{
            marginTop: '16px',
            padding: '12px',
            background: '#d4edda',
            border: '1px solid var(--fb-success)',
            borderRadius: '6px',
            color: '#155724',
            fontSize: '14px'
          }}>
            {message}
          </div>
        )}

        {resetLink && (
          <div style={{
            marginTop: '16px',
            padding: '12px',
            background: 'var(--fb-blue-light)',
            border: '1px solid var(--fb-blue)',
            borderRadius: '6px',
            fontSize: '13px'
          }}>
            <strong>Link de recuperación (solo para desarrollo):</strong>
            <div style={{ marginTop: '8px', wordBreak: 'break-all' }}>
              <a href={resetLink} style={{ color: 'var(--fb-blue)' }}>
                {resetLink}
              </a>
            </div>
            <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--fb-text-secondary)' }}>
              Haz clic en el enlace o cópialo en tu navegador
            </div>
          </div>
        )}

        {error && (
          <div style={{
            marginTop: '16px',
            padding: '12px',
            background: '#ffebe9',
            border: '1px solid var(--fb-danger)',
            borderRadius: '6px',
            color: 'var(--fb-danger)',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <div style={{
          borderTop: '1px solid var(--fb-border)',
          margin: '20px 0',
          paddingTop: '20px',
          textAlign: 'center'
        }}>
          <small style={{ color: 'var(--fb-text-secondary)' }}>
            ¿Recordaste tu contraseña? <a href="/">Inicia sesión aquí</a>
          </small>
        </div>
      </div>

      <div style={{
        marginTop: '28px',
        fontSize: '13px',
        color: 'var(--fb-text-secondary)',
        textAlign: 'center',
        lineHeight: '1.6'
      }}>
        <div style={{ fontWeight: '600', marginBottom: '8px' }}>Proyecto Universitario</div>
        <div style={{ fontSize: '12px' }}>
          Desarrollado por: Marvin Chiroy, Josue Sánchez, Obady Pérez
        </div>
      </div>
    </div>
  )
}
