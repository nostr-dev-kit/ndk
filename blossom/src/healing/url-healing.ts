import type NDK from "@nostr-dev-kit/ndk";
import { type NDKBlossomList, NDKKind, type NDKUser, wrapEvent } from "@nostr-dev-kit/ndk";
import { ErrorCodes } from "../types";
import { findHashInNostr } from "../upload/uploader";
import { NDKBlossomNotFoundError } from "../utils/errors";
import { checkBlobExists } from "../utils/http";
import { DebugLogger } from "../utils/logger";

const logger = new DebugLogger("ndk:blossom:url-healing");

/**
 * Extract hash from a Blossom URL
 *
 * @param url URL to extract hash from
 * @returns SHA-256 hash or undefined if not found
 */
export function extractHashFromUrl(url: string): string | undefined {
    try {
        const urlObj = new URL(url);

        // Get the pathname
        const pathname = urlObj.pathname;

        // Extract the hash
        const parts = pathname.split("/");
        const lastPart = parts[parts.length - 1];

        // Remove file extension if present
        const hash = lastPart.includes(".") ? lastPart.split(".")[0] : lastPart;

        // Validate that it looks like a SHA-256 hash (64 hex chars)
        if (/^[a-f0-9]{64}$/i.test(hash)) {
            return hash;
        }

        return undefined;
    } catch (error) {
        logger.error(`Error extracting hash from URL ${url}:`, error);
        return undefined;
    }
}

/**
 * Try a list of URLs and return the first working one
 *
 * @param urls List of URLs to try
 * @param skipUrl Optional URL to skip (e.g., the original failing URL)
 * @returns First working URL or the first URL if none work
 */
async function tryUrls(urls: string[], skipUrl?: string): Promise<string | undefined> {
    if (urls.length === 0) return undefined;

    // Filter out the URL to skip
    const filteredUrls = skipUrl ? urls.filter((url) => url !== skipUrl) : urls;

    if (filteredUrls.length === 0) return undefined;

    // Try each URL
    for (const url of filteredUrls) {
        try {
            const exists = await checkBlobExists(url, "");
            if (exists) {
                logger.debug(`Found working URL: ${url}`);
                return url;
            }
        } catch (error) {
            logger.debug(`URL check failed for ${url}:`, error);
            // Continue to next URL
        }
    }

    // If none of the URLs work, return the first one
    logger.debug(`No working URLs found, returning first URL: ${filteredUrls[0]}`);
    return filteredUrls[0];
}

/**
 * Fix a Blossom URL by finding an alternative server with the same blob
 *
 * @param ndk NDK instance
 * @param user NDK user
 * @param url URL to fix
 * @returns Fixed URL or original if not fixable
 */
export async function fixUrl(ndk: NDK, user: NDKUser, url: string): Promise<string> {
    logger.debug(`Fixing URL: ${url}`);

    // Extract hash from URL
    const hash = extractHashFromUrl(url);
    if (!hash) {
        logger.debug(`Invalid URL, no hash found: ${url}`);
        return url; // Can't fix without a hash
    }

    // Check if the original URL works
    try {
        const exists = await checkBlobExists(url, "");
        if (exists) {
            logger.debug(`Original URL works, no need to fix: ${url}`);
            return url;
        }
    } catch (error) {
        logger.debug(`Original URL check failed: ${error}`);
    }

    // Try to find an alternative server
    try {
        // Get user's server list
        const filter = { kinds: [NDKKind.BlossomList], authors: [user.pubkey] };
        const event = await ndk.fetchEvent(filter);

        let serverUrls: string[] = [];

        if (event) {
            const wrappedEvent = wrapEvent(event) as NDKBlossomList;
            serverUrls = wrappedEvent.servers;
        }

        if (serverUrls.length === 0) {
            logger.debug(`No servers found for user ${user.pubkey}`);
            // Try to find URLs in nostr events
            const nostrUrls = await findHashInNostr(ndk, hash);
            const workingUrl = await tryUrls(nostrUrls, url);
            if (workingUrl) {
                return workingUrl;
            }
            return url;
        }

        // Try each server
        for (const serverUrl of serverUrls) {
            try {
                // Normalize server URL
                const baseUrl = serverUrl.endsWith("/") ? serverUrl.slice(0, -1) : serverUrl;
                const newUrl = `${baseUrl}/${hash}`;

                // Check if this server has the blob
                const exists = await checkBlobExists(serverUrl, hash);
                if (exists) {
                    logger.debug(`Found alternative server: ${newUrl}`);
                    return newUrl;
                }
            } catch (error) {
                logger.debug(`Server check failed for ${serverUrl}:`, error);
                // Continue to next server
            }
        }

        // If no servers have it, try to find it in nostr events
        const nostrUrls = await findHashInNostr(ndk, hash);
        const workingUrl = await tryUrls(nostrUrls, url);
        if (workingUrl) {
            return workingUrl;
        }

        // If we get here, we couldn't fix the URL
        logger.debug(`Could not fix URL: ${url}`);

        // Return the original URL
        return url;
    } catch (error) {
        // If we get here, we couldn't fix the URL
        logger.debug(`Error fixing URL: ${error}`);

        // Return the original URL
        return url;
    }
}

