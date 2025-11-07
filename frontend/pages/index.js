import { useState } from 'react'
import { api } from '@/lib/api'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api('/api/auth/login', { method: 'POST', body: { email, password } })
      window.location.href = '/feed'
    } catch (e) {
      setError(e.message)
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
      <div style={{
        fontSize: '18px',
        color: 'var(--fb-text-secondary)',
        marginBottom: '32px',
        textAlign: 'center',
        maxWidth: '500px',
        padding: '0 16px'
      }} className="login-tagline">
        Conecta con amigos y comparte momentos
      </div>

      <div className="card" style={{ maxWidth: '420px', width: '100%', padding: '24px' }}>
        <form onSubmit={onSubmit}>
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Correo electrónico"
            type="email"
            required
            style={{ marginBottom: '12px' }}
          />
          <input
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Contraseña"
            type="password"
            required
            style={{ marginBottom: '12px' }}
          />
          <div style={{ textAlign: 'right', marginBottom: '16px' }}>
            <a href="/forgot-password" style={{
              color: 'var(--fb-blue)',
              fontSize: '14px',
              textDecoration: 'none'
            }}>
              ¿Olvidaste tu contraseña?
            </a>
          </div>
          <button type="submit" style={{ width: '100%', padding: '14px', fontSize: '17px', fontWeight: 'bold' }}>
            Iniciar sesión
          </button>
        </form>

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
          <a href="/register" style={{ textDecoration: 'none' }}>
            <button className="secondary" style={{ padding: '12px 24px', fontWeight: '600' }}>
              Crear cuenta nueva
            </button>
          </a>
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
