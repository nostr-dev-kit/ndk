import NDK, {
    type NDKEvent,
    type NDKFilter,
    type NDKSubscription,
    type NDKSubscriptionOptions,
} from "@nostr-dev-kit/ndk";
import { NDKSync, type SyncAndSubscribeOptions } from "@nostr-dev-kit/sync";
import type { WoTFilterOptions, WoTRankOptions } from "@nostr-dev-kit/wot";
import type { NDKSvelte } from "./ndk-svelte.svelte.js";

export interface SubscribeOptions extends NDKSubscriptionOptions {
    /**
     * Disable automatic de-duplication
     */
    noDedupe?: boolean;
    /**
     * Custom dedupe key function
     */
    dedupeKey?: (event: NDKEvent) => string;
    /**
     * Transform events before storing
     */
    transform?: <T extends NDKEvent>(event: NDKEvent) => T;
    /**
     * Web of Trust filtering
     * - false: Disable WoT filtering even if globally enabled
     * - WoTFilterOptions: Override global WoT settings
     */
    wot?: false | WoTFilterOptions;
    /**
     * Web of Trust ranking (applied after filtering)
     */
    wotRank?: WoTRankOptions;
}

export interface SyncSubscribeOptions extends SubscribeOptions, SyncAndSubscribeOptions {}

export interface Subscription<T extends NDKEvent = NDKEvent> {
    // Reactive reads
    get events(): T[];
    get latest(): T | undefined;
    get count(): number;
    get eosed(): boolean;

    // Methods
    start(): void;
    stop(): void;
    clear(): void;
}

/**
 * Internal shared subscription implementation
 */
function createSubscriptionInternal<T extends NDKEvent = NDKEvent>(
    ndk: NDKSvelte,
    filters: () => NDKFilter | NDKFilter[] | undefined,
    opts: SubscribeOptions,
    subscribeMethod: (
        filters: NDKFilter[],
        opts: NDKSubscriptionOptions,
    ) => NDKSubscription | Promise<NDKSubscription>,
): Subscription<T> {
    // Get WoT store from NDK instance
    const wot = ndk.$wot;
    let _events = $state<T[]>([]);
    let _eosed = $state(false);

    const eventMap = new Map<string, T>();
    let subscription: NDKSubscription | undefined;

    const dedupeKey = opts.dedupeKey ?? ((e: NDKEvent) => e.deduplicationKey());

    let currentFilters: NDKFilter[];

    // Set up reactive filters
    const derivedFilters = $derived.by(() => {
        const result = filters();
        if (!result) return [];
        return Array.isArray(result) ? result : [result];
    });

    $effect(() => {
        const newFilters = derivedFilters;
        if (newFilters.length === 0) {
            stop();
            return;
        }

        currentFilters = newFilters;
        restart();
    });

    function handleEvent(event: NDKEvent) {
        const transformed = opts.transform ? opts.transform<T>(event) : (event as T);
        const key = dedupeKey(transformed);

        // Skip if we already have this event (unless noDedupe)
        if (!opts.noDedupe && eventMap.has(key)) {
            const existing = eventMap.get(key);
            if (existing) {
                // Keep the newer one (default to 0 if created_at is missing)
                const existingTime = existing.created_at || 0;
                const newTime = transformed.created_at || 0;
                if (existingTime >= newTime) {
                    return;
                }
            }
        }

        eventMap.set(key, transformed);
        updateEvents();
    }

    function updateEvents() {
        let events = Array.from(eventMap.values());

        // Apply WoT filtering if enabled
        const shouldApplyWoTFilter =
            opts.wot !== false && // Not explicitly disabled
            (opts.wot || wot.autoFilterEnabled); // Has override config or global filter enabled

        if (shouldApplyWoTFilter && wot.loaded) {
            // Filter by WoT
            events = events.filter((event) => {
                // Use override config if provided, otherwise use auto-filter logic
                if (opts.wot && typeof opts.wot === "object") {
                    // Custom filter options for this subscription
                    const { maxDepth, minScore, includeUnknown = false } = opts.wot;
                    const inWoT = wot.includes(event.pubkey, { maxDepth });

                    if (!inWoT) {
                        return includeUnknown;
                    }

                    if (minScore !== undefined) {
                        const score = wot.getScore(event.pubkey);
                        return score >= minScore;
                    }

                    return true;
                } else {
                    // Use global auto-filter
                    return !wot.shouldFilterEvent(event);
                }
            });
        }

        // Apply WoT ranking if specified
        if (opts.wotRank && wot.loaded) {
            events = wot.rankEvents(events, opts.wotRank) as typeof events;
        } else {
            // Default sort by created_at descending (newest first)
            events.sort((a, b) => (b.created_at || 0) - (a.created_at || 0));
        }

        _events = events as T[];
    }

    function start() {
        if (subscription) return;

        const result = subscribeMethod(currentFilters, {
            ...opts,
            closeOnEose: false,
            onEvent: handleEvent,
            onEose: () => {
                _eosed = true;
            },
        });

        if (result instanceof Promise) {
            result
                .then((sub) => {
                    subscription = sub;
                })
                .catch((error) => {
                    console.error("[createSubscription] Failed to start subscription:", error);
                });
        } else {
            subscription = result;
        }
    }

    function stop() {
        subscription?.stop();
        subscription = undefined;
    }

    function restart() {
        stop();
        eventMap.clear();
        _events = [];
        _eosed = false;
        start();
    }

    function clear() {
        eventMap.clear();
        _events = [];
        _eosed = false;
    }

    return {
        get events() {
            return _events;
        },
        get latest() {
            return _events[0];
        },
        get count() {
            return _events.length;
        },
        get eosed() {
            return _eosed;
        },
        start,
        stop,
        clear,
    };
}

