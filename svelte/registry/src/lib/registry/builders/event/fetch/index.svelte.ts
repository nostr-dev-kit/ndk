import { filterAndRelaySetFromBech32, type NDKEvent, type NDKSubscriptionOptions } from '@nostr-dev-kit/ndk';
import type { NDKSvelte } from '@nostr-dev-kit/svelte';
import { getNDK } from '../../../utils/ndk/index.svelte.js';

export interface FetchEventState {
    event: NDKEvent | null;
    loading: boolean;
    error: string | null;
}

export interface FetchEventConfig {
    bech32: string;
    opts?: NDKSubscriptionOptions
}

/**
 * Create reactive state for fetching an event by bech32 reference
 *
 * Fetches events from bech32 references (note1, nevent1, naddr1).
 *
 * @param config - Function returning configuration with bech32 reference
 * @param ndk - Optional NDK instance (uses context if not provided)
 *
 * @example
 * ```ts
 * // NDK from context
 * const fetcher = createFetchEvent(() => ({ bech32: 'note1...' }));
 *
 * // Or with explicit NDK
 * const fetcher = createFetchEvent(() => ({ bech32: 'note1...' }), ndk);
 *
 * // Access state
 * fetcher.event // The fetched event
 * fetcher.loading // Loading state
 * fetcher.error // Error message if any
 *
 * // Use in template
 * {#if fetcher.loading}
 *   Loading...
 * {:else if fetcher.error}
 *   {fetcher.error}
 * {:else if fetcher.event}
 *   Event was published at {fetcher.event.created_at}
 * {/if}
 * ```
 */
export function createFetchEvent(
    config: () => FetchEventConfig,
    ndkParam?: NDKSvelte
): FetchEventState {
    const ndk = getNDK(ndkParam);
    let fetchedEvent = $state<NDKEvent | null>(null);
    let loading = $state(true);
    let error = $state<string | null>(null);

    $effect(() => {
        const { bech32: currentBech32, opts } = config();
        if (!currentBech32) return;

        loading = true;
        error = null;

        const { filter, relaySet } = filterAndRelaySetFromBech32(currentBech32, ndk);

        ndk.subscribe(
            filter,
            { relaySet, closeOnEose: true, ...opts },
            {
                onEvent: (e: NDKEvent) => {
                    if (fetchedEvent?.created_at && e.created_at && fetchedEvent?.created_at > e.created_at) return;
                    if (fetchedEvent?.id && e.id && fetchedEvent?.id === e.id) return;

                    fetchedEvent = e;
                    loading = false;
                },
                onEose: () => {
                    loading = false;
                },
            },
        );
    });

    return {
        get event() {
            return fetchedEvent;
        },
        get loading() {
            return loading;
        },
        get error() {
            return error;
        },
    };
}
