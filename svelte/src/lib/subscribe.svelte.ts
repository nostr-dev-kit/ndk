import NDK, {
    type NDKEvent,
    type NDKFilter,
    type NDKSubscription,
    type NDKSubscriptionOptions,
} from "@nostr-dev-kit/ndk";
import { NDKSync, type SyncAndSubscribeOptions } from "@nostr-dev-kit/sync";
import type { WoTFilterOptions, WoTRankOptions } from "@nostr-dev-kit/wot";
import type { NDKSvelte } from "./ndk-svelte.svelte.js";
import { validateCallback } from "./utils/validate-callback.js";

export type SubscribeConfig = {
    /**
     * Nostr filters for the subscription
     */
    filters: NDKFilter | NDKFilter[];
    /**
     * Disable automatic de-duplication
     */
    noDedupe?: boolean;
    /**
     * Custom dedupe key function
     */
    dedupeKey?: (event: NDKEvent) => string;
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
} & NDKSubscriptionOptions;

export type SyncSubscribeConfig = {
    /**
     * Nostr filters for the subscription
     */
    filters: NDKFilter | NDKFilter[];
    /**
     * Disable automatic de-duplication
     */
    noDedupe?: boolean;
    /**
     * Custom dedupe key function
     */
    dedupeKey?: (event: NDKEvent) => string;
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
} & NDKSubscriptionOptions & SyncAndSubscribeOptions;

