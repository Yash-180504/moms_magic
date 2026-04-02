// Server-Sent Events endpoint — replaces the WebSocket server.
// Sends a "refresh" event every 2 seconds so clients can re-fetch data.
export const dynamic = 'force-dynamic'

export async function GET() {
  const encoder = new TextEncoder()
  let intervalId

  const stream = new ReadableStream({
    start(controller) {
      intervalId = setInterval(() => {
        try {
          controller.enqueue(encoder.encode('event: refresh\ndata: {}\n\n'))
        } catch {
          clearInterval(intervalId)
        }
      }, 2000)
    },
    cancel() {
      clearInterval(intervalId)
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}
