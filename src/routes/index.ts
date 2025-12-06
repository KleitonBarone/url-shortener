import { Hono } from 'hono'
import { shortenRoute } from './shorten.js'
import { redirectRoute } from './redirect.js'

/**
 * Main application with all routes mounted.
 */
const app = new Hono()

// Mount route handlers
app.route('/shorten', shortenRoute)
app.route('/', redirectRoute)

export default app
