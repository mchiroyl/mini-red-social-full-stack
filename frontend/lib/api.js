export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'

export async function api(path, { method='GET', body, headers } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(headers || {}) },
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Error' }))
    throw new Error(err.error || res.statusText)
  }
  return res.json()
}
