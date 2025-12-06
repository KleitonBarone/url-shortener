import { describe, expect, it } from "vitest";
import { prisma } from "../src/lib/prisma.js";
import {
    accessShortUrl,
    createShortUrl,
    createShortUrlAndParse,
    delay,
    postShorten,
    type ShortenResponse,
} from "./helpers.js";
import { TEST_BASE_URL } from "./setup.js";

describe("URL Shortener E2E", () => {
    describe("POST /shorten", () => {
        it("should shorten a valid URL", async () => {
            // Use internal URL - the shortened URL will point back to our test server
            const res = await createShortUrl(`${TEST_BASE_URL}/test-page`);

            expect(res.status).toBe(200);
            const body = (await res.json()) as ShortenResponse;
            expect(body).toHaveProperty("shortCode");
            expect(body).toHaveProperty("shortUrl");
            expect(body.shortUrl).toContain(body.shortCode);
        });

        it("should reject invalid URL format", async () => {
            const res = await createShortUrl("not-a-valid-url");

            expect(res.status).toBe(400);
            const body = await res.json();
            expect(body).toHaveProperty("error");
        });

        it("should require URL field", async () => {
            const res = await postShorten({});

            expect(res.status).toBe(400);
            const body = await res.json();
            expect(body).toHaveProperty("error");
        });

        it("should generate unique short codes", async () => {
            const res1 = await createShortUrlAndParse(`${TEST_BASE_URL}/page1`);
            const res2 = await createShortUrlAndParse(`${TEST_BASE_URL}/page2`);

            expect(res1.shortCode).not.toBe(res2.shortCode);
        });
    });

    describe("GET /:shortCode", () => {
        it("should redirect to original URL", async () => {
            const targetUrl = `${TEST_BASE_URL}/target-page`;
            const { shortCode } = await createShortUrlAndParse(targetUrl);

            const res = await accessShortUrl(shortCode);

            expect(res.status).toBe(302);
            expect(res.headers.get("location")).toBe(targetUrl);
        });

        it("should return 404 for unknown code", async () => {
            const res = await accessShortUrl("unknowncode");

            expect(res.status).toBe(404);
        });

        it("should increment visit count", async () => {
            const { shortCode } = await createShortUrlAndParse(
                `${TEST_BASE_URL}/visit-test`,
            );

            // Access the URL multiple times
            await accessShortUrl(shortCode);
            await accessShortUrl(shortCode);
            await accessShortUrl(shortCode);

            // Wait for async visit updates to complete
            await delay(100);

            const record = await prisma.shortUrl.findUnique({
                where: { shortCode },
            });

            expect(record).not.toBeNull();
            expect(record?.visits).toBe(3);
        });
    });

    describe("TTL (Time to Live)", () => {
        it("should return expiresAt when TTL is provided", async () => {
            const res = await createShortUrl(`${TEST_BASE_URL}/ttl-test`, 3600);

            expect(res.status).toBe(200);
            const body = (await res.json()) as ShortenResponse;
            expect(body).toHaveProperty("expiresAt");
            expect(body.expiresAt).toBeDefined();

            // Verify expiresAt is approximately 1 hour from now
            const expiresAt = new Date(body.expiresAt ?? "");
            const expectedExpiry = new Date(Date.now() + 3600 * 1000);
            const diffMs = Math.abs(
                expiresAt.getTime() - expectedExpiry.getTime(),
            );
            expect(diffMs).toBeLessThan(5000); // Within 5 seconds
        });

        it("should not return expiresAt when TTL is not provided", async () => {
            const body = await createShortUrlAndParse(
                `${TEST_BASE_URL}/no-ttl`,
            );

            expect(body.expiresAt).toBeUndefined();
        });

        it("should return 404 for expired URL", async () => {
            // Create URL with 1 second TTL
            const { shortCode } = await createShortUrlAndParse(
                `${TEST_BASE_URL}/expire-test`,
                1,
            );

            // Access immediately - should work
            const res1 = await accessShortUrl(shortCode);
            expect(res1.status).toBe(302);

            // Wait for expiration
            await delay(1500);

            // Access after expiration - should return 404
            const res2 = await accessShortUrl(shortCode);
            expect(res2.status).toBe(404);
        });

        it("should reject invalid TTL values", async () => {
            const res1 = await postShorten({
                url: `${TEST_BASE_URL}/test`,
                ttl: -1,
            });
            expect(res1.status).toBe(400);

            const res2 = await postShorten({
                url: `${TEST_BASE_URL}/test`,
                ttl: 0,
            });
            expect(res2.status).toBe(400);

            const res3 = await postShorten({
                url: `${TEST_BASE_URL}/test`,
                ttl: "invalid",
            });
            expect(res3.status).toBe(400);
        });
    });
});
