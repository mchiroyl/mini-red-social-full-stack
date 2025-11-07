import { io } from 'socket.io-client'
const WS_BASE = process.env.NEXT_PUBLIC_WS_BASE || 'http://localhost:4000'

let socket = null
export function getSocket() {
  if (!socket) {
    socket = io(WS_BASE, { withCredentials: true })
  }
  return socket
}
export function disconnectSocket() {
  if (socket) { socket.disconnect(); socket = null }
}
