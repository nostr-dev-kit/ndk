import NDK, { type NDKEvent, type NDKFilter, type NDKSubscription, type NDKSubscriptionOptions } from "@nostr-dev-kit/ndk";
import type { WoTFilterOptions, WoTRankOptions } from "@nostr-dev-kit/ndk-wot";
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
 *   // Static filters
 *   const notes = createSubscription(ndk, { kinds: [1], limit: 50 });
 *
 *   // Reactive filters - automatically restarts when kind changes
 *   let kind = $state(1);
 *   const reactiveNotes = createSubscription(ndk, () => ({
 *     kinds: [kind],
 *     limit: 50
 *   }));
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
    filters: NDKFilter | NDKFilter[] | (() => NDKFilter | NDKFilter[] | undefined),
    opts: SubscribeOptions = {},
): Subscription<T> {
    // Get WoT store from NDK instance
    const wot = ndk.wot;
    let _events = $state<T[]>([]);
    let _eosed = $state(false);

    const eventMap = new Map<string, T>();
    let subscription: NDKSubscription | undefined;

    const dedupeKey = opts.dedupeKey ?? ((e: NDKEvent) => e.deduplicationKey());

    // Check if filters is a function (reactive)
    const isFilterFunction = typeof filters === "function";
    let currentFilters: NDKFilter[];

    // Set up reactive filters if function provided
    if (isFilterFunction) {
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
    } else {
        // Static filters
        currentFilters = Array.isArray(filters) ? filters : [filters];
        // Auto-start for static filters
        start();
    }

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

        // Call NDK.subscribe() directly to avoid infinite recursion
        // (NDKSvelte.subscribe is shadowed and returns a reactive Subscription instead of NDKSubscription)
        subscription = NDK.prototype.subscribe.call(ndk, currentFilters, {
            ...opts,
            closeOnEose: false,
            onEvent: handleEvent,
            onEose: () => {
                _eosed = true;
            }
        });
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
 * Alias for createSubscription - used internally by NDKSvelte
 */
export const createReactiveSubscription = createSubscription;
