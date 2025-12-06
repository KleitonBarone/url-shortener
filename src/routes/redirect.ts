import { Hono } from 'hono'
import { prisma } from '../lib/prisma.js'

const redirectRoute = new Hono()

/**
 * GET /:shortCode
 * Redirects to the original URL and increments the visit counter.
 *
 * @param shortCode - The short code to look up
 * @returns 302 redirect to original URL
 * @returns 404 if short code not found
 */
redirectRoute.get('/:shortCode', async (c) => {
    const shortCode = c.req.param('shortCode')

    const shortUrl = await prisma.shortUrl.findUnique({
        where: { shortCode },
    })

    if (!shortUrl) {
        return c.notFound()
    }

    // Increment visits asynchronously without blocking the redirect
    c.executionCtx.waitUntil(
        prisma.shortUrl.update({
            where: { id: shortUrl.id },
            data: { visits: { increment: 1 } },
        })
    )

    return c.redirect(shortUrl.originalUrl)
})

export { redirectRoute }
