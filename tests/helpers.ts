import app from '../src/index.js'

/**
 * Response type for creating a short URL
 */
export interface CreateShortUrlResponse {
    shortUrl: string
    shortCode: string
}

/**
 * Response type for error responses
 */
export interface ErrorResponse {
    error: string
}

/**
 * Mock execution context for Hono tests that use waitUntil.
 * Uses 'as any' since we're only implementing the methods we need for testing.
 */
// biome-ignore lint/suspicious/noExplicitAny: Test mock needs flexible typing
export const mockExecutionContext = {
    waitUntil: (promise: Promise<unknown>) => promise,
    passThroughOnException: () => { },
} as any

/**
 * Creates a shortened URL via the API
 * @param url - The original URL to shorten
 * @returns The API response
 */
export async function createShortUrl(url: string): Promise<Response> {
    return app.request('/shorten', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
    })
}

/**
 * Creates a shortened URL and returns the parsed response
 * @param url - The original URL to shorten
 * @returns The parsed response with shortUrl and shortCode
 */
export async function createShortUrlAndParse(url: string): Promise<CreateShortUrlResponse> {
    const res = await createShortUrl(url)
    return res.json()
}

/**
 * Accesses a short URL to trigger redirect
 * @param shortCode - The short code to access
 * @returns The API response
 */
export async function accessShortUrl(shortCode: string): Promise<Response> {
    return app.request(`/${shortCode}`, {}, undefined, mockExecutionContext)
}

/**
 * Makes a POST request to /shorten with a custom body
 * @param body - The request body object
 * @returns The API response
 */
export async function postShorten(body: Record<string, unknown>): Promise<Response> {
    return app.request('/shorten', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    })
}
