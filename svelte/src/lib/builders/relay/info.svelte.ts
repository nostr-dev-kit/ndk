import type { NDKSvelte } from '../../ndk-svelte.svelte.js';
import { normalizeRelayUrl, type NDKRelayInformation } from '@nostr-dev-kit/ndk';
import { SvelteMap } from 'svelte/reactivity';

export interface RelayInfoState {
    readonly url: string;
    readonly nip11: NDKRelayInformation | null;
    readonly loading: boolean;
    readonly error: Error | null;
}

// Cache for NIP-11 info
const relayInfoCache = new SvelteMap<string, { info: NDKRelayInformation; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

async function fetchRelayInfo(relayUrl: string): Promise<NDKRelayInformation> {
    // Check cache first
    const cached = relayInfoCache.get(relayUrl);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.info;
    }

    // Convert ws/wss URL to http/https for NIP-11
    const httpUrl = relayUrl
        .replace('wss://', 'https://')
        .replace('ws://', 'http://');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    try {
        const response = await fetch(httpUrl, {
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

        // Cache empty result to prevent hammering
        const emptyInfo = {};
        relayInfoCache.set(relayUrl, { info: emptyInfo, timestamp: Date.now() });

        throw err;
    }
}

export interface RelayInfoConfig {
    relayUrl: string;
}

/**
 * Creates a reactive relay info fetcher that retrieves NIP-11 information
 *
 * @example
 * ```ts
 * // NDK from context (NDK not used by this builder)
 * const relay = createRelayInfo(() => ({ relayUrl: 'wss://relay.damus.io' }));
 *
 * // Or with explicit NDK (for consistency, though not used)
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
    const normalizedUrl = $derived(normalizeRelayUrl(config().relayUrl));
    let nip11 = $state<NDKRelayInformation | null>(null);
    let loading = $state(true);
    let error = $state<Error | null>(null);

    // Fetch NIP-11 info reactively
    $effect(() => {
        const url = normalizedUrl;
        loading = true;
        error = null;

        fetchRelayInfo(url)
            .then(info => {
                nip11 = info;
                loading = false;
            })
            .catch(err => {
                error = err;
                loading = false;
            });
    });

    return {
        get url() { return normalizedUrl; },
        get nip11() { return nip11; },
        get loading() { return loading; },
        get error() { return error; }
    };
}
