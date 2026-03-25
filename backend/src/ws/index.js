import { WebSocketServer } from 'ws'

let wss = null

export function createWebSocketServer(httpServer) {
  wss = new WebSocketServer({ server: httpServer })

  wss.on('connection', (socket, req) => {
    console.log(`[WS] client connected (total: ${wss.clients.size})`)

    socket.on('close', () => {
      console.log(`[WS] client disconnected (total: ${wss.clients.size})`)
    })

    socket.on('error', () => {}) // prevent unhandled error crashes
  })

  // Broadcast a refresh pulse every 2 seconds
  setInterval(() => broadcast({ type: 'refresh' }), 2000)

  return wss
}

/**
 * Broadcast a typed event to all connected clients.
 * @param {{ type: string, [key: string]: any }} payload
 */
export function broadcast(payload) {
  if (!wss) return
  const msg = JSON.stringify(payload)
  for (const client of wss.clients) {
    if (client.readyState === 1 /* OPEN */) {
      client.send(msg)
    }
  }
}
