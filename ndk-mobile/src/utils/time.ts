/**
 * Utility functions for working with time in the NDK-Mobile library
 */

/**
 * Convert a timestamp to seconds format
 * @param timestamp - The timestamp to convert
 * @returns The timestamp in seconds
 */
export function toSeconds(timestamp: number): number {
    // If timestamp is in milliseconds (> 2^30), convert to seconds
    return timestamp > 1e10 ? Math.floor(timestamp / 1000) : timestamp;
}

/**
 * Get the current timestamp in seconds
 * @returns Current timestamp in seconds
 */
export function nowSeconds(): number {
    return Math.floor(Date.now() / 1000);
}
