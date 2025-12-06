import 'dotenv/config'

/**
 * Application configuration.
 * Values can be overridden via environment variables.
 */
export const config = {
    /**
     * Port number for the HTTP server.
     * Override with PORT environment variable.
     */
    port: Number(process.env.PORT) || 3000,

    /**
     * Default protocol when X-Forwarded-Proto header is not present.
     */
    defaultProtocol: 'http',

    /**
     * Default host when Host header is not present.
     */
    defaultHost: 'localhost:3000',
} as const
