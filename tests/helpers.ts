import type { ErrorResponse, ShortenResponse } from "../src/types/index.js";
import { TEST_BASE_URL } from "./setup.js";

// Re-export for test convenience
export type { ShortenResponse, ErrorResponse };

/**
 * Creates a shortened URL via the API
 * @param url - The original URL to shorten
 * @param ttl - Optional TTL in seconds
 * @returns The fetch Response
 */
export async function createShortUrl(
    url: string,
    ttl?: number,
): Promise<Response> {
    const body: Record<string, unknown> = { url };
    if (ttl !== undefined) {
        body.ttl = ttl;
    }
    return fetch(`${TEST_BASE_URL}/shorten`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });
}

/**
 * Creates a shortened URL and returns the parsed response
 * @param url - The original URL to shorten
 * @param ttl - Optional TTL in seconds
 * @returns The parsed response with shortUrl, shortCode, and optional expiresAt
 */
export async function createShortUrlAndParse(
    url: string,
    ttl?: number,
): Promise<ShortenResponse> {
    const res = await createShortUrl(url, ttl);
    return res.json();
}

/**
 * Accesses a short URL to trigger redirect (without following)
 * @param shortCode - The short code to access
 * @returns The fetch Response
 */
export async function accessShortUrl(shortCode: string): Promise<Response> {
    return fetch(`${TEST_BASE_URL}/${shortCode}`, {
        redirect: "manual", // Don't follow redirects
    });
}

/**
 * Makes a POST request to /shorten with a custom body
 * @param body - The request body object
 * @returns The fetch Response
 */
export async function postShorten(
    body: Record<string, unknown>,
): Promise<Response> {
    return fetch(`${TEST_BASE_URL}/shorten`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });
}

/**
 * Small delay to allow async operations to complete
 * @param ms - Milliseconds to wait (default: 100)
 */
export function delay(ms: number = 100): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
