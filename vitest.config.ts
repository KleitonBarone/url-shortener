import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        fileParallelism: false,
        setupFiles: ['./tests/setup.ts'],
        testTimeout: 10000,
        include: ['tests/**/*.test.ts'],
        sequence: {
            hooks: 'stack',
        },
    },
    define: {
        'process.env.NODE_ENV': '"test"',
    },
})
