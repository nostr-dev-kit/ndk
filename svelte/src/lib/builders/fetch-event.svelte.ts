import {
  filterAndRelaySetFromBech32,
  type NDKEvent,
  type NDKSubscriptionOptions,
  type NDKFilter,
} from "@nostr-dev-kit/ndk";
import type { NDKSvelte } from "../ndk-svelte.svelte.js";

export interface FetchEventState {
  event: NDKEvent | null;
  loading: boolean;
  error: string | null;
}

export type FetchEventConfig =
  | { bech32: string; opts?: NDKSubscriptionOptions }
  | (NDKFilter & { opts?: NDKSubscriptionOptions });

/**
 * Create reactive state for fetching an event by bech32 reference or filter
 *
 * Fetches events from bech32 references (note1, nevent1, naddr1) or filter objects.
 *
 * @param ndk - NDK instance
 * @param config - Function returning configuration with bech32 reference or filter
 *
 * @example
 * ```ts
 * // With bech32
 * const fetcher = createFetchEvent(ndk, () => ({ bech32: 'note1...' }));
 *
 * // With filter
 * const fetcher = createFetchEvent(ndk, () => ({ kinds: [3], authors: [pubkey] }));
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
  ndk: NDKSvelte,
  config: () => FetchEventConfig,
): FetchEventState {
  let fetchedEvent = $state<NDKEvent | null>(null);
  let loading = $state(true);
  let error = $state<string | null>(null);

  $effect(() => {
    const cfg = config();

    loading = true;
    error = null;

    let filter: NDKFilter;
    let relaySet: any = undefined;
    let opts: NDKSubscriptionOptions | undefined;

    // Check if config has bech32 property
    if ("bech32" in cfg) {
      if (!cfg.bech32) return;
      const result = filterAndRelaySetFromBech32(cfg.bech32, ndk);
      filter = result.filter;
      relaySet = result.relaySet;
      opts = cfg.opts;
    } else {
      // Extract opts from filter config
      const { opts: configOpts, ...filterProps } = cfg;
      filter = filterProps as NDKFilter;
      opts = configOpts;
    }

    const sub = ndk.subscribe(
      filter,
      { relaySet, closeOnEose: true, ...opts },
      {
        onEvent: (e: NDKEvent) => {
          if (
            fetchedEvent?.created_at &&
            e.created_at &&
            fetchedEvent?.created_at > e.created_at
          )
            return;
          if (fetchedEvent?.id && e.id && fetchedEvent?.id === e.id) return;

          fetchedEvent = e;
          loading = false;
        },
        onEose: () => {
          loading = false;
        },
      },
    );

    return () => {
      sub?.stop();
    };
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
