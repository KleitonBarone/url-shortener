import { describe, it, expect } from 'vitest'
import { prisma } from '../src/lib/prisma.js'
import {
    createShortUrl,
    createShortUrlAndParse,
    accessShortUrl,
    postShorten,
    type CreateShortUrlResponse,
} from './helpers.js'

describe('URL Shortener E2E', () => {
    describe('POST /shorten', () => {
        it('should shorten a valid URL', async () => {
            const res = await createShortUrl('https://example.com')

            expect(res.status).toBe(200)
            const body = (await res.json()) as CreateShortUrlResponse
            expect(body).toHaveProperty('shortCode')
            expect(body).toHaveProperty('shortUrl')
            expect(body.shortUrl).toContain(body.shortCode)
        })

        it('should reject invalid URL format', async () => {
            const res = await createShortUrl('not-a-valid-url')

            expect(res.status).toBe(400)
            const body = await res.json()
            expect(body).toHaveProperty('error')
        })

        it('should require URL field', async () => {
            const res = await postShorten({})

            expect(res.status).toBe(400)
            const body = await res.json()
            expect(body).toHaveProperty('error')
        })

        it('should generate unique short codes', async () => {
            const res1 = await createShortUrlAndParse('https://example.com/page1')
            const res2 = await createShortUrlAndParse('https://example.com/page2')

            expect(res1.shortCode).not.toBe(res2.shortCode)
        })
    })

    describe('GET /:shortCode', () => {
        it('should redirect to original URL', async () => {
            const { shortCode } = await createShortUrlAndParse('https://google.com')

            const res = await accessShortUrl(shortCode)

            expect(res.status).toBe(302)
            expect(res.headers.get('location')).toBe('https://google.com')
        })

        it('should return 404 for unknown code', async () => {
            const res = await accessShortUrl('unknowncode')

            expect(res.status).toBe(404)
        })

        it('should increment visit count', async () => {
            const { shortCode } = await createShortUrlAndParse('https://example.com')

            // Create a context that tracks promises for this test
            const promises: Promise<unknown>[] = []
            // biome-ignore lint/suspicious/noExplicitAny: Test mock needs flexible typing
            const trackingContext = {
                waitUntil: (promise: Promise<unknown>) => {
                    promises.push(promise)
                },
                passThroughOnException: () => { },
            } as any

            // Import app directly to use tracking context
            const app = (await import('../src/index.js')).default

            // Access the URL multiple times with tracking context
            await app.request(`/${shortCode}`, {}, undefined, trackingContext)
            await app.request(`/${shortCode}`, {}, undefined, trackingContext)
            await app.request(`/${shortCode}`, {}, undefined, trackingContext)

            // Wait for all async visit updates to complete
            await Promise.all(promises)

            const record = await prisma.shortUrl.findUnique({
                where: { shortCode },
            })

            expect(record).not.toBeNull()
            expect(record!.visits).toBe(3)
        })
    })
})
