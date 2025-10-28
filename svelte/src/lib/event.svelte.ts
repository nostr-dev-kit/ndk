import { NDKEvent, type NDKFilter, type NDKSubscriptionOptions } from "@nostr-dev-kit/ndk";
import type { NDKSvelte } from "./ndk-svelte.svelte";
import { validateCallback } from "./utils/validate-callback.js";
import { untrack } from "svelte";

// Track in-flight event fetch requests to prevent duplicate fetches
const inFlightEventRequests = new Map<string, Promise<NDKEvent | null>>();

export type FetchEventsConfig = { filters: NDKFilter | NDKFilter[] } & NDKSubscriptionOptions;

export interface FetchEventOptions {
    /**
     * Whether to wrap events in kind-specific classes.
     * @default true
     */
    wrap?: boolean;
}

export type FetchEventResult<T extends NDKEvent = NDKEvent> = T & {
    $loaded: boolean;
};

/**
 * Reactively fetch a single event
 *
 * Returns a reactive event object with all event properties directly accessible.
 * Use `$loaded` to check if the event has been fetched.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   const event = ndk.$fetchEvent(() => eventId);
 * </script>
 *
 * {#if event.$loaded}
 *   <div>{event.content}</div>
 * {:else}
 *   <div>Loading...</div>
 * {/if}
 * ```
 */
export function createFetchEvent<T extends NDKEvent = NDKEvent>(
    ndk: NDKSvelte,
    idOrFilter: () => string | NDKFilter | NDKFilter[] | undefined,
    options?: FetchEventOptions,
): FetchEventResult<T> {
    validateCallback(idOrFilter, "$fetchEvent", "idOrFilter");

    // Initialize as NDKEvent instance to preserve prototype/getters/methods
    const instance = new NDKEvent(ndk);
    (instance as any).$loaded = false; // Add dynamic $loaded property
    const res = $state(instance as FetchEventResult<T>);

    const derivedIdOrFilter = $derived(idOrFilter());

    const wrap = options?.wrap ?? true;

    function clearRes() {
        // Mutate to clear all properties except $loaded, then set $loaded
        Object.keys(res).forEach((key) => {
            if (key !== "$loaded") delete res[key as keyof FetchEventResult<T>];
        });
        res.$loaded = false;
    }

    $effect(() => {
        const f = derivedIdOrFilter;
        if (!f) {
            untrack(() => clearRes());
            return;
        }

        // Generate a cache key for this fetch request
        const cacheKey = typeof f === "string" ? f : JSON.stringify(f);

        // Check if there's already an in-flight request
        let fetchPromise = inFlightEventRequests.get(cacheKey);

        if (!fetchPromise) {
            // No in-flight request, create a new one
            fetchPromise = ndk.fetchEvent(f, { wrap }).finally(() => {
                inFlightEventRequests.delete(cacheKey);
            });

            inFlightEventRequests.set(cacheKey, fetchPromise);
        }

        // Clear event while loading
        untrack(() => clearRes());

        // Capture filter in closure for async callbacks
        const capturedKey = cacheKey;

        fetchPromise
            .then((fetchedEvent) => {
                const currentKey =
                    typeof derivedIdOrFilter === "string" ? derivedIdOrFilter : JSON.stringify(derivedIdOrFilter);

                if (currentKey === capturedKey && fetchedEvent) {
                    // Update own properties while preserving class prototype
                    Object.assign(res, fetchedEvent);
                    res.$loaded = true;
                }
            })
            .catch(() => {
                const currentKey =
                    typeof derivedIdOrFilter === "string" ? derivedIdOrFilter : JSON.stringify(derivedIdOrFilter);

                if (currentKey === capturedKey) {
                    clearRes();
                }
            });
    });

    return res;
}

