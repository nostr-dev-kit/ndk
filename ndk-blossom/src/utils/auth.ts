import NDK, { NDKEvent } from '@nostr-dev-kit/ndk';
import { BLOSSOM_AUTH_EVENT_KIND } from './constants';
import { NDKBlossomAuthError } from './errors';
import { ErrorCodes } from '../types';
import { fetchWithRetry, extractResponseJson } from './http';
import { Logger, DebugLogger } from './logger';

const logger = new DebugLogger('ndk:blossom:auth');

/**
 * Create an authentication event for a Blossom server
 * 
 * @param ndk NDK instance
 * @param serverUrl URL of the Blossom server
 * @returns Signed authentication event
 */
export async function createAuthEvent(ndk: NDK, serverUrl: string): Promise<NDKEvent> {
    // Check if NDK has a signer
    if (!ndk.signer) {
        throw new NDKBlossomAuthError(
            'No signer available to create authentication event',
            ErrorCodes.NO_SIGNER
        );
    }

    try {
        // Get challenge from server
        const challenge = await getAuthChallenge(serverUrl);

        // Create the authentication event
        const authEvent = new NDKEvent(ndk);
        authEvent.kind = BLOSSOM_AUTH_EVENT_KIND;
        authEvent.created_at = Math.floor(Date.now() / 1000);
        authEvent.content = '';
        authEvent.tags = [
            ['challenge', challenge],
            ['url', serverUrl]
        ];

        // Sign the event
        await authEvent.sign();

        return authEvent;
    } catch (error) {
        if (error instanceof NDKBlossomAuthError) {
            throw error;
        }

        throw new NDKBlossomAuthError(
            `Failed to create auth event: ${(error as Error).message}`,
            ErrorCodes.AUTH_REQUIRED,
            serverUrl,
            error as Error
        );
    }
}

/**
 * Get an authentication challenge from a Blossom server
 * 
 * @param serverUrl URL of the Blossom server
 * @returns Challenge string
 */
async function getAuthChallenge(serverUrl: string): Promise<string> {
    try {
        // Normalize server URL
        const baseUrl = serverUrl.endsWith('/') ? serverUrl.slice(0, -1) : serverUrl;
        const url = `${baseUrl}/auth/challenge`;

        // Fetch challenge
        const response = await fetchWithRetry(url, { method: 'GET' });

        // Parse response
        const data = await extractResponseJson(response, serverUrl);

        if (!data.challenge) {
            throw new NDKBlossomAuthError(
                'Invalid challenge response from server',
                ErrorCodes.SERVER_INVALID_RESPONSE,
                serverUrl
            );
        }

        return data.challenge;
    } catch (error) {
        if (error instanceof NDKBlossomAuthError) {
            throw error;
        }

        throw new NDKBlossomAuthError(
            `Failed to get auth challenge: ${(error as Error).message}`,
            ErrorCodes.AUTH_REQUIRED,
            serverUrl,
            error as Error
        );
    }
}

/**
 * Add authentication headers to a request
 * 
 * @param headers Headers object to modify
 * @param authEvent Signed authentication event
 * @returns Modified headers object
 */
export function addAuthHeaders(headers: Record<string, string>, authEvent: NDKEvent): Record<string, string> {
    return {
        ...headers,
        'Authorization': `Nostr ${authEvent.id}`
    };
}

/**
 * Create authenticated fetch options with the NDK signer
 * 
 * @param ndk NDK instance
 * @param serverUrl Server URL for context
 * @param options Original fetch options
 * @returns Fetch options with authentication
 */
export async function createAuthenticatedFetchOptions(
    ndk: NDK,
    serverUrl: string,
    options: RequestInit = {}
): Promise<RequestInit> {
    // Create auth event
    const authEvent = await createAuthEvent(ndk, serverUrl);

    // Add auth headers
    const headers = addAuthHeaders(options.headers as Record<string, string> || {}, authEvent);

    // Return modified options
    return {
        ...options,
        headers
    };
} 