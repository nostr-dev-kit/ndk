import type { NDKSvelte } from '@nostr-dev-kit/svelte';
import { normalizeRelayUrl, type NDKRelayInformation } from '@nostr-dev-kit/ndk';
import { SvelteMap } from 'svelte/reactivity';

export interface RelayInfoState {
    readonly url: string | null;
    readonly nip11: NDKRelayInformation | null;
    readonly loading: boolean;
    readonly error: Error | null;
}

// Cache for NIP-11 info
const relayInfoCache = new SvelteMap<string, { info: NDKRelayInformation; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

// Track in-flight requests to prevent duplicates
const inFlightRequests = new Map<string, Promise<NDKRelayInformation>>();

async function fetchRelayInfo(relayUrl: string, ndk?: NDKSvelte, signal?: AbortSignal): Promise<NDKRelayInformation> {
    // Check cache first
    const cached = relayInfoCache.get(relayUrl);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.info;
    }

    // Check if there's already an in-flight request for this URL
    const existingRequest = inFlightRequests.get(relayUrl);
    if (existingRequest) {
        return existingRequest;
    }

    // Convert ws/wss URL to http/https for NIP-11
    const httpUrl = relayUrl
        .replace('wss://', 'https://')
        .replace('ws://', 'http://');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    // Chain the external signal if provided
    if (signal) {
        signal.addEventListener('abort', () => controller.abort());
    }

    const requestPromise = (async () => {
        try {
            const fetchFn = ndk?.httpFetch || fetch;
            const response = await fetchFn(httpUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/nostr+json'
                },
                signal: controller.signal,
                mode: 'cors'
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();

            // Cache the result
            relayInfoCache.set(relayUrl, { info: data, timestamp: Date.now() });
            return data;
        } catch (err) {
            clearTimeout(timeoutId);

            // Only cache errors if not aborted
            if (!(err instanceof Error && err.name === 'AbortError')) {
                const emptyInfo = {};
                relayInfoCache.set(relayUrl, { info: emptyInfo, timestamp: Date.now() });
            }

            throw err;
        } finally {
            // Remove from in-flight requests
            inFlightRequests.delete(relayUrl);
        }
    })();

    inFlightRequests.set(relayUrl, requestPromise);
    return requestPromise;
}

export interface RelayInfoConfig {
    relayUrl: string;
}

/**
 * Creates a reactive relay info fetcher that retrieves NIP-11 information
 *
 * @example
 * ```ts
 * const relay = createRelayInfo(() => ({ relayUrl: 'wss://relay.damus.io' }));
 *
 * // Or with explicit NDK (for httpFetch support)
 * const relay = createRelayInfo(() => ({ relayUrl: 'wss://relay.damus.io' }), ndk);
 *
 * // Access reactive state
 * console.log(relay.url);          // normalized URL
 * console.log(relay.nip11?.name);  // relay name
 * console.log(relay.loading);      // loading state
 * ```
 */
export function createRelayInfo(
    config: () => RelayInfoConfig,
    ndk?: NDKSvelte
): RelayInfoState {
    // Handle falsy URLs gracefully
    const normalizedUrl = $derived.by(() => {
        const url = config().relayUrl;
        if (!url) return null;
        try {
            return normalizeRelayUrl(url);
        } catch {
            return null;
        }
    });
    let nip11 = $state<NDKRelayInformation | null>(null);
    let loading = $state(false);
    let error = $state<Error | null>(null);

    // Fetch NIP-11 info reactively with proper cleanup
    $effect(() => {
        const url = normalizedUrl;

        // No-op when no valid URL
        if (!url) {
            nip11 = null;
            loading = false;
            error = null;
            return;
        }

        const controller = new AbortController();

        loading = true;
        error = null;

        fetchRelayInfo(url, ndk, controller.signal)
            .then(info => {
                if (!controller.signal.aborted) {
                    nip11 = info;
                    loading = false;
                }
            })
            .catch(err => {
                if (!controller.signal.aborted) {
                    error = err;
                    loading = false;
                }
            });

        // Cleanup: abort fetch if effect re-runs or component unmounts
        return () => {
            controller.abort();
        };
    });

    return {
        get url() { return normalizedUrl; },
        get nip11() { return nip11; },
        get loading() { return loading; },
        get error() { return error; }
    };
}