export interface Subscription<T extends NDKEvent = NDKEvent> {
    // Reactive reads
    get events(): T[];
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
    config: () => SubscribeConfig | SyncSubscribeConfig | NDKFilter | NDKFilter[] | undefined,
    subscribeMethod: (filters: NDKFilter[], opts: NDKSubscriptionOptions) => NDKSubscription | Promise<NDKSubscription>,
): Subscription<T> {
    let _events = $state<T[]>([]);
    let _eosed = $state(false);

    const eventMap = new Map<string, T>();
    let subscription: NDKSubscription | undefined;

    let currentFilters: NDKFilter[];
    let currentNdkOpts: NDKSubscriptionOptions;

    // Derive reactive config
    const derivedConfig = $derived.by(() => {
        const rawConfig = config();
        if (!rawConfig) return rawConfig;

        // If config has 'filters' property, use it as-is
        if ('filters' in rawConfig) {
            return rawConfig;
        }

        // Check if this is an array (array of filters)
        if (Array.isArray(rawConfig)) {
            // This is an array of filters, wrap it
            return { filters: rawConfig as NDKFilter[] } as SubscribeConfig;
        }

        // Check if this looks like a filter object (has filter properties but no 'filters' key)
        // Common filter properties: kinds, authors, ids, since, until, limit, etc.
        const filterProps = ['kinds', 'authors', 'ids', 'since', 'until', 'limit', '#e', '#p', '#a', '#d', '#t', 'search'];
        const hasFilterProp = filterProps.some(prop => prop in rawConfig);

        if (hasFilterProp) {
            // This is a filter object, wrap it in a filters property
            return { filters: rawConfig as NDKFilter } as SubscribeConfig;
        }

        // Return as-is (might be undefined or malformed)
        return rawConfig;
    });

    // Extract filters
    const derivedFilters = $derived.by(() => {
        const cfg = derivedConfig;
        if (!cfg) return [];
        if (!('filters' in cfg)) return [];
        return Array.isArray(cfg.filters) ? cfg.filters : [cfg.filters];
    });

    // Extract NDK subscription options (trigger restart when changed)
    const derivedNdkOpts = $derived.by(() => {
        const cfg = derivedConfig;
        if (!cfg || !('filters' in cfg)) return {};

        // Filter out our wrapper properties, keep everything else for NDK
        const { filters, noDedupe, dedupeKey, wot, wotRank, ...ndkOpts } = cfg;

        return ndkOpts as NDKSubscriptionOptions;
    });

    // Extract wrapper options (just re-process when changed)
    const derivedWrapperOpts = $derived.by(() => {
        const cfg = derivedConfig;
        if (!cfg || !('filters' in cfg)) {
            return {
                noDedupe: undefined,
                dedupeKey: undefined,
                wot: undefined,
                wotRank: undefined,
            };
        }
        return {
            noDedupe: cfg.noDedupe,
            dedupeKey: cfg.dedupeKey,
            wot: cfg.wot,
            wotRank: cfg.wotRank,
        };
    });

    const dedupeKey = $derived.by(() => {
        return derivedWrapperOpts.dedupeKey ?? ((e: NDKEvent) => e.deduplicationKey());
    });

    // Restart subscription when filters or NDK options change
    $effect(() => {
        const newFilters = derivedFilters;
        const newNdkOpts = derivedNdkOpts;

        if (newFilters.length === 0) {
            stop();
            return;
        }

        currentFilters = newFilters;
        currentNdkOpts = newNdkOpts;
        restart();
    });

    // Re-process events when wrapper options change (no restart needed)
    $effect(() => {
        derivedWrapperOpts;
        updateEvents();
    });

    // Throttle updateEvents to batch relay event processing
    let throttleTimer: ReturnType<typeof setTimeout> | undefined;
    let lastUpdateTime = 0;
    let relayEventsSinceLastUpdate = 0;
    let totalRelayEvents = 0;

    function handleEvent(event: NDKEvent) {
        totalRelayEvents++;
        relayEventsSinceLastUpdate++;

        const wrapperOpts = derivedWrapperOpts;
        const key = dedupeKey(event as T);

        // Skip if we already have this event (unless noDedupe)
        if (!wrapperOpts.noDedupe && eventMap.has(key)) {
            const existing = eventMap.get(key);
            if (existing) {
                // Keep the newer one (default to 0 if created_at is missing)
                const existingTime = existing.created_at || 0;
                const newTime = event.created_at || 0;
                if (existingTime >= newTime) {
                    return;
                }
            }
        }

        eventMap.set(key, event as T);

        // Throttle updateEvents to batch multiple rapid relay events
        // Update at most once per 16ms (~1 frame at 60fps)
        const now = Date.now();
        const timeSinceLastUpdate = now - lastUpdateTime;

        if (timeSinceLastUpdate >= 16) {
            // Enough time has passed, update immediately
            lastUpdateTime = now;
            relayEventsSinceLastUpdate = 0;
            updateEvents();
        } else if (throttleTimer === undefined) {
            // Schedule an update for the next throttle window
            const delay = 16 - timeSinceLastUpdate;
            throttleTimer = setTimeout(() => {
                throttleTimer = undefined;
                lastUpdateTime = Date.now();
                relayEventsSinceLastUpdate = 0;
                updateEvents();
            }, delay);
        }
        // Else: timer already scheduled, just accumulate events
    }

    function updateEvents() {
        const wrapperOpts = derivedWrapperOpts;
        let events = Array.from(eventMap.values());
        let wotSorted = false;

        // Apply WoT filtering if enabled and WoT store exists
        if (ndk.$wot && ndk.$wot.loaded) {
            const shouldApplyWoTFilter =
                wrapperOpts.wot !== false && // Not explicitly disabled
                (wrapperOpts.wot || ndk.$wot.autoFilterEnabled); // Has override config or global filter enabled

            if (shouldApplyWoTFilter) {
                // Filter by WoT
                events = events.filter((event) => {
                    // Use override config if provided, otherwise use auto-filter logic
                    if (wrapperOpts.wot && typeof wrapperOpts.wot === "object") {
                        // Custom filter options for this subscription
                        const { maxDepth, minScore, includeUnknown = false } = wrapperOpts.wot;
                        const inWoT = ndk.$wot!.includes(event.pubkey, { maxDepth });

                        if (!inWoT) {
                            return includeUnknown;
                        }

                        if (minScore !== undefined) {
                            const score = ndk.$wot!.getScore(event.pubkey);
                            return score >= minScore;
                        }

                        return true;
                    } else {
                        // Use global auto-filter
                        return !ndk.$wot!.shouldFilterEvent(event);
                    }
                });
            }

            // Apply WoT ranking if specified
            if (wrapperOpts.wotRank) {
                events = ndk.$wot!.rankEvents(events, wrapperOpts.wotRank) as typeof events;
                wotSorted = true;
            }
        }

        // Default sort by created_at descending (newest first) when WoT ranking is not applied
        if (!wotSorted) events.sort((a, b) => (b.created_at || 0) - (a.created_at || 0));

        _events = events as T[];
    }

    function start() {
        if (subscription) return;

        const result = subscribeMethod(currentFilters, {
            ...currentNdkOpts,
            closeOnEose: false,
            onEvents: (cachedEvents) => {
                // Batch process all cached events at once
                for (const event of cachedEvents) {
                    const wrapperOpts = derivedWrapperOpts;
                    const key = dedupeKey(event as T);

                    // Skip if we already have this event (unless noDedupe)
                    if (!wrapperOpts.noDedupe && eventMap.has(key)) {
                        const existing = eventMap.get(key);
                        if (existing) {
                            // Keep the newer one (default to 0 if created_at is missing)
                            const existingTime = existing.created_at || 0;
                            const newTime = event.created_at || 0;
                            if (existingTime >= newTime) {
                                continue;
                            }
                        }
                    }

                    eventMap.set(key, event as T);
                }

                // Call updateEvents ONCE for all cached events
                updateEvents();
            },
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
        if (throttleTimer !== undefined) {
            clearTimeout(throttleTimer);
            throttleTimer = undefined;
        }
    }

    let isRestarting = false;

    function restart() {
        if (isRestarting) {
            return;
        }
        isRestarting = true;

        stop();
        eventMap.clear();
        _events = [];
        _eosed = false;
        relayEventsSinceLastUpdate = 0;
        lastUpdateTime = 0;
        start();

        // Reset flag on next microtask to batch synchronous calls
        queueMicrotask(() => {
            isRestarting = false;
        });
    }

    function clear() {
        if (throttleTimer !== undefined) {
            clearTimeout(throttleTimer);
            throttleTimer = undefined;
        }
        eventMap.clear();
        _events = [];
        _eosed = false;
        relayEventsSinceLastUpdate = 0;
        lastUpdateTime = 0;
    }

    return {
        get events() {
            return _events;
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
 * All config properties are reactive - subscription automatically restarts when filters
 * or NDK options (relayUrls, pool, etc.) change, and re-processes events when wrapper
 * options (wot, etc.) change.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { createSubscription } from '@nostr-dev-kit/svelte';
 *
 *   // Reactive config - automatically restarts when kind or relays change
 *   let kind = $state(1);
 *   let selectedRelays = $state(['wss://relay.damus.io']);
 *
 *   const notes = createSubscription(ndk, () => ({
 *     filters: [{ kinds: [kind], limit: 50 }],
 *     relayUrls: selectedRelays
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
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   // Conditional subscription - return undefined to prevent subscription
 *   let selectedRelay = $state<string | undefined>();
 *   let isEnabled = $state(false);
 *
 *   const notes = createSubscription(ndk, () => {
 *     // No subscription until both conditions are met
 *     if (!selectedRelay || !isEnabled) return undefined;
 *
 *     return {
 *       filters: [{ kinds: [1], limit: 20 }],
 *       relayUrls: [selectedRelay]
 *     };
 *   });
 * </script>
 * ```
 */
export function createSubscription<T extends NDKEvent = NDKEvent>(
    ndk: NDKSvelte,
    config: () => SubscribeConfig | NDKFilter | NDKFilter[] | undefined,
): Subscription<T> {
    validateCallback(config, '$subscribe', 'config');
    return createSubscriptionInternal<T>(ndk, config, (filters, subOpts) => {
        return ndk.subscribe(filters, subOpts);
    });
}

/**
 * Create a reactive Nostr subscription with Negentropy sync
 *
 * This combines efficient syncing with live subscriptions to ensure complete event coverage
 * without missing any events during the sync process.
 *
 * Returns an object with reactive getters that work in templates and $effect.
 * Events are automatically deduplicated and sorted by created_at (newest first).
 *
 * All config properties are reactive - subscription automatically restarts when filters
 * or NDK options change, and re-processes events when wrapper options change.
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
 *   // Reactive config with sync callbacks
 *   const notes = createSyncSubscription(ndk, () => ({
 *     filters: [{ kinds: [1], limit: 50 }],
 *     onRelaySynced: (relay, count) => {
 *       console.log(`Synced ${count} events from ${relay.url}`);
 *     },
 *     onSyncComplete: () => {
 *       console.log('All relays synced!');
 *     }
 *   }));
 *
 *   // Reactive - automatically restarts when kind or relays change
 *   let kind = $state(1);
 *   let selectedRelays = $state(['wss://relay.damus.io']);
 *
 *   const reactiveNotes = createSyncSubscription(ndk, () => ({
 *     filters: [{ kinds: [kind] }],
 *     relayUrls: selectedRelays
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
    config: () => SyncSubscribeConfig | NDKFilter | NDKFilter[] | undefined,
): Subscription<T> {
    validateCallback(config, '$syncSubscribe', 'config');
    return createSubscriptionInternal<T>(ndk, config, (filters, subOpts) => {
        // Use NDKSync class for clean, type-safe sync operations
        return NDKSync.syncAndSubscribe(ndk, filters, subOpts);
    });
}
