import { Hono } from "hono";
import { config } from "../config/index.js";
import { prisma } from "../lib/prisma.js";
import type {
    ErrorResponse,
    ShortenRequest,
    ShortenResponse,
} from "../types/index.js";
import { generateShortCode } from "../utils/generateShortCode.js";

const shortenRoute = new Hono();

/**
 * POST /shorten
 * Creates a shortened URL from a valid original URL.
 *
 * @body {ShortenRequest} - JSON body with `url` field and optional `ttl` (seconds)
 * @returns {ShortenResponse} - The generated short URL, code, and optional expiration
 * @returns {ErrorResponse} - Error message if URL is invalid or missing
 */
shortenRoute.post("/", async (c) => {
    const body = await c.req.json<ShortenRequest>();
    const { url, ttl } = body;

    if (!url) {
        return c.json<ErrorResponse>({ error: "URL is required" }, 400);
    }

    // Validate URL format
    try {
        new URL(url);
    } catch {
        return c.json<ErrorResponse>({ error: "Invalid URL format" }, 400);
    }

    // Validate TTL if provided
    if (ttl !== undefined && (typeof ttl !== "number" || ttl <= 0)) {
        return c.json<ErrorResponse>(
            { error: "TTL must be a positive number (seconds)" },
            400,
        );
    }

    // Calculate expiration date if TTL is provided
    const expiresAt = ttl ? new Date(Date.now() + ttl * 1000) : null;

    // Generate unique short code with collision handling
    let shortCode = generateShortCode();
    let exists = await prisma.shortUrl.findUnique({ where: { shortCode } });

    while (exists) {
        shortCode = generateShortCode();
        exists = await prisma.shortUrl.findUnique({ where: { shortCode } });
    }

    await prisma.shortUrl.create({
        data: {
            originalUrl: url,
            shortCode,
            expiresAt,
        },
    });

    // Construct the full short URL from request headers or defaults
    const protocol =
        c.req.header("x-forwarded-proto") || config.defaultProtocol;
    const host = c.req.header("host") || config.defaultHost;
    const fullShortUrl = `${protocol}://${host}/${shortCode}`;

    const response: ShortenResponse = {
        shortUrl: fullShortUrl,
        shortCode,
    };

    if (expiresAt) {
        response.expiresAt = expiresAt.toISOString();
    }

    return c.json<ShortenResponse>(response);
});

export { shortenRoute };
