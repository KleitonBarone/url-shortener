/**
 * Character set for generating short codes.
 * Includes uppercase, lowercase letters, and digits.
 */
const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

/**
 * Default length for generated short codes.
 */
const DEFAULT_LENGTH = 6

/**
 * Generates a random alphanumeric short code.
 *
 * @param length - The length of the short code to generate (default: 6)
 * @returns A random alphanumeric string of the specified length
 *
 * @example
 * ```ts
 * const code = generateShortCode() // "xK9mPq"
 * const longerCode = generateShortCode(10) // "xK9mPqR2Lw"
 * ```
 */
export function generateShortCode(length: number = DEFAULT_LENGTH): string {
    let result = ''
    for (let i = 0; i < length; i++) {
        result += CHARSET.charAt(Math.floor(Math.random() * CHARSET.length))
    }
    return result
}
