import { ErrorCode } from "../types";

/**
 * Base error class for NDK-Blossom
 */
export class NDKBlossomError extends Error {
    public code: ErrorCode;
    public serverUrl?: string;
    public cause?: Error;

    constructor(message: string, code: ErrorCode, serverUrl?: string, cause?: Error) {
        super(message);
        this.name = "NDKBlossomError";
        this.code = code;
        this.serverUrl = serverUrl;
        this.cause = cause;
    }
}

/**
 * Error for upload failures
 */
export class NDKBlossomUploadError extends NDKBlossomError {
    constructor(message: string, code: ErrorCode, serverUrl?: string, cause?: Error) {
        super(message, code, serverUrl, cause);
        this.name = "NDKBlossomUploadError";
    }
}

/**
 * Error for server issues
 */
export class NDKBlossomServerError extends NDKBlossomError {
    public status?: number;

    constructor(message: string, code: ErrorCode, serverUrl?: string, status?: number, cause?: Error) {
        super(message, code, serverUrl, cause);
        this.name = "NDKBlossomServerError";
        this.status = status;
    }
}

/**
 * Error for authentication issues
 */
export class NDKBlossomAuthError extends NDKBlossomError {
    constructor(message: string, code: ErrorCode, serverUrl?: string, cause?: Error) {
        super(message, code, serverUrl, cause);
        this.name = "NDKBlossomAuthError";
    }
}

/**
 * Error for not found issues
 */
export class NDKBlossomNotFoundError extends NDKBlossomError {
    constructor(message: string, code: ErrorCode, serverUrl?: string, cause?: Error) {
        super(message, code, serverUrl, cause);
        this.name = "NDKBlossomNotFoundError";
    }
}

/**
 * Error for optimization issues
 */
export class NDKBlossomOptimizationError extends NDKBlossomError {
    constructor(message: string, code: ErrorCode, serverUrl?: string, cause?: Error) {
        super(message, code, serverUrl, cause);
        this.name = "NDKBlossomOptimizationError";
    }
}
