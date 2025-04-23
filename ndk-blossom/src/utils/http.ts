import { NDKBlossomServerError } from "./errors";
import { DEFAULT_HEADERS, DEFAULT_RETRY_OPTIONS, SERVER_ERROR_STATUS_CODES } from "./constants";
import { BlossomRetryOptions } from "../types";
import { Logger, DebugLogger } from "./logger";
import { ErrorCodes } from "../types";

// Default logger
const defaultLogger = new DebugLogger();

/**
 * Make an HTTP request with retry capability
 *
 * @param url URL to fetch
 * @param options Fetch options
 * @param retryOptions Retry configuration
 * @param logger Logger instance
 * @returns Fetch response
 */
export async function fetchWithRetry(
    url: string,
    options: RequestInit = {},
    retryOptions: Partial<BlossomRetryOptions> = {},
    logger: Logger = defaultLogger,
): Promise<Response> {
    // Set up retry options with defaults
    const retry = {
        ...DEFAULT_RETRY_OPTIONS,
        ...retryOptions,
    };

    // Set up headers with defaults
    const headers = {
        ...DEFAULT_HEADERS,
        ...(options.headers || {}),
    };

    // Number of attempts made
    let attempts = 0;

    // Function to calculate the next delay using exponential backoff
    const getNextDelay = () => retry.retryDelay * Math.pow(retry.backoffFactor, attempts);

    while (attempts <= retry.maxRetries) {
        try {
            // Make the request
            const response = await fetch(url, {
                ...options,
                headers,
            });

            // Check for retryable status codes
            if (!response.ok && retry.retryableStatusCodes.includes(response.status) && attempts < retry.maxRetries) {
                attempts++;
                const delay = getNextDelay();
                logger.warn(
                    `Request failed with status ${response.status}, retrying in ${delay}ms (attempt ${attempts}/${retry.maxRetries})`,
                    { url },
                );
                await new Promise((resolve) => setTimeout(resolve, delay));
                continue;
            }

            // Return successful response or non-retryable error
            return response;
        } catch (error) {
            // Only retry on network errors
            if (attempts < retry.maxRetries) {
                attempts++;
                const delay = getNextDelay();
                logger.warn(`Network error, retrying in ${delay}ms (attempt ${attempts}/${retry.maxRetries})`, {
                    url,
                    error,
                });
                await new Promise((resolve) => setTimeout(resolve, delay));
            } else {
                // Throw custom error after all retries failed
                throw new NDKBlossomServerError(
                    `Network request failed after ${retry.maxRetries} retries: ${(error as Error).message}`,
                    ErrorCodes.SERVER_UNAVAILABLE,
                    url,
                    undefined,
                    error as Error,
                );
            }
        }
    }

    // This should never be reached but TS requires a return
    throw new NDKBlossomServerError(
        `Request failed after ${retry.maxRetries} retries`,
        ErrorCodes.SERVER_UNAVAILABLE,
        url,
    );
}

/**
 * Make a HEAD request to check if a resource exists
 *
 * @param url URL to check
 * @param options Fetch options
 * @param retryOptions Retry configuration
 * @returns true if resource exists (2xx status), false otherwise
 */
export async function checkResourceExists(
    url: string,
    options: RequestInit = {},
    retryOptions: Partial<BlossomRetryOptions> = {},
): Promise<boolean> {
    try {
        const response = await fetchWithRetry(
            url,
            {
                ...options,
                method: "HEAD",
            },
            retryOptions,
        );

        return response.ok;
    } catch (error) {
        return false;
    }
}

/**
 * Check if a Blossom server has a blob by its hash
 *
 * @param serverUrl Base URL of the server
 * @param hash SHA256 hash of the blob
 * @param retryOptions Retry configuration
 * @returns true if the blob exists, false otherwise
 */
export async function checkBlobExists(
    serverUrl: string,
    hash: string,
    retryOptions: Partial<BlossomRetryOptions> = {},
): Promise<boolean> {
    // Normalize the server URL
    const baseUrl = serverUrl.endsWith("/") ? serverUrl.slice(0, -1) : serverUrl;
    const url = `${baseUrl}/${hash}`;

    return checkResourceExists(url, { method: "HEAD" }, retryOptions);
}

/**
 * Extract JSON from a response with error handling
 *
 * @param response Fetch Response object
 * @param serverUrl Original server URL for error context
 * @returns Parsed JSON data
 */
export async function extractResponseJson(response: Response, serverUrl: string): Promise<any> {
    if (!response.ok) {
        // Handle different error status codes
        if (SERVER_ERROR_STATUS_CODES.includes(response.status)) {
            throw new NDKBlossomServerError(
                `Server error: ${response.status} ${response.statusText}`,
                ErrorCodes.SERVER_ERROR,
                serverUrl,
                response.status,
            );
        } else {
            throw new NDKBlossomServerError(
                `Request rejected: ${response.status} ${response.statusText}`,
                ErrorCodes.SERVER_REJECTED,
                serverUrl,
                response.status,
            );
        }
    }

    try {
        return await response.json();
    } catch (error) {
        throw new NDKBlossomServerError(
            `Invalid JSON response: ${(error as Error).message}`,
            ErrorCodes.SERVER_INVALID_RESPONSE,
            serverUrl,
            response.status,
            error as Error,
        );
    }
}
