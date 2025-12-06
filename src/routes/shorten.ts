import { Hono } from 'hono'
import { prisma } from '../lib/prisma.js'
import { generateShortCode } from '../utils/generateShortCode.js'
import { config } from '../config/index.js'
import type { ShortenRequest, ShortenResponse, ErrorResponse } from '../types/index.js'

const shortenRoute = new Hono()

/**
 * POST /shorten
 * Creates a shortened URL from a valid original URL.
 *
 * @body {ShortenRequest} - JSON body with `url` field
 * @returns {ShortenResponse} - The generated short URL and code
 * @returns {ErrorResponse} - Error message if URL is invalid or missing
 */
shortenRoute.post('/', async (c) => {
    const body = await c.req.json<ShortenRequest>()
    const { url } = body

    if (!url) {
        return c.json<ErrorResponse>({ error: 'URL is required' }, 400)
    }

    // Validate URL format
    try {
        new URL(url)
    } catch {
        return c.json<ErrorResponse>({ error: 'Invalid URL format' }, 400)
    }

    // Generate unique short code with collision handling
    let shortCode = generateShortCode()
    let exists = await prisma.shortUrl.findUnique({ where: { shortCode } })

    while (exists) {
        shortCode = generateShortCode()
        exists = await prisma.shortUrl.findUnique({ where: { shortCode } })
    }

    await prisma.shortUrl.create({
        data: {
            originalUrl: url,
            shortCode,
        },
    })

    // Construct the full short URL from request headers or defaults
    const protocol = c.req.header('x-forwarded-proto') || config.defaultProtocol
    const host = c.req.header('host') || config.defaultHost
    const fullShortUrl = `${protocol}://${host}/${shortCode}`

    return c.json<ShortenResponse>({ shortUrl: fullShortUrl, shortCode })
})

export { shortenRoute }
