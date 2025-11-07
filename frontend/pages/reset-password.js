import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { api } from '@/lib/api'

export default function ResetPassword() {
  const router = useRouter()
  const [token, setToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(true)
  const [validToken, setValidToken] = useState(false)

  useEffect(() => {
    // Get token from URL query parameter
    const tokenFromUrl = router.query.token
    if (tokenFromUrl) {
      setToken(tokenFromUrl)
      verifyToken(tokenFromUrl)
    } else {
      setVerifying(false)
      setError('No se proporcionó un token de recuperación')
    }
  }, [router.query.token])

  const verifyToken = async (tokenToVerify) => {
    try {
      const response = await api('/api/auth/verify-reset-token', {
        method: 'POST',
        body: { token: tokenToVerify }
      })

      setValidToken(response.valid)
      if (!response.valid) {
        setError('El enlace de recuperación es inválido o ha expirado')
      }
    } catch (e) {
      setError('Error al verificar el token')
      setValidToken(false)
    } finally {
      setVerifying(false)
    }
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    // Validation
    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    setLoading(true)

    try {
      const response = await api('/api/auth/reset-password', {
        method: 'POST',
        body: { token, newPassword }
      })

      setMessage(response.message)

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/')
      }, 3000)
    } catch (e) {
      setError(e.message || 'Error al restablecer la contraseña')
    } finally {
      setLoading(false)
    }
  }

  if (verifying) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--fb-gray-bg)'
      }}>
        <div style={{ textAlign: 'center', color: 'var(--fb-text-secondary)' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔐</div>
          <div>Verificando enlace de recuperación...</div>
        </div>
      </div>
    )
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
        <h2 style={{ marginBottom: '12px', textAlign: 'center' }}>Restablecer contraseña</h2>

        {!validToken ? (
          <>
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: 'var(--fb-text-secondary)'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>❌</div>
              <div style={{ fontSize: '16px', marginBottom: '8px', color: 'var(--fb-danger)' }}>
                {error || 'El enlace de recuperación es inválido o ha expirado'}
              </div>
              <div style={{ fontSize: '14px', marginTop: '16px' }}>
                Por favor, solicita un nuevo enlace de recuperación
              </div>
            </div>
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <a href="/forgot-password">
                <button className="secondary" style={{ padding: '12px 24px' }}>
                  Solicitar nuevo enlace
                </button>
              </a>
            </div>
          </>
        ) : (
          <>
            <p style={{
              textAlign: 'center',
              color: 'var(--fb-text-secondary)',
              fontSize: '14px',
              marginBottom: '24px'
            }}>
              Ingresa tu nueva contraseña
            </p>

            <form onSubmit={onSubmit}>
              <input
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Nueva contraseña"
                type="password"
                required
                disabled={loading}
                style={{ marginBottom: '12px' }}
                minLength={6}
              />

              <input
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirmar contraseña"
                type="password"
                required
                disabled={loading}
                style={{ marginBottom: '16px' }}
                minLength={6}
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
                {loading ? 'Actualizando...' : 'Restablecer contraseña'}
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
                fontSize: '14px',
                textAlign: 'center'
              }}>
                <div style={{ marginBottom: '8px' }}>✅ {message}</div>
                <div style={{ fontSize: '12px' }}>Redirigiendo al inicio de sesión...</div>
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
          </>
        )}

        <div style={{
          borderTop: '1px solid var(--fb-border)',
          margin: '20px 0',
          paddingTop: '20px',
          textAlign: 'center'
        }}>
          <small style={{ color: 'var(--fb-text-secondary)' }}>
            <a href="/">Volver al inicio de sesión</a>
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
