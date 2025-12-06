/**
 * Request body for creating a shortened URL.
 */
export interface ShortenRequest {
    url: string;
    ttl?: number; // TTL in seconds (optional)
}

/**
 * Response body after successfully creating a shortened URL.
 */
export interface ShortenResponse {
    shortUrl: string;
    shortCode: string;
    expiresAt?: string; // ISO 8601 timestamp if TTL was set
}

/**
 * Standard error response format.
 */
export interface ErrorResponse {
    error: string;
}
