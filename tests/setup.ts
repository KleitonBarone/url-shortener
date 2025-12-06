import { beforeEach, afterAll } from 'vitest'
import { prisma } from '../src/lib/prisma.js'

/**
 * Global test setup
 * - Cleans the database before each test to ensure isolation
 * - Disconnects from the database after all tests complete
 */

beforeEach(async () => {
    await prisma.shortUrl.deleteMany()
})

afterAll(async () => {
    await prisma.$disconnect()
})

/**
 * Resets the database by deleting all records.
 * Can be called manually if needed for specific test scenarios.
 */
export async function resetDatabase(): Promise<void> {
    await prisma.shortUrl.deleteMany()
}
