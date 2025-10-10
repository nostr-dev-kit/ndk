import { type NDKEvent, NDKUser } from "@nostr-dev-kit/ndk";

// Blob Descriptor returned from server
export interface BlossomBlobDescriptor {
    sha256: string;
    url: string;
    size: number;
    created_at: number;
    mime_type: string;
    width?: number;
    height?: number;
    blurhash?: string;
    alt?: string;
    // Additional server-specific metadata
    [key: string]: any;
}

// User's Blossom Server list
export interface BlossomServerList {
    pubkey: string;
    servers: string[];
    created_at?: number;
    event?: NDKEvent;
}

/**
 * Options for uploading to Blossom servers
 */
export interface BlossomUploadOptions {
    /**
     * If provided, always use this server for upload (bypasses blossom list and fallback).
     */
    server?: string;

    /**
     * If no blossom servers are available or all fail, use this server as a fallback.
     */
    fallbackServer?: string;

    /**
     * Maximum number of retry attempts for network requests
     */
    maxRetries?: number;

    /**
     * Delay between retry attempts in milliseconds
     */
    retryDelay?: number;

    /**
     * Additional headers to include in the upload request
     */
    headers?: Record<string, string>;

    /**
     * Callback for upload progress
     */
    onProgress?: (progress: { loaded: number; total: number }) => "continue" | "cancel";

    /**
     * Callback for server errors
     */
    onServerError?: (error: Error, serverUrl: string) => "retry" | "skip";

    /**
     * Custom SHA256 calculator implementation
     */
    sha256Calculator?: SHA256Calculator;
}

// Options for media optimization
export interface BlossomOptimizationOptions {
    width?: number;
    height?: number;
    format?: string;
    quality?: number;
    fit?: "contain" | "cover" | "fill" | "inside" | "outside";
    background?: string;
    blur?: number;
    sharpen?: boolean;
    time?: string; // For video timestamp
    [key: string]: string | number | boolean | undefined;
}

// Retry options
export interface BlossomRetryOptions {
    maxRetries: number;
    retryDelay: number;
    backoffFactor: number;
    retryableStatusCodes: number[];
}

// Server configuration
export interface BlossomServerConfig {
    headers?: Record<string, string>;
}

// Result of a mirror operation
export interface BlossomMirrorResult {
    sourceUrl: string;
    targetUrl?: string;
    success: boolean;
    error?: string;
}

// Results of a batch mirror operation
export interface BlossomBatchMirrorResults {
    succeeded: BlossomMirrorResult[];
    failed: BlossomMirrorResult[];
}

// Error types
export const ErrorCodes = {
    // Server Errors
    SERVER_UNAVAILABLE: "SERVER_UNAVAILABLE",
    SERVER_ERROR: "SERVER_ERROR",
    SERVER_REJECTED: "SERVER_REJECTED",
    SERVER_TIMEOUT: "SERVER_TIMEOUT",
    SERVER_LIST_EMPTY: "SERVER_LIST_EMPTY",
    SERVER_INVALID_RESPONSE: "SERVER_INVALID_RESPONSE",

    // Auth Errors
    NO_SIGNER: "NO_SIGNER",
    AUTH_REQUIRED: "AUTH_REQUIRED",
    AUTH_INVALID: "AUTH_INVALID",
    AUTH_EXPIRED: "AUTH_EXPIRED",
    AUTH_REJECTED: "AUTH_REJECTED",

    // Upload Errors
    UPLOAD_TOO_LARGE: "UPLOAD_TOO_LARGE",
    UPLOAD_INVALID_TYPE: "UPLOAD_INVALID_TYPE",
    UPLOAD_FAILED: "UPLOAD_FAILED",
    ALL_SERVERS_FAILED: "ALL_SERVERS_FAILED",

    // Not Found Errors
    BLOB_NOT_FOUND: "BLOB_NOT_FOUND",
    USER_SERVER_LIST_NOT_FOUND: "USER_SERVER_LIST_NOT_FOUND",

    // Optimization Errors
    SERVER_UNSUPPORTED: "SERVER_UNSUPPORTED",
    FORMAT_UNSUPPORTED: "FORMAT_UNSUPPORTED",

    // SHA256 Calculator Errors
    NO_SHA256_CALCULATOR: "NO_SHA256_CALCULATOR",
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

/**
 * Interface for SHA256 calculation implementation
 */
export interface SHA256Calculator {
    /**
     * Calculate SHA256 hash of a file
     *
     * @param file File to hash
     * @returns Hash as hex string
     */
    calculateSha256(file: File): Promise<string>;
}
