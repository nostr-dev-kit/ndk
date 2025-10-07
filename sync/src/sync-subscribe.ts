/**
 * Hybrid sync + subscribe functionality.
 *
 * Combines efficient syncing with live subscriptions to ensure complete event coverage
 * without missing any events during the sync process.
 */

import NDK, {
    type NDKFilter,
    type NDKRelay,
    NDKRelaySet,
    type NDKSubscription,
    type NDKSubscriptionOptions,
} from "@nostr-dev-kit/ndk";
import { TIMEOUTS } from "./constants.js";
import { ndkSync } from "./ndk-sync.js";

export interface SyncAndSubscribeOptions extends NDKSubscriptionOptions {
    /**
     * Called after each relay is synced
     */
    onRelaySynced?: (relay: NDKRelay, eventCount: number) => void;

    /**
     * Called when all relays have been synced
     */
    onSyncComplete?: () => void;

    /**
     * Relay set or URLs to use (optional, uses default NDK relays if not provided)
     */
    relaySet?: NDKRelaySet;
    relayUrls?: string[];
}

/**
 * Subscribe and sync - ensures complete event coverage without missing events.
 *
 * This function:
 * 1. Immediately starts a live subscription with limit: 0 to catch new events
 * 2. Returns the subscription right away (non-blocking)
 * 3. In the background, sequentially syncs historical events from each relay:
 *    - Uses Negentropy sync where available (efficient)
 *    - Falls back to fetchEvents for relays without Negentropy
 * 4. All synced events automatically flow to the subscription
 *
 * @param filters - NDK filter(s) to sync and subscribe to
 * @param opts - Subscription options with sync callbacks
 * @returns NDKSubscription that receives both live and historical events
 *
 * @example
 * ```typescript
 * const sub = await syncAndSubscribe.call(ndk,
 *   { kinds: [1], authors: [pubkey] },
 *   {
 *     onEvent: (event) => console.log('Event:', event.content),
 *     onRelaySynced: (relay, count) => {
 *       console.log(`Synced ${count} events from ${relay.url}`);
 *     },
 *     onSyncComplete: () => {
 *       console.log('All relays synced!');
 *     }
 *   }
 * );
 *
 * // Subscription is already receiving events
 * // Background sync continues...
 * ```
 */
export async function syncAndSubscribe(
    this: NDK,
    filters: NDKFilter | NDKFilter[],
    opts: SyncAndSubscribeOptions = {},
): Promise<NDKSubscription> {
    // Ensure we have a cache adapter for syncing
    if (!this.cacheAdapter) {
        console.warn("[syncAndSubscribe] No cache adapter - sync will not work, using subscription only");
    }

    const filterArray = Array.isArray(filters) ? filters : [filters];

    // Determine relay set
    const relaySet = opts.relaySet || (opts.relayUrls ? NDKRelaySet.fromRelayUrls(opts.relayUrls, this) : undefined);

    const relays = relaySet ? Array.from(relaySet.relays) : Array.from(this.pool?.relays?.values() || []);

    if (relays.length === 0) {
        throw new Error("No relays available for syncAndSubscribe");
    }

    // 1. Start live subscription with limit: 0
    // This catches all NEW events from now on
    const subFilters = filterArray.map((f) => ({
        ...f,
        limit: 0,
    }));

    const sub = this.subscribe(subFilters, {
        ...opts,
        relaySet,
        closeOnEose: false,
    });

    // 2. Background: sync historical events from each relay
    if (this.cacheAdapter) {
        // Track completion across all relays
        let completedCount = 0;
        const totalRelays = relays.length;

        const syncWithRelay = async (relay: NDKRelay) => {
            try {
                // Try Negentropy sync first
                const result = await ndkSync.call(this, filterArray, {
                    relaySet: new NDKRelaySet(new Set([relay]), this),
                    autoFetch: true, // Fetched events automatically route to subscription
                });

                opts.onRelaySynced?.(relay, result.events.length);
            } catch (_error) {
                // Relay doesn't support Negentropy - fallback to fetchEvents
                try {
                    const events = await this.fetchEvents(filterArray, {
                        relaySet: new NDKRelaySet(new Set([relay]), this),
                        subId: 'sync-fetch-fallback',
                        groupable: false
                    });

                    opts.onRelaySynced?.(relay, events.size);
                } catch (fetchError) {
                    console.error(`[syncAndSubscribe] Failed to sync/fetch from ${relay.url}:`, fetchError);
                }
            } finally {
                completedCount++;
                if (completedCount === totalRelays) {
                    opts.onSyncComplete?.();
                }
            }
        };

        // Start sync for each relay (don't wait sequentially)
        for (const relay of relays) {
            if (relay.connected) {
                // Relay is connected, sync immediately
                syncWithRelay(relay);
            } else {
                // Relay not connected yet, wait for it to come online
                let completed = false;
                const onReady = () => {
                    if (completed) return;
                    completed = true;
                    relay.off("ready", onReady);
                    syncWithRelay(relay);
                };
                relay.once("ready", onReady);

                // Also handle case where relay never connects
                setTimeout(() => {
                    if (completed) return;
                    completed = true;
                    relay.off("ready", onReady);
                    completedCount++;
                    if (completedCount === totalRelays) {
                        opts.onSyncComplete?.();
                    }
                }, TIMEOUTS.RELAY_CONNECTION);
            }
        }
    } else {
        // No cache adapter - can't sync, just use the subscription
        // Call onSyncComplete immediately since there's no sync to do
        setTimeout(() => opts.onSyncComplete?.(), 0);
    }

    // 3. Return subscription immediately (non-blocking)
    return sub;
}
