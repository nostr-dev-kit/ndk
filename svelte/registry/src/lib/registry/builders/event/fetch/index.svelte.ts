import type { NDKEvent } from '@nostr-dev-kit/ndk';
import type { NDKSvelte } from '@nostr-dev-kit/svelte';
import { getNDK } from '../../../utils/ndk/index.svelte.js';

export interface FetchEventState {
    event: NDKEvent | null;
    loading: boolean;
    error: string | null;
}

export interface FetchEventConfig {
    bech32: string;
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
        const { bech32: currentBech32 } = config();
        if (!currentBech32) return;

        loading = true;
        error = null;

        ndk.fetchEvent(currentBech32)
            .then(event => {
                if (event) {
                    fetchedEvent = event;
                } else {
                    error = 'Event not found';
                }
                loading = false;
            })
            .catch(err => {
                console.error('Failed to fetch event:', err);
                error = 'Failed to load event';
                loading = false;
            });
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
