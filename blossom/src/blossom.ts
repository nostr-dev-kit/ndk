import type NDK from "@nostr-dev-kit/ndk";
import { NDKBlossomList, NDKEvent, type NDKImetaTag, NDKKind, type NDKUser, wrapEvent } from "@nostr-dev-kit/ndk";
import { fixUrl, getBlobUrlByHash } from "./healing/url-healing";
import type {
    BlossomOptimizationOptions,
    BlossomRetryOptions,
    BlossomServerConfig,
    BlossomUploadOptions,
    SHA256Calculator,
} from "./types";
import { uploadFile } from "./upload/uploader";
import { DEFAULT_RETRY_OPTIONS } from "./utils/constants";
import {
    NDKBlossomAuthError,
    NDKBlossomError,
    NDKBlossomNotFoundError,
    NDKBlossomOptimizationError,
    NDKBlossomServerError,
    NDKBlossomUploadError,
} from "./utils/errors";
import { checkBlobExists, fetchWithRetry } from "./utils/http";
import { CustomLogger, DebugLogger, type Logger } from "./utils/logger";
import { defaultSHA256Calculator } from "./utils/sha256";

/**
 * NDKBlossom class for interacting with the Blossom protocol
 */
export class NDKBlossom {
    public ndk: NDK;
    private serverConfigs: Map<string, BlossomServerConfig> = new Map();
    private retryOptions: BlossomRetryOptions;
    private debugMode: boolean = false;
    private logger: Logger;
    private sha256Calculator: SHA256Calculator;

    /**
     * Callback for upload failures
     */
    public onUploadFailed?: (error: string, serverUrl?: string, file?: File) => void;

    /**
     * Callback for upload progress
     */
    public onUploadProgress?: (
        progress: { loaded: number; total: number },
        file: File,
        serverUrl: string,
    ) => "continue" | "cancel";

    /**
     * Callback for mirror progress
     */
    public onMirrorProgress?: (current: number, total: number, sourceUrl: string) => void;

    /**
     * Callback for server errors
     */
    public onServerError?: (error: NDKBlossomServerError) => void;

    /**
     * Constructor for NDKBlossom
     * @param ndk NDK instance
     */
    constructor(ndk: NDK) {
        this.ndk = ndk;
        this.retryOptions = DEFAULT_RETRY_OPTIONS;
        this.logger = new DebugLogger();
        this.sha256Calculator = defaultSHA256Calculator;
    }

    /**
     * Enable or disable debug mode
     */
    set debug(value: boolean) {
        this.debugMode = value;
    }

    /**
     * Get debug mode status
     */
    get debug(): boolean {
        return this.debugMode;
    }

    /**
     * Set custom logger
     */
    set loggerFunction(logFn: (level: string, message: string, data?: any) => void) {
        this.logger = new CustomLogger(logFn);
    }

    /**
     * Set a custom SHA256 calculator implementation
     * @param calculator Custom SHA256 calculator
     */
    public setSHA256Calculator(calculator: SHA256Calculator): void {
        this.sha256Calculator = calculator;
    }

    /**
     * Get the current SHA256 calculator implementation
     * @returns Current SHA256 calculator
     */
    public getSHA256Calculator(): SHA256Calculator {
        return this.sha256Calculator;
    }

    private _serverList: NDKBlossomList | undefined;

    set serverList(serverList: NDKBlossomList) {
        this._serverList = serverList;
    }

    public async getServerList(user?: NDKUser): Promise<NDKBlossomList | undefined> {
        if (this._serverList) {
            this.logger.debug(`Using cached server list with ${this._serverList.servers.length} servers`);
            return this._serverList;
        }

        user ??= this.ndk.activeUser;
        if (!user) {
            this.logger.error("No user available to fetch server list");
            throw new NDKBlossomError("No user available to fetch server list", "NO_SIGNER");
        }

        this.logger.debug(`Fetching server list for user ${user.pubkey}`);
        const filter = { kinds: NDKBlossomList.kinds, authors: [user.pubkey] };
        const event = await this.ndk.fetchEvent(filter);

        if (!event) {
            this.logger.warn(`No blossom server list event found for user ${user.pubkey}`);
            return undefined;
        }

        this._serverList = wrapEvent(event) as NDKBlossomList;
        this.logger.debug(
            `Found server list with ${this._serverList.servers.length} servers: ${this._serverList.servers.join(", ")}`,
        );
        return this._serverList;
    }

