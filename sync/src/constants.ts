/**
 * Constants used throughout the sync package.
 * Centralizes magic numbers and configuration values.
 */

/**
 * Frame size limits and defaults for Negentropy protocol.
 */
export const FRAME_SIZE_LIMITS = {
    /** Minimum allowed frame size limit (4KB) */
    MINIMUM: 4096,
    /** Default frame size limit (50KB) */
    DEFAULT: 50000,
} as const;

/**
 * Timeout values for various operations (in milliseconds).
 */
export const TIMEOUTS = {
    /**
     * Default sync session timeout (5 seconds).
     * Most relays respond immediately with NOTICE if they don't support negentropy,
     * so we only need a short timeout for relays that silently ignore unknown messages.
     */
    SYNC_SESSION: 5000,
    /** Cache query timeout (5 seconds) */
    CACHE_QUERY: 5000,
    /** Event fetch timeout (10 seconds) */
    EVENT_FETCH: 10000,
    /** Relay connection timeout (30 seconds) */
    RELAY_CONNECTION: 30000,
} as const;

/**
 * Bucket configuration for range splitting in Negentropy.
 */
export const RANGE_SPLITTING = {
    /** Number of buckets to split large ranges into */
    BUCKET_COUNT: 16,
    /** Minimum elements per bucket before switching to ID list mode */
    MIN_ELEMENTS_FOR_BUCKETS: 32, // buckets * 2
} as const;

/**
 * Buffer size configuration.
 */
export const BUFFER_SIZES = {
    /** Default initial size for WrappedBuffer (512 bytes) */
    DEFAULT_WRAPPED_BUFFER_SIZE: 512,
    /** Frame size limit safety margin (200 bytes) */
    FRAME_SIZE_SAFETY_MARGIN: 200,
} as const;