/**
 * Get a blob by its hash from one of a user's servers
 *
 * @param ndk NDK instance
 * @param user NDK user
 * @param hash SHA-256 hash of the blob
 * @returns URL to the blob if found
 */
export async function getBlobUrlByHash(ndk: NDK, user: NDKUser, hash: string): Promise<string> {
    logger.debug(`Getting blob URL for hash: ${hash}`);

    // Try to find it on the user's servers
    try {
        // Get user's server list
        const filter = { kinds: [NDKKind.BlossomList], authors: [user.pubkey] };
        const event = await ndk.fetchEvent(filter);

        let serverUrls: string[] = [];

        if (event) {
            // Extract server URLs from tags
            serverUrls = event.tags
                .filter((tag: string[]) => tag[0] === "server" && tag[1])
                .map((tag: string[]) => tag[1]);
        }

        if (serverUrls.length === 0) {
            logger.debug(`No servers found for user ${user.pubkey}`);

            // Try to find it in nostr events
            const nostrUrls = await findHashInNostr(ndk, hash);
            const workingUrl = await tryUrls(nostrUrls);
            if (workingUrl) {
                return workingUrl;
            }

            throw new NDKBlossomNotFoundError(
                `No servers found for user ${user.pubkey}`,
                ErrorCodes.USER_SERVER_LIST_NOT_FOUND,
            );
        }

        // Try each server
        for (const serverUrl of serverUrls) {
            try {
                // Normalize server URL
                const baseUrl = serverUrl.endsWith("/") ? serverUrl.slice(0, -1) : serverUrl;
                const url = `${baseUrl}/${hash}`;

                // Check if this server has the blob
                const exists = await checkBlobExists(serverUrl, hash);
                if (exists) {
                    logger.debug(`Found blob on server: ${url}`);
                    return url;
                }
            } catch (error) {
                logger.debug(`Server check failed for ${serverUrl}:`, error);
                // Continue to next server
            }
        }

        // If we get here, the hash wasn't found on any server
        throw new NDKBlossomNotFoundError(
            `Blob with hash ${hash} not found on any of user's servers`,
            ErrorCodes.BLOB_NOT_FOUND,
        );
    } catch (error) {
        if (error instanceof NDKBlossomNotFoundError) {
            throw error;
        }

        // Try to find it in nostr events
        const nostrUrls = await findHashInNostr(ndk, hash);
        const workingUrl = await tryUrls(nostrUrls);
        if (workingUrl) {
            return workingUrl;
        }

        throw new NDKBlossomNotFoundError(
            `Failed to get blob URL: ${(error as Error).message}`,
            ErrorCodes.BLOB_NOT_FOUND,
            undefined,
            error as Error,
        );
    }
}
