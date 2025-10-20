import type { NDKEvent, NDKFilter, NDKSubscriptionOptions } from "@nostr-dev-kit/ndk";
import type { NDKSvelte } from "./ndk-svelte.svelte";
import { validateCallback } from "./utils/validate-callback.js";

export interface FetchEventOptions {
    /**
     * Whether to wrap events in kind-specific classes.
     * @default true
     */
    wrap?: boolean;
}

/**
 * Reactively fetch a single event
 *
 * Returns a reactive proxy to the event that updates when the identifier/filter changes.
 * Use it directly as if it were an NDKEvent - all property access is reactive.
 *
 * **Event Wrapping (Default: Enabled)**
 * - Events are automatically wrapped in their kind-specific classes (e.g., NDKArticle for kind 30023)
 * - Invalid events that fail wrapper validation are silently dropped, returning undefined
 * - This protects your app from receiving malformed events
 * - To disable wrapping, pass `{ wrap: false }` as the second argument
 *
 * @param idOrFilter - Callback returning event ID (bech32), filter, or undefined
 * @param options - Optional fetch options. Use `{ wrap: false }` to disable automatic wrapping and validation
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   // Fetch by event ID (bech32 format)
 *   const eventId = $derived($page.params.id);
 *   const event = ndk.$fetchEvent(() => eventId); // "note1..." or "nevent1..."
 * </script>
 *
 * {#if event}
 *   <div>{event.content}</div>
 * {/if}
 * ```
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import type { NDKArticle } from "@nostr-dev-kit/ndk";
 *
 *   // Type the result as NDKArticle to access article-specific properties
 *   const article = ndk.$fetchEvent<NDKArticle>(() => naddr);
 * </script>
 *
 * {#if article}
 *   <h1>{article.title}</h1>
 *   <div>{article.content}</div>
 * {/if}
 * ```
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   // Disable automatic wrapping
 *   const event = ndk.$fetchEvent(() => eventId, { wrap: false });
 * </script>
 * ```
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   // Fetch by filter
 *   const event = ndk.$fetchEvent(() => ({
 *     kinds: [0],
 *     authors: [pubkey],
 *     limit: 1
 *   }));
 * </script>
 * ```
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   // Conditional fetch - return undefined to prevent fetching
 *   const event = ndk.$fetchEvent(() => {
 *     if (!eventId) return undefined;
 *     return eventId; // or return { ids: [eventId] }
 *   });
 * </script>
 * ```
 */
export function createFetchEvent<T extends NDKEvent = NDKEvent>(
    ndk: NDKSvelte,
    idOrFilter: () => string | NDKFilter | NDKFilter[] | undefined,
    options?: FetchEventOptions,
): T | undefined {
    validateCallback(idOrFilter, '$fetchEvent', 'idOrFilter');
    let _event = $state<T | undefined>(undefined);

    const derivedIdOrFilter = $derived(idOrFilter());

    const wrap = options?.wrap ?? true;

    $effect(() => {
        const f = derivedIdOrFilter;
        if (!f) {
            _event = undefined;
            return;
        }

        ndk.fetchEvent(f, { wrap })
            .then((fetchedEvent) => {
                _event = (fetchedEvent as T) || undefined;
            })
            .catch(() => {
                _event = undefined;
            });
    });

    // Return a proxy that forwards all access to the reactive _event
    return new Proxy({} as T | undefined, {
        get(_target, prop) {
            if (_event && prop in _event) {
                const value = _event[prop as keyof T];
                return typeof value === "function" ? value.bind(_event) : value;
            }
            return undefined;
        },
        has(_target, prop) {
            return _event ? prop in _event : false;
        },
        ownKeys() {
            return _event ? Reflect.ownKeys(_event) : [];
        },
        getOwnPropertyDescriptor(_target, prop) {
            return _event ? Reflect.getOwnPropertyDescriptor(_event, prop) : undefined;
        },
    }) as T | undefined;
}

/**
 * Reactively fetch multiple events
 *
 * Returns a reactive array of events that updates when the filters change.
 *
 * **Event Wrapping (Default: Enabled)**
 * - Events are automatically wrapped in their kind-specific classes (e.g., NDKArticle for kind 30023)
 * - Invalid events that fail wrapper validation are silently dropped from the results
 * - This protects your app from receiving malformed events
 * - To disable wrapping, pass `{ wrap: false }` as the second argument
 *
 * @param filters - Callback returning filters or undefined
 * @param options - Optional fetch options. Use `{ wrap: false }` to disable automatic wrapping and validation
 *
 * @example
 * ```svelte
 * <script lang="ts">
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
 *   import type { NDKArticle } from "@nostr-dev-kit/ndk";
 *
 *   // Type the result as NDKArticle[] to access article-specific properties
 *   const articles = ndk.$fetchEvents<NDKArticle>(() => ({
 *     kinds: [30023],
 *     authors: [pubkey],
 *     limit: 10
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
 *   // Disable automatic wrapping
 *   const events = ndk.$fetchEvents(() => ({ kinds: [1] }), { wrap: false });
 * </script>
 * ```
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   // Conditional fetch - return undefined to prevent fetching
 *   const events = ndk.$fetchEvents(() => {
 *     if (!shouldFetch) return undefined;
 *     return [
 *       { kinds: [1], authors: [pubkey1] },
 *       { kinds: [1], authors: [pubkey2] }
 *     ];
 *   });
 * </script>
 * ```
 */
export function createFetchEvents<T extends NDKEvent = NDKEvent>(
    ndk: NDKSvelte,
    filters: () => NDKFilter | NDKFilter[] | undefined,
    options?: FetchEventOptions,
): T[] {
    validateCallback(filters, '$fetchEvents', 'filters');
    let _events = $state<T[]>([]);

    const derivedFilters = $derived(filters());

    const wrap = options?.wrap ?? true;

    $effect(() => {
        const f = derivedFilters;
        if (!f) {
            _events = [];
            return;
        }

        ndk.fetchEvents(f, { wrap })
            .then((fetchedEvents) => {
                _events = Array.from(fetchedEvents) as T[];
            })
            .catch(() => {
                _events = [];
            });
    });

    return _events;
}
