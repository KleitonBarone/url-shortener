import 'dotenv/config'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { prisma } from './lib/prisma.js'

const app = new Hono()
export default app

// Helper to generate a random 6-character string
function generateShortCode(length = 6): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

app.post('/shorten', async (c) => {
  const { url } = await c.req.json<{ url: string }>()

  if (!url) {
    return c.json({ error: 'URL is required' }, 400)
  }

  // Simple validation for URL format
  try {
    new URL(url)
  } catch (e) {
    return c.json({ error: 'Invalid URL format' }, 400)
  }

  // Generate unique short code
  let shortCode = generateShortCode()
  let exists = await prisma.shortUrl.findUnique({ where: { shortCode } })

  // Retry if collision occurs (simple approach)
  while (exists) {
    shortCode = generateShortCode()
    exists = await prisma.shortUrl.findUnique({ where: { shortCode } })
  }

  const shortUrl = await prisma.shortUrl.create({
    data: {
      originalUrl: url,
      shortCode,
    },
  })

  // Construct the full short URL
  // Assuming localhost:3000 for now, ideally strictly from config/env or request host
  const protocol = c.req.header('x-forwarded-proto') || 'http'
  const host = c.req.header('host') || 'localhost:3000'
  const fullShortUrl = `${protocol}://${host}/${shortCode}`

  return c.json({ shortUrl: fullShortUrl, shortCode })
})

app.get('/:shortCode', async (c) => {
  const shortCode = c.req.param('shortCode')

  const shortUrl = await prisma.shortUrl.findUnique({
    where: { shortCode },
  })

  if (!shortUrl) {
    return c.notFound()
  }

  // Increment visits asynchronously
  c.executionCtx.waitUntil(
    prisma.shortUrl.update({
      where: { id: shortUrl.id },
      data: { visits: { increment: 1 } },
    })
  )

  return c.redirect(shortUrl.originalUrl)
})

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