    /**
     * Uploads a file to a Blossom server
     * @param file The file to upload
     * @param options Upload options
     * @returns Image metadata
     */
    public async upload(file: File, options: BlossomUploadOptions = {}): Promise<NDKImetaTag> {
        try {
            // Set up progress callback if specified
            if (this.onUploadProgress) {
                options.onProgress = (progress) => {
                    if (this.onUploadProgress) {
                        return this.onUploadProgress(progress, file, "unknown");
                    }
                    return "continue";
                };
            }

            // Set the SHA256 calculator if not provided in options
            if (!options.sha256Calculator) {
                options.sha256Calculator = this.getSHA256Calculator();
            }

            // Upload the file
            const result = await uploadFile(this, file, options);
            return result;
        } catch (error) {
            // Handle upload failures
            if (this.onUploadFailed && error instanceof Error) {
                this.onUploadFailed(
                    error.message,
                    error instanceof NDKBlossomUploadError ? error.serverUrl : undefined,
                    file,
                );
            }

            // Re-throw the error
            throw error;
        }
    }

    /**
     * Fixes a Blossom URL by finding an alternative server with the same blob
     * @param user The user whose servers to check
     * @param url The URL to fix
     * @returns A fixed URL pointing to a valid Blossom server
     */
    public async fixUrl(user: NDKUser, url: string): Promise<string> {
        return fixUrl(this.ndk, user, url);
    }

    /**
     * Gets a blob from a URL
     * @param url The URL of the blob
     * @returns The blob response
     */
    public async getBlob(url: string): Promise<Response> {
        try {
            return await fetchWithRetry(url, {}, this.retryOptions);
        } catch (error) {
            throw new NDKBlossomNotFoundError(
                `Failed to fetch blob: ${(error as Error).message}`,
                "BLOB_NOT_FOUND",
                url,
                error as Error,
            );
        }
    }

    /**
     * Gets a blob by its hash from one of the user's servers
     * @param user The user whose servers to check
     * @param hash The hash of the blob
     * @returns The blob response
     */
    public async getBlobByHash(user: NDKUser, hash: string): Promise<Response> {
        // Get URL from hash
        const url = await getBlobUrlByHash(this.ndk, user, hash);

        // Get the blob
        return this.getBlob(url);
    }

    /**
     * Lists blobs for a user
     * @param user The user whose blobs to list
     * @returns Array of blob descriptors
     */
    public async listBlobs(user: NDKUser): Promise<NDKImetaTag[]> {
        // Get user's server list
        const serverList = await this.getServerList();

        let serverUrls: string[] = [];

        if (serverList) serverUrls = serverList.servers;

        if (serverUrls.length === 0) {
            this.logger.error(`No servers found for user ${user.pubkey}`);
            return [];
        }

        // Array to store all blobs
        const blobMap = new Map<string, NDKImetaTag>(); // Use hash as key to deduplicate

        // Try each server
        for (const serverUrl of serverUrls) {
            try {
                // Normalize server URL
                const baseUrl = serverUrl.endsWith("/") ? serverUrl.slice(0, -1) : serverUrl;
                const url = `${baseUrl}/list/${user.pubkey}`;

                // Fetch blobs
                const response = await fetchWithRetry(url, {}, this.retryOptions);

                // Check if response is OK
                if (!response.ok) {
                    continue; // Skip this server
                }

                // Parse response
                const data = await response.json();

                // Process blobs
                if (Array.isArray(data)) {
                    for (const blob of data) {
                        // Convert to NDKImetaTag format
                        const imeta: NDKImetaTag = {
                            url: blob.url,
                            size: blob.size?.toString(),
                            m: blob.mime_type,
                            x: blob.sha256,
                            dim: blob.width && blob.height ? `${blob.width}x${blob.height}` : undefined,
                            blurhash: blob.blurhash,
                            alt: blob.alt,
                        };

                        // Add to map using hash as key for deduplication
                        if (blob.sha256) {
                            blobMap.set(blob.sha256, imeta);
                        }
                    }
                }
            } catch (error) {
                // Log error and continue to next server
                this.logger.error(`Error listing blobs on server ${serverUrl}:`, error);
            }
        }

        // Convert map to array
        return Array.from(blobMap.values());
    }

