import NDK, {
    type NDKEvent,
    type NDKFilter,
    type NDKSubscription,
    type NDKSubscriptionOptions,
} from "@nostr-dev-kit/ndk";
import { NDKSync, type SyncAndSubscribeOptions } from "@nostr-dev-kit/sync";
import type { WoTFilterOptions, WoTRankOptions } from "@nostr-dev-kit/wot";
import type { NDKSvelte } from "./ndk-svelte.svelte.js";

export interface SubscribeConfig {
    /**
     * Nostr filters for the subscription
     */
    filters: NDKFilter | NDKFilter[];
    /**
     * Relay URLs to use for this subscription
     */
    relayUrls?: string[];
    /**
     * NDK subscription options
     */
    pool?: NDKSubscriptionOptions['pool'];
    closeOnEose?: boolean;
    groupable?: boolean;
    groupableDelay?: number;
    cacheUsage?: NDKSubscriptionOptions['cacheUsage'];
    subId?: string;
    maxEventsToReturn?: number;
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
}

export interface SyncSubscribeConfig extends Omit<SubscribeConfig, 'filters'>, SyncAndSubscribeOptions {
    /**
     * Nostr filters for the subscription
     */
    filters: NDKFilter | NDKFilter[];
}

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
    config: () => SubscribeConfig | SyncSubscribeConfig | undefined,
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

    let currentFilters: NDKFilter[];
    let currentNdkOpts: NDKSubscriptionOptions;

    // Derive reactive config
    const derivedConfig = $derived.by(() => config());

    // Extract filters
    const derivedFilters = $derived.by(() => {
        const cfg = derivedConfig;
        if (!cfg?.filters) return [];
        return Array.isArray(cfg.filters) ? cfg.filters : [cfg.filters];
    });

    // Extract NDK subscription options (trigger restart when changed)
    const derivedNdkOpts = $derived.by(() => {
        const cfg = derivedConfig;
        if (!cfg) return {};

        // Filter out our wrapper properties, keep everything else for NDK
        const { filters, noDedupe, dedupeKey, wot, wotRank, ...ndkOpts } = cfg;

        return ndkOpts as NDKSubscriptionOptions;
    });

    // Extract wrapper options (just re-process when changed)
    const derivedWrapperOpts = $derived.by(() => {
        const cfg = derivedConfig;
        if (!cfg) {
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

        console.log('[subscribe.svelte.ts] $effect triggered, filters:', JSON.stringify(newFilters));

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

    function handleEvent(event: NDKEvent) {
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
        updateEvents();
    }

    function updateEvents() {
        const wrapperOpts = derivedWrapperOpts;
        let events = Array.from(eventMap.values());

        // Apply WoT filtering if enabled and WoT store exists
        if (wot) {
            const shouldApplyWoTFilter =
                wrapperOpts.wot !== false && // Not explicitly disabled
                (wrapperOpts.wot || wot.autoFilterEnabled); // Has override config or global filter enabled

            if (shouldApplyWoTFilter && wot.loaded) {
                // Filter by WoT
                events = events.filter((event) => {
                    // Use override config if provided, otherwise use auto-filter logic
                    if (wrapperOpts.wot && typeof wrapperOpts.wot === "object") {
                        // Custom filter options for this subscription
                        const { maxDepth, minScore, includeUnknown = false } = wrapperOpts.wot;
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
            if (wrapperOpts.wotRank && wot.loaded) {
                events = wot.rankEvents(events, wrapperOpts.wotRank) as typeof events;
            }
        }

        // Default sort by created_at descending (newest first) when WoT ranking is not applied
        if (!wot || !wrapperOpts.wotRank || !wot.loaded) {
            events.sort((a, b) => (b.created_at || 0) - (a.created_at || 0));
        }

        _events = events as T[];
    }

    function start() {
        if (subscription) return;

        const result = subscribeMethod(currentFilters, {
            ...currentNdkOpts,
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
        console.log('[subscribe.svelte.ts] Restarting subscription');
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
 */
export function createSubscription<T extends NDKEvent = NDKEvent>(
    ndk: NDKSvelte,
    config: () => SubscribeConfig | undefined,
): Subscription<T> {
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
    config: () => SyncSubscribeConfig | undefined,
): Subscription<T> {
    return createSubscriptionInternal<T>(ndk, config, (filters, subOpts) => {
        // Use NDKSync class for clean, type-safe sync operations
        return NDKSync.syncAndSubscribe(ndk, filters, subOpts);
    });
}
