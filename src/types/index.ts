/**
 * Request body for creating a shortened URL.
 */
export interface ShortenRequest {
    url: string;
}

/**
 * Response body after successfully creating a shortened URL.
 */
export interface ShortenResponse {
    shortUrl: string;
    shortCode: string;
}

/**
 * Standard error response format.
 */
export interface ErrorResponse {
    error: string;
}
