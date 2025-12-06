import { beforeAll, beforeEach, afterAll } from 'vitest'
import type { ServerType } from '@hono/node-server'
import { prisma } from '../src/lib/prisma.js'
import { startServer } from '../src/index.js'

/**
 * Test server configuration
 */
export const TEST_PORT = 3001
export const TEST_BASE_URL = `http://localhost:${TEST_PORT}`

let server: ServerType

/**
 * Global test setup
 * - Starts the server before all tests
 * - Cleans the database before each test
 * - Stops the server after all tests
 */

beforeAll(async () => {
    server = startServer(TEST_PORT)
})

beforeEach(async () => {
    await prisma.shortUrl.deleteMany()
})

afterAll(async () => {
    server.close()
    await prisma.$disconnect()
})
