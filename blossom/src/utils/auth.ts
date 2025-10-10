import type NDK from "@nostr-dev-kit/ndk";
import { NDKEvent } from "@nostr-dev-kit/ndk";
import { ErrorCodes } from "../types";
import { BLOSSOM_AUTH_EVENT_KIND } from "./constants";
import { NDKBlossomAuthError } from "./errors";
import { DebugLogger } from "./logger";

const logger = new DebugLogger("ndk:blossom:auth");

/**
 * Create a Blossom authorization event according to BUD-01 specification
 *
 * @param ndk NDK instance
 * @param action The action being performed ('upload', 'delete', 'list', 'get')
 * @param options Options for the auth event
 * @returns Signed authentication event
 */
export async function createAuthEvent(
    ndk: NDK,
    action: "upload" | "delete" | "list" | "get",
    options: {
        sha256?: string | string[];
        content?: string;
        expirationSeconds?: number;
    } = {},
): Promise<NDKEvent> {
    // Check if NDK has a signer
    if (!ndk.signer) {
        throw new NDKBlossomAuthError("No signer available to create authentication event", ErrorCodes.NO_SIGNER);
    }

    try {
        // Create the authentication event (kind 24242)
        const authEvent = new NDKEvent(ndk);
        authEvent.kind = BLOSSOM_AUTH_EVENT_KIND;
        authEvent.created_at = Math.floor(Date.now() / 1000);

        // Set human-readable content based on action
        authEvent.content = options.content || `${action.charAt(0).toUpperCase() + action.slice(1)} blob`;

        // Add required tags
        const tags = [
            ["t", action], // Action tag (required)
        ];

        // Add sha256 hashes as 'x' tags if provided
        if (options.sha256) {
            const hashes = Array.isArray(options.sha256) ? options.sha256 : [options.sha256];
            hashes.forEach((hash) => {
                tags.push(["x", hash]);
            });
        }

        // Add expiration tag (required by BUD-01)
        const expirationSeconds = options.expirationSeconds || 3600; // Default 1 hour
        const expiration = Math.floor(Date.now() / 1000) + expirationSeconds;
        tags.push(["expiration", expiration.toString()]);

        authEvent.tags = tags;

        // Sign the event
        await authEvent.sign();
        logger.debug(`Created Blossom auth event for action: ${action}`);

        return authEvent;
    } catch (error) {
        if (error instanceof NDKBlossomAuthError) {
            throw error;
        }

        throw new NDKBlossomAuthError(
            `Failed to create auth event: ${(error as Error).message}`,
            ErrorCodes.AUTH_REQUIRED,
            undefined,
            error as Error,
        );
    }
}

/**
 * Add authorization headers to a request using base64 encoded event
 *
 * @param headers Headers object to modify
 * @param authEvent Signed authentication event
 * @returns Modified headers object
 */
export function addAuthHeaders(headers: Record<string, string>, authEvent: NDKEvent): Record<string, string> {
    // Serialize and base64 encode the event according to BUD-01
    const serializedEvent = JSON.stringify(authEvent.rawEvent());
    const encodedEvent = btoa(serializedEvent);

    return {
        ...headers,
        Authorization: `Nostr ${encodedEvent}`,
    };
}

/**
 * Create authenticated fetch options with the NDK signer
 *
 * @param ndk NDK instance
 * @param action The action being performed ('upload', 'delete', 'list', 'get')
 * @param options Options for the auth event and fetch
 * @returns Fetch options with authentication
 */
export async function createAuthenticatedFetchOptions(
    ndk: NDK,
    action: "upload" | "delete" | "list" | "get",
    options: {
        sha256?: string | string[];
        content?: string;
        expirationSeconds?: number;
        fetchOptions?: RequestInit;
    } = {},
): Promise<RequestInit> {
    // Create auth event
    const authEvent = await createAuthEvent(ndk, action, options);

    // Add auth headers
    const headers = addAuthHeaders((options.fetchOptions?.headers as Record<string, string>) || {}, authEvent);

    // Return modified options
    return {
        ...(options.fetchOptions || {}),
        headers,
    };
}
