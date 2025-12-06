import 'dotenv/config'
import { serve } from '@hono/node-server'
import app from './routes/index.js'
import { config } from './config/index.js'

// Re-export app for testing
export default app

serve(
  {
    fetch: app.fetch,
    port: config.port,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`)
  }
)
