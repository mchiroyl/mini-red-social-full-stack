import { useState } from 'react'
import { api } from '@/lib/api'

export default function Register() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api('/api/auth/register', { method: 'POST', body: { username, email, password } })
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
        Crea una cuenta y comienza a conectar
      </div>

      <div className="card" style={{ maxWidth: '420px', width: '100%', padding: '24px' }}>
        <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>Crear cuenta nueva</h2>
        <form onSubmit={onSubmit}>
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Nombre de usuario"
            required
            style={{ marginBottom: '12px' }}
          />
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
            style={{ marginBottom: '16px' }}
          />
          <button type="submit" style={{ width: '100%', padding: '14px', fontSize: '17px', fontWeight: 'bold', background: 'var(--fb-success)' }}>
            Registrarse
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
          <small style={{ color: 'var(--fb-text-secondary)' }}>
            ¿Ya tienes cuenta? <a href="/">Inicia sesión aquí</a>
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