    /**
     * Deletes a blob
     * @param hash The hash of the blob to delete
     * @returns True if successful
     */
    public async deleteBlob(hash: string): Promise<boolean> {
        if (!this.ndk.signer) {
            throw new NDKBlossomAuthError("No signer available to delete blob", "NO_SIGNER");
        }

        // Get user's pubkey
        const pubkey = (await this.ndk.signer.user()).pubkey;

        // Get user's server list
        const filter = { kinds: [NDKKind.BlossomList], authors: [pubkey] };
        const event = await this.ndk.fetchEvent(filter);

        let serverUrls: string[] = [];

        if (event) {
            // Extract server URLs from tags
            serverUrls = event.tags
                .filter((tag: string[]) => tag[0] === "server" && tag[1])
                .map((tag: string[]) => tag[1]);
        }

        if (serverUrls.length === 0) {
            this.logger.error(`No servers found for user ${pubkey}`);
            return false;
        }

        // Flag to track success
        let success = false;

        // Try each server
        for (const serverUrl of serverUrls) {
            try {
                // Normalize server URL
                const baseUrl = serverUrl.endsWith("/") ? serverUrl.slice(0, -1) : serverUrl;
                const url = `${baseUrl}/${hash}`;

                // Create authenticated request
                const options = await createAuthenticatedFetchOptions(this.ndk, "delete", {
                    sha256: hash,
                    content: `Delete blob ${hash}`,
                    fetchOptions: {
                        method: "DELETE",
                    },
                });

                // Send delete request
                const response = await fetchWithRetry(url, options, this.retryOptions);

                // Check if successful
                if (response.ok) {
                    success = true;
                }
            } catch (error) {
                // Log error and continue to next server
                this.logger.error(`Error deleting blob on server ${serverUrl}:`, error);
            }
        }

        return success;
    }

    /**
     * Checks if a server has a blob
     * @param serverUrl The URL of the server
     * @param hash The hash of the blob
     * @returns True if the server has the blob
     */
    public async checkServerForBlob(serverUrl: string, hash: string): Promise<boolean> {
        return checkBlobExists(serverUrl, hash);
    }

    /**
     * Sets retry options for network operations
     * @param options Retry options
     */
    public setRetryOptions(options: Partial<BlossomRetryOptions>): void {
        this.retryOptions = {
            ...this.retryOptions,
            ...options,
        };
    }

    /**
     * Sets server-specific configuration
     * @param serverUrl The URL of the server
     * @param config Server configuration
     */
    public setServerConfig(serverUrl: string, config: BlossomServerConfig): void {
        this.serverConfigs.set(serverUrl, config);
    }

