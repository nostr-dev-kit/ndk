/**
 * Main NDK sync API.
 * Extends NDK with sync() method.
 */

import NDK, {
    type NDKEvent,
    type NDKEventId,
    type NDKFilter,
    type NDKRelay,
    NDKRelaySet,
    NDKSubscriptionCacheUsage,
} from "@nostr-dev-kit/ndk";
import { TIMEOUTS } from "./constants.js";
import { NegentropyStorage } from "./negentropy/storage.js";
import { SyncSession } from "./relay/sync-session.js";
import type { NDKSyncOptions, NDKSyncResult } from "./types.js";

/**
 * Perform NIP-77 sync with relays.
 *
 * @param ndk NDK instance
 * @param filters Filters to sync
 * @param opts Sync options
 * @returns Sync result with events, need, and have sets
 */
export async function ndkSync(
    this: NDK,
    filters: NDKFilter | NDKFilter[],
    opts: NDKSyncOptions = {},
): Promise<NDKSyncResult> {
    // Ensure we have a cache adapter
    if (!this.cacheAdapter) {
        throw new Error("NDK sync requires a cache adapter. Configure NDK with cacheAdapter option.");
    }

    // Normalize filters
    const filterArray = Array.isArray(filters) ? filters : [filters];

    // Determine relay set
    const relaySet = getRelaySet.call(this, opts);
    const relays = Array.from(relaySet.relays);

    // Result accumulators
    const result: NDKSyncResult = {
        events: [],
        need: new Set<NDKEventId>(),
        have: new Set<NDKEventId>(),
    };

    // Sync with each relay in parallel
    const syncPromises = relays.map(async (relay) => {
        // Wait for relay to be ready if not connected
        if (!relay.connected) {
            await new Promise<void>((resolve) => {
                const onReady = () => {
                    relay.off("ready", onReady);
                    resolve();
                };
                relay.once("ready", onReady);

                // Timeout if relay doesn't connect
                setTimeout(() => {
                    relay.off("ready", onReady);
                    resolve();
                }, TIMEOUTS.RELAY_CONNECTION);
            });
        }

        // If still not connected after waiting, skip this relay
        if (!relay.connected) {
            console.warn(`[NDK Sync] Relay ${relay.url} did not connect in time, skipping`);
            return;
        }

        try {
            await syncWithRelay.call(this, relay, filterArray, opts, result);
        } catch (error) {
            // Log detailed error but continue with other relays
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`[NDK Sync] Failed to sync with relay ${relay.url}: ${errorMessage}`);

            // Optionally emit error for debugging
            if (opts.onRelayError) {
                await opts.onRelayError(relay, error instanceof Error ? error : new Error(String(error)));
            }
        }
    });

    // Wait for all syncs to complete
    await Promise.all(syncPromises);

    return result;
}

/**
 * Get the relay set to use for syncing.
 */
function getRelaySet(this: NDK, opts: NDKSyncOptions): NDKRelaySet {
    if (opts.relaySet) {
        return opts.relaySet;
    }

    if (opts.relayUrls) {
        return NDKRelaySet.fromRelayUrls(opts.relayUrls, this);
    }

    // Use all connected relays from the pool
    const poolRelays = this.pool?.relays;
    if (!poolRelays || poolRelays.size === 0) {
        throw new Error("No relays available for sync");
    }

    // Convert Map values to Set
    const relaySet_ = new Set(poolRelays.values());
    return new NDKRelaySet(relaySet_, this);
}

/**
 * Sync with a single relay and accumulate results.
 */
async function syncWithRelay(
    this: NDK,
    relay: NDKRelay,
    filterArray: NDKFilter[],
    opts: NDKSyncOptions,
    result: NDKSyncResult,
): Promise<void> {
    try {
        // Query cache for events matching filters
        const cachedEvents = await queryCache.call(this, filterArray);

        // Build negentropy storage from cached events
        const storage = NegentropyStorage.fromEvents(cachedEvents);

        // Create sync session
        const session = new SyncSession(relay, filterArray, storage, opts);

        // Start sync
        const { need, have } = await session.start();

        // Merge results
        for (const id of need) result.need.add(id);
        for (const id of have) result.have.add(id);

        // Auto-fetch if enabled
        if (opts.autoFetch !== false && need.size > 0) {
            const events = await fetchNeededEvents.call(this, relay, need);
            result.events.push(...events);

            // Save to cache
            if (this.cacheAdapter) {
                await saveFetchedEventsToCache.call(this, events, filterArray, relay);
            }
        }
    } catch (error) {
        // Enhance error context
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Sync failed with relay ${relay.url}: ${errorMessage}`);
    }
}

/**
 * Save fetched events to cache.
 */
async function saveFetchedEventsToCache(
    this: NDK,
    events: NDKEvent[],
    filterArray: NDKFilter[],
    relay: NDKRelay,
): Promise<void> {
    if (!this.cacheAdapter) return;

    for (const event of events) {
        await this.cacheAdapter.setEvent(event, filterArray, relay);
    }
}

/**
 * Query the cache for events matching filters.
 */
async function queryCache(this: NDK, filters: NDKFilter[]): Promise<NDKEvent[]> {
    if (!this.cacheAdapter) return [];

    const events: NDKEvent[] = [];

    return new Promise((resolve) => {
        // Create a temporary subscription to query the cache
        const sub = this.subscribe(filters, {
            cacheUsage: NDKSubscriptionCacheUsage.ONLY_CACHE,
            closeOnEose: true,
            onEvent: (event: NDKEvent) => {
                events.push(event);
            },
            onEose: () => {
                resolve(events);
            },
        });

        // Timeout after configured time
        setTimeout(() => {
            sub.stop();
            resolve(events);
        }, TIMEOUTS.CACHE_QUERY);
    });
}

/**
 * Fetch needed events from a relay.
 */
async function fetchNeededEvents(this: NDK, relay: NDKRelay, need: Set<string>): Promise<NDKEvent[]> {
    const events: NDKEvent[] = [];
    const relaySet = new NDKRelaySet(new Set([relay]), this);

    return new Promise((resolve) => {
        const sub = this.subscribe(
            { ids: Array.from(need) },
            {
                closeOnEose: true,
                relaySet,
                onEvent: (event: NDKEvent) => {
                    events.push(event);
                },
                onEose: () => {
                    resolve(events);
                },
            },
        );

        // Timeout after configured time
        setTimeout(() => {
            sub.stop();
            resolve(events);
        }, TIMEOUTS.EVENT_FETCH);
    });
}
