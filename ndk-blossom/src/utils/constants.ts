/**
 * Kind number for Blossom authorization events (BUD-01)
 */
export const BLOSSOM_AUTH_EVENT_KIND = 24242;

/**
 * Default retry options
 */
export const DEFAULT_RETRY_OPTIONS = {
    maxRetries: 3,
    retryDelay: 1000,
    backoffFactor: 1.5,
    retryableStatusCodes: [408, 429, 500, 502, 503, 504],
};

/**
 * Default headers for requests
 */
export const DEFAULT_HEADERS = {
    Accept: "application/json",
};

/**
 * Debug namespace for NDK-Blossom
 */
export const DEBUG_NAMESPACE = "ndk:blossom";

/**
 * HTTP status codes for server errors
 */
export const SERVER_ERROR_STATUS_CODES = [500, 501, 502, 503, 504, 505];
