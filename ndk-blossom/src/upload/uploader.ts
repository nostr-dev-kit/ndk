import NDK, { NDKUser, NDKEvent, NDKFilter, mapImetaTag, NDKBlossomList, NDKImetaTag } from "@nostr-dev-kit/ndk";
import { BlossomUploadOptions, ErrorCodes, SHA256Calculator } from "../types";
import { createAuthenticatedFetchOptions } from "../utils/auth";
import { fetchWithRetry, extractResponseJson } from "../utils/http";
import { defaultSHA256Calculator } from "../utils/sha256";
import {
    NDKBlossomUploadError,
    NDKBlossomServerError,
    NDKBlossomNotFoundError,
    NDKBlossomAuthError,
} from "../utils/errors";
import { DebugLogger } from "../utils/logger";
import { extractHashFromUrl } from "../healing/url-healing";
import NDKBlossom from "../blossom";

const logger = new DebugLogger("ndk:blossom:uploader");

/**
 * Upload a file to a specific Blossom server
 *
 * @param ndk NDK instance
 * @param file File to upload
 * @param serverUrl URL of the Blossom server
 * @param options Upload options
 * @returns Blob metadata
 */
export async function uploadToServer(
    ndk: NDK,
    file: File,
    serverUrl: string,
    options: BlossomUploadOptions = {},
): Promise<NDKImetaTag> {
    logger.debug(`Uploading file to ${serverUrl}`, { fileName: file.name, fileType: file.type, fileSize: file.size });

    // Use the provided SHA256 calculator or the default one
    const sha256Calculator = options.sha256Calculator || defaultSHA256Calculator;

    // Calculate file hash
    const hash = await sha256Calculator.calculateSha256(file);
    logger.debug(`File hash: ${hash}`);

    try {
        // Normalize server URL
        const baseUrl = serverUrl.endsWith("/") ? serverUrl.slice(0, -1) : serverUrl;
        const uploadUrl = `${baseUrl}/upload`;

        // Create authenticated fetch options
        const authOptions = await createAuthenticatedFetchOptions(ndk, serverUrl, {
            method: "PUT",
            body: file,
            headers: {
                "Content-Type": file.type || "application/octet-stream",
                ...options.headers,
            },
        });

        // Add progress tracking if needed
        if (options.onProgress) {
            const originalBody = authOptions.body;
            if (originalBody instanceof File || originalBody instanceof Blob) {
                const xhr = new XMLHttpRequest();

                const uploadPromise = new Promise<NDKImetaTag>((resolve, reject) => {
                    xhr.upload.addEventListener("progress", (event) => {
                        if (event.lengthComputable) {
                            options.onProgress?.({
                                loaded: event.loaded,
                                total: event.total,
                            });
                        }
                    });

                    xhr.addEventListener("load", () => {
                        if (xhr.status >= 200 && xhr.status < 300) {
                            try {
                                return JSON.parse(xhr.responseText);
                            } catch (error) {
                                reject(
                                    new NDKBlossomServerError(
                                        `Invalid response from server: ${(error as Error).message}`,
                                        ErrorCodes.SERVER_INVALID_RESPONSE,
                                        serverUrl,
                                        xhr.status,
                                        error as Error,
                                    ),
                                );
                            }
                        } else {
                            reject(
                                new NDKBlossomServerError(
                                    `Upload failed with status ${xhr.status}`,
                                    ErrorCodes.SERVER_REJECTED,
                                    serverUrl,
                                    xhr.status,
                                ),
                            );
                        }
                    });

                    xhr.addEventListener("error", () => {
                        reject(
                            new NDKBlossomServerError(
                                "Network error during upload",
                                ErrorCodes.SERVER_UNAVAILABLE,
                                serverUrl,
                            ),
                        );
                    });

                    xhr.addEventListener("abort", () => {
                        reject(new NDKBlossomServerError("Upload aborted", ErrorCodes.UPLOAD_FAILED, serverUrl));
                    });

                    // Open the request
                    xhr.open("PUT", uploadUrl);

                    // Add headers
                    for (const [key, value] of Object.entries(authOptions.headers || {})) {
                        xhr.setRequestHeader(key, value as string);
                    }

                    // Send the file
                    xhr.send(originalBody);
                });

                // Return the promise
                return await uploadPromise;
            }
        }

        // Use standard fetch if no progress tracking
        const response = await fetchWithRetry(uploadUrl, authOptions, {
            maxRetries: options.maxRetries,
            retryDelay: options.retryDelay,
        });

        // Get blob URL from response
        await extractResponseJson(response, serverUrl); // Just to check for errors

        // Determine the blob URL
        const url = `${baseUrl}/${hash}`;

        // Return the blob metadata
        return {
            url,
            size: file.size.toString(),
            m: file.type,
            x: hash,
        };
    } catch (error) {
        if (error instanceof NDKBlossomServerError || error instanceof NDKBlossomAuthError) {
            throw error;
        }

        throw new NDKBlossomUploadError(
            `Upload failed: ${(error as Error).message}`,
            ErrorCodes.UPLOAD_FAILED,
            serverUrl,
            error as Error,
        );
    }
}

