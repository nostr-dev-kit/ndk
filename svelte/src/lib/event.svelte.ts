import type { NDKEvent, NDKFilter } from "@nostr-dev-kit/ndk";
import type { NDKSvelte } from "./ndk-svelte.svelte";

/**
 * Reactively fetch a single event
 *
 * Returns a reactive proxy to the event that updates when the identifier/filter changes.
 * Use it directly as if it were an NDKEvent - all property access is reactive.
 *
 * @param idOrFilter - Callback returning event ID (bech32), filter, or undefined
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
export function createFetchEvent(
    ndk: NDKSvelte,
    idOrFilter: () => string | NDKFilter | NDKFilter[] | undefined,
) {
    let _event = $state<NDKEvent | undefined>(undefined);

    const derivedIdOrFilter = $derived(idOrFilter());

    $effect(() => {
        const f = derivedIdOrFilter;
        if (!f) {
            _event = undefined;
            return;
        }

        ndk.fetchEvent(f)
            .then((fetchedEvent) => {
                _event = fetchedEvent || undefined;
            })
            .catch(() => {
                _event = undefined;
            });
    });

    // Return a proxy that forwards all access to the reactive _event
    return new Proxy({} as NDKEvent | undefined, {
        get(_target, prop) {
            if (_event && prop in _event) {
                const value = _event[prop as keyof NDKEvent];
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
    });
}

/**
 * Reactively fetch multiple events
 *
 * Returns a reactive array of events that updates when the filters change.
 *
 * @param filters - Callback returning filters or undefined
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
export function createFetchEvents(
    ndk: NDKSvelte,
    filters: () => NDKFilter | NDKFilter[] | undefined,
) {
    let _events = $state<NDKEvent[]>([]);

    const derivedFilters = $derived(filters());

    $effect(() => {
        const f = derivedFilters;
        if (!f) {
            _events = [];
            return;
        }

        ndk.fetchEvents(f)
            .then((fetchedEvents) => {
                _events = Array.from(fetchedEvents);
            })
            .catch(() => {
                _events = [];
            });
    });

    return _events;
}