    /**
     * Gets an optimized version of a blob
     * @param url The URL of the blob
     * @param options Optimization options
     * @returns The optimized blob response
     */
    public async getOptimizedBlob(url: string, options: BlossomOptimizationOptions = {}): Promise<Response> {
        try {
            // Parse the URL and extract relevant parts
            const urlObj = new URL(url);
            const baseUrl = `${urlObj.protocol}//${urlObj.host}`;
            const hash = urlObj.pathname.split("/").pop();

            if (!hash) {
                throw new NDKBlossomOptimizationError("Invalid URL, no hash found", "BLOB_NOT_FOUND", url);
            }

            // Construct the media URL
            let mediaUrl = `${baseUrl}/media/${hash}`;

            // Add optimization parameters as query string
            const params = new URLSearchParams();
            for (const [key, value] of Object.entries(options)) {
                if (value !== undefined) {
                    params.append(key, value.toString());
                }
            }

            if (params.toString()) {
                mediaUrl += `?${params.toString()}`;
            }

            // Fetch the optimized blob
            const response = await fetchWithRetry(mediaUrl, {}, this.retryOptions);

            if (!response.ok) {
                throw new NDKBlossomOptimizationError(
                    `Failed to get optimized blob: ${response.status} ${response.statusText}`,
                    "SERVER_REJECTED",
                    url,
                );
            }

            return response;
        } catch (error) {
            if (error instanceof NDKBlossomOptimizationError) {
                throw error;
            }

            throw new NDKBlossomOptimizationError(
                `Failed to get optimized blob: ${(error as Error).message}`,
                "SERVER_UNSUPPORTED",
                url,
                error as Error,
            );
        }
    }

    /**
     * Gets an optimized URL for a blob
     * @param url The URL of the blob
     * @param options Optimization options
     * @returns The optimized URL
     */
    public async getOptimizedUrl(url: string, options: BlossomOptimizationOptions = {}): Promise<string> {
        // Parse the URL and extract relevant parts
        const urlObj = new URL(url);
        const baseUrl = `${urlObj.protocol}//${urlObj.host}`;
        const hash = urlObj.pathname.split("/").pop();

        if (!hash) {
            throw new NDKBlossomOptimizationError("Invalid URL, no hash found", "BLOB_NOT_FOUND", url);
        }

        // Construct the media URL
        let mediaUrl = `${baseUrl}/media/${hash}`;

        // Add optimization parameters as query string
        const params = new URLSearchParams();
        for (const [key, value] of Object.entries(options)) {
            if (value !== undefined) {
                params.append(key, value.toString());
            }
        }

        if (params.toString()) {
            mediaUrl += `?${params.toString()}`;
        }

        return mediaUrl;
    }

    /**
     * Generates a srcset for responsive images
     * @param url The base URL of the image
     * @param sizes Array of size configurations
     * @returns A srcset string
     */
    public generateSrcset(url: string, sizes: { width: number; format?: string }[]): string {
        const srcset: string[] = [];

        // Parse the URL and extract relevant parts
        const urlObj = new URL(url);
        const baseUrl = `${urlObj.protocol}//${urlObj.host}`;
        const hash = urlObj.pathname.split("/").pop();

        if (!hash) {
            return ""; // Invalid URL, can't generate srcset
        }

        // Generate a srcset entry for each size
        for (const size of sizes) {
            // Build the query parameters
            const params = new URLSearchParams();
            params.append("width", size.width.toString());
            if (size.format) {
                params.append("format", size.format);
            }

            // Build the URL
            const mediaUrl = `${baseUrl}/media/${hash}?${params.toString()}`;

            // Add to srcset
            srcset.push(`${mediaUrl} ${size.width}w`);
        }

        return srcset.join(", ");
    }
}

/**
 * Helper function to create authenticated fetch options
 */
async function createAuthenticatedFetchOptions(
    ndk: NDK,
    action: "upload" | "delete" | "list" | "get",
    options: {
        sha256?: string | string[];
        content?: string;
        expirationSeconds?: number;
        fetchOptions?: RequestInit;
    } = {},
): Promise<RequestInit> {
    // Import the auth utility here to avoid circular dependencies
    const { createAuthenticatedFetchOptions: authFn } = await import("./utils/auth");
    return authFn(ndk, action, options);
}

// Export error types
export {
    NDKBlossomError,
    NDKBlossomUploadError,
    NDKBlossomServerError,
    NDKBlossomAuthError,
    NDKBlossomNotFoundError,
    NDKBlossomOptimizationError,
};

// Export types
export type { BlossomRetryOptions, BlossomServerConfig, BlossomUploadOptions, BlossomOptimizationOptions, NDKImetaTag };

// Export default
export default NDKBlossom;
