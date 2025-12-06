import 'dotenv/config'
import { serve } from '@hono/node-server'
import type { ServerType } from '@hono/node-server'
import app from './routes/index.js'
import { config } from './config/index.js'

// Re-export app for direct usage if needed
export default app

/**
 * Starts the HTTP server on the specified port.
 * @param port - Port to listen on (defaults to config.port)
 * @returns The server instance for lifecycle management
 */
export function startServer(port: number = config.port): ServerType {
  const server = serve(
    {
      fetch: app.fetch,
      port,
    },
    (info) => {
      console.log(`Server is running on http://localhost:${info.port}`)
    }
  )
  return server
}

// Start server when running directly (not imported by tests)
if (process.env.NODE_ENV !== 'test') {
  startServer()
}