/**
 * Create a reactive Nostr subscription
 *
 * Returns an object with reactive getters that work in templates and $effect.
 * Events are automatically deduplicated and sorted by created_at (newest first).
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { createSubscription } from '@nostr-dev-kit/svelte';
 *
 *   // Reactive filters - automatically restarts when kind changes
 *   let kind = $state(1);
 *   const notes = createSubscription(ndk, () => ({
 *     kinds: [kind],
 *     limit: 50
 *   }));
 *
 *   // Static filters - wrap in function
 *   const staticNotes = createSubscription(ndk, () => ({ kinds: [1], limit: 50 }));
 *
 *   $effect(() => {
 *     console.log('New notes:', notes.count);
 *   });
 * </script>
 *
 * {#each notes.events as note}
 *   <div>{note.content}</div>
 * {/each}
 * ```
 */
export function createSubscription<T extends NDKEvent = NDKEvent>(
    ndk: NDKSvelte,
    filters: () => NDKFilter | NDKFilter[] | undefined,
    opts: SubscribeOptions = {},
): Subscription<T> {
    return createSubscriptionInternal<T>(ndk, filters, opts, (filters, subOpts) => {
        // Call NDK.subscribe() directly to avoid infinite recursion
        // (NDKSvelte.subscribe is shadowed and returns a reactive Subscription instead of NDKSubscription)
        return NDK.prototype.subscribe.call(ndk, filters, subOpts);
    });
}

/**
 * Alias for createSubscription - used internally by NDKSvelte
 */
export const createReactiveSubscription = createSubscription;

/**
 * Create a reactive Nostr subscription with Negentropy sync
 *
 * This combines efficient syncing with live subscriptions to ensure complete event coverage
 * without missing any events during the sync process.
 *
 * Returns an object with reactive getters that work in templates and $effect.
 * Events are automatically deduplicated and sorted by created_at (newest first).
 *
 * The function:
 * 1. Immediately starts a live subscription to catch new events
 * 2. Returns the reactive subscription right away (non-blocking)
 * 3. In the background, syncs historical events from each relay using Negentropy
 * 4. All synced events automatically appear in the reactive state
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { createSyncSubscription } from '@nostr-dev-kit/svelte';
 *
 *   // Reactive filters with sync
 *   const notes = createSyncSubscription(ndk, () => ({ kinds: [1], limit: 50 }), {
 *     onRelaySynced: (relay, count) => {
 *       console.log(`Synced ${count} events from ${relay.url}`);
 *     },
 *     onSyncComplete: () => {
 *       console.log('All relays synced!');
 *     }
 *   });
 *
 *   // Reactive filters - automatically restarts when kind changes
 *   let kind = $state(1);
 *   const reactiveNotes = createSyncSubscription(ndk, () => ({
 *     kinds: [kind],
 *     limit: 50
 *   }));
 *
 *   $effect(() => {
 *     console.log('Total notes:', notes.count, 'EOSED:', notes.eosed);
 *   });
 * </script>
 *
 * {#each notes.events as note}
 *   <div>{note.content}</div>
 * {/each}
 * ```
 */
export function createSyncSubscription<T extends NDKEvent = NDKEvent>(
    ndk: NDKSvelte,
    filters: () => NDKFilter | NDKFilter[] | undefined,
    opts: SyncSubscribeOptions = {},
): Subscription<T> {
    return createSubscriptionInternal<T>(ndk, filters, opts, (filters, subOpts) => {
        // Use NDKSync class for clean, type-safe sync operations
        return NDKSync.syncAndSubscribe(ndk, filters, subOpts);
    });
}