/**
 * Reactively fetch multiple events
 *
 * Returns a reactive array of events that updates when the filters change.
 * Supports all NDKSubscriptionOptions (relayUrls, pool, closeOnEose, groupable, cacheUsage, etc.)
 *
 * @param config - Callback returning config or filters or undefined
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   // Shorthand: Return filter directly (automatically wrapped)
 *   const pubkey = $state('hex...');
 *   const events = ndk.$fetchEvents(() => ({
 *     kinds: [1],
 *     authors: [pubkey],
 *     limit: 10
 *   }));
 * </script>
 *
 * {#each events as event}
 *   <div>{event.content}</div>
 * {/each}
 * ```
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   // Shorthand: Return array of filters (automatically wrapped)
 *   const events = ndk.$fetchEvents(() => [
 *     { kinds: [1], authors: [pubkey1] },
 *     { kinds: [1], authors: [pubkey2] }
 *   ]);
 * </script>
 * ```
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import type { NDKArticle } from "@nostr-dev-kit/ndk";
 *
 *   // Full config - use when you need additional options
 *   let selectedRelays = $state(['wss://relay.damus.io']);
 *
 *   const articles = ndk.$fetchEvents<NDKArticle>(() => ({
 *     filters: [{ kinds: [30023], limit: 10 }],
 *     relayUrls: selectedRelays,
 *     closeOnEose: true
 *   }));
 * </script>
 *
 * {#each articles as article}
 *   <h2>{article.title}</h2>
 *   <div>{article.content}</div>
 * {/each}
 * ```
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   // Conditional fetch - return undefined to prevent fetching
 *   const events = ndk.$fetchEvents(() => {
 *     if (!shouldFetch) return undefined;
 *     return {
 *       filters: [{ kinds: [1], authors: [pubkey] }],
 *       relayUrls: selectedRelays
 *     };
 *   });
 * </script>
 * ```
 */
export function createFetchEvents<T extends NDKEvent = NDKEvent>(
    ndk: NDKSvelte,
    config: () => FetchEventsConfig | NDKFilter | NDKFilter[] | undefined,
): T[] {
    validateCallback(config, '$fetchEvents', 'config');
    const _events = $state<T[]>([]);

    // Derive reactive config
    const derivedConfig = $derived.by(() => {
        const rawConfig = config();
        if (!rawConfig) return rawConfig;

        // If config has 'filters' property, use it as-is
        if ('filters' in rawConfig) {
            return rawConfig as FetchEventsConfig;
        }

        // Check if this is an array (array of filters)
        if (Array.isArray(rawConfig)) {
            return { filters: rawConfig as NDKFilter[] } as FetchEventsConfig;
        }

        // Check if this looks like a filter object (has filter properties but no 'filters' key)
        const filterProps = ['kinds', 'authors', 'ids', 'since', 'until', 'limit', '#e', '#p', '#a', '#d', '#t', 'search'];
        const hasFilterProp = filterProps.some(prop => prop in rawConfig);

        if (hasFilterProp) {
            return { filters: rawConfig as NDKFilter } as FetchEventsConfig;
        }

        return rawConfig;
    });

    // Extract filters
    const derivedFilters = $derived.by(() => {
        const cfg = derivedConfig;
        if (!cfg?.filters) return undefined;
        return Array.isArray(cfg.filters) ? cfg.filters : [cfg.filters];
    });

    // Extract NDK options
    const derivedNdkOpts = $derived.by(() => {
        const cfg = derivedConfig;
        if (!cfg) return {};

        const { filters, ...ndkOpts } = cfg;
        return ndkOpts as NDKSubscriptionOptions;
    });

    $effect(() => {
        const filters = derivedFilters;
        const ndkOpts = derivedNdkOpts;

        if (!filters) {
            untrack(() => {
                _events.length = 0;
            });
            return;
        }

        // Generate a cache key for this fetch request
        const cacheKey = JSON.stringify({ filters, ...ndkOpts });

        // Check if there's already an in-flight request
        let fetchPromise = inFlightEventRequests.get(cacheKey);

        if (!fetchPromise) {
            // No in-flight request, create a new one
            fetchPromise = ndk.fetchEvents(filters, ndkOpts)
                .then((events) => events as unknown as NDKEvent)
                .finally(() => {
                    inFlightEventRequests.delete(cacheKey);
                });

            inFlightEventRequests.set(cacheKey, fetchPromise);
        }

        // Clear events while loading
        untrack(() => {
            _events.length = 0;
        });

        // Capture key in closure for async callbacks
        const capturedKey = cacheKey;

        fetchPromise
            .then((fetchedEvents) => {
                // Only update if we're still looking at the same config
                untrack(() => {
                    const currentKey = JSON.stringify({ filters: derivedFilters, ...derivedNdkOpts });

                    if (currentKey === capturedKey) {
                        _events.length = 0;
                        _events.push(...Array.from(fetchedEvents as any) as T[]);
                    }
                });
            })
            .catch(() => {
                // Only clear if we're still looking at the same config
                untrack(() => {
                    const currentKey = JSON.stringify({ filters: derivedFilters, ...derivedNdkOpts });

                    if (currentKey === capturedKey) {
                        _events.length = 0;
                    }
                });
            });
    });

    return _events;
}
