import type { NDKSvelte } from '../../ndk-svelte.svelte.js';
import { normalizeRelayUrl } from '@nostr-dev-kit/ndk';
import { SvelteMap } from 'svelte/reactivity';

/**
 * NIP-11 Relay Information Document
 * https://github.com/nostr-protocol/nips/blob/master/11.md
 */
export interface RelayNIP11Info {
    name?: string;
    description?: string;
    pubkey?: string;
    contact?: string;
    supported_nips?: number[];
    software?: string;
    version?: string;
    icon?: string;
    limitation?: {
        max_message_length?: number;
        max_subscriptions?: number;
        max_filters?: number;
        max_limit?: number;
        max_subid_length?: number;
        max_event_tags?: number;
        min_prefix?: number;
        max_content_length?: number;
        min_pow_difficulty?: number;
        auth_required?: boolean;
        payment_required?: boolean;
    };
    relay_countries?: string[];
    language_tags?: string[];
    tags?: string[];
    posting_policy?: string;
    payments_url?: string;
    fees?: {
        admission?: { amount?: number; unit?: string };
        subscription?: { amount?: number; unit?: string; period?: number };
        publication?: { kinds?: number[]; amount?: number; unit?: string }[];
    };
}

export interface RelayInfoState {
    readonly url: string;
    readonly nip11: RelayNIP11Info | null;
    readonly loading: boolean;
    readonly error: Error | null;
}

// Cache for NIP-11 info
const relayInfoCache = new SvelteMap<string, { info: RelayNIP11Info; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

async function fetchRelayInfo(relayUrl: string): Promise<RelayNIP11Info> {
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
    let nip11 = $state<RelayNIP11Info | null>(null);
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