/**
 * Upload a file to a user's Blossom servers
 *
 * @param file File to upload
 * @param options Upload options
 * @returns Blob metadata with imeta format
 */
export async function uploadFile(
    ndkBlossom: NDKBlossom,
    file: File,
    options: BlossomUploadOptions = {},
): Promise<NDKImetaTag> {
    logger.debug(`Starting file upload`, { fileName: file.name, fileType: file.type, fileSize: file.size });

    // Get user's Blossom server list
    const serverList = await ndkBlossom.getServerList();
    if (!serverList) {
        throw new NDKBlossomUploadError(
            "No Blossom server list found in user profile. Add servers to your profile before uploading.",
            ErrorCodes.SERVER_LIST_EMPTY,
        );
    }

    let serverUrls: string[];
    try {
        serverUrls = serverList.servers;
    } catch (error) {
        if (error instanceof NDKBlossomNotFoundError) {
            // No server list found
            throw new NDKBlossomUploadError(
                "No Blossom servers found in user profile. Add servers to your profile before uploading.",
                ErrorCodes.SERVER_LIST_EMPTY,
            );
        }
        throw error;
    }

    // Check if server list is empty
    if (!serverUrls.length) {
        throw new NDKBlossomUploadError(
            "No Blossom servers found in user profile. Add servers to your profile before uploading.",
            ErrorCodes.SERVER_LIST_EMPTY,
        );
    }

    // Try each server in order
    const errors: { serverUrl: string; error: Error }[] = [];

    for (const serverUrl of serverUrls) {
        try {
            // Try to upload to this server
            const result = await uploadToServer(ndkBlossom.ndk, file, serverUrl, options);
            logger.debug(`Upload successful to ${serverUrl}`);
            return result;
        } catch (error) {
            // Log the error
            logger.error(`Upload to ${serverUrl} failed:`, error);

            // Store the error
            errors.push({ serverUrl, error: error as Error });

            // Check if we should handle this error with custom handler
            if (options.onServerError && error instanceof NDKBlossomServerError) {
                const action = options.onServerError(error, serverUrl);
                if (action === "retry") {
                    // Retry this server
                    try {
                        const result = await uploadToServer(ndkBlossom.ndk, file, serverUrl, options);
                        logger.debug(`Retry upload successful to ${serverUrl}`);
                        return result;
                    } catch (retryError) {
                        logger.error(`Retry upload to ${serverUrl} failed:`, retryError);
                        errors.push({ serverUrl, error: retryError as Error });
                    }
                }
                // If action is 'skip', we continue to the next server
            }
        }
    }

    // If we get here, all servers failed
    throw new NDKBlossomUploadError(
        `Upload failed on all servers: ${errors.map((e) => `${e.serverUrl}: ${e.error.message}`).join(", ")}`,
        ErrorCodes.ALL_SERVERS_FAILED,
    );
}

/**
 * Find a hash in nostr by searching for #x tags
 *
 * @param ndk NDK instance
 * @param hash SHA-256 hash to search for
 * @returns Array of URLs found, empty array if none found
 */
export async function findHashInNostr(ndk: NDK, hash: string): Promise<string[]> {
    logger.debug(`Searching for hash ${hash} in nostr events`);

    // Create a filter to search for x tags
    const filter: NDKFilter = {
        "#x": [hash],
        limit: 10,
    };

    try {
        // Search for events
        const events = await ndk.fetchEvents(filter);

        // Check if we found any events
        if (events.size === 0) {
            return [];
        }

        const foundUrls: Set<string> = new Set();

        // Look for URLs in the event tags
        for (const event of events) {
            // Check for URL in tags
            for (const tag of event.tags) {
                // Check imeta tags
                if (tag[0] === "imeta") {
                    const imetaTag = mapImetaTag(tag);
                    if (imetaTag.url && imetaTag.x === hash) {
                        foundUrls.add(imetaTag.url);
                    }
                }

                // Check metadata tags
                if (tag[0] === "url" && tag[1]) {
                    // Extract hash from the URL and compare
                    const urlHash = extractHashFromUrl(tag[1]);
                    if (urlHash === hash) {
                        foundUrls.add(tag[1]);
                    }
                }
            }
        }

        return Array.from(foundUrls);
    } catch (error) {
        logger.error(`Error searching for hash in nostr:`, error);
        return [];
    }
}
