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
     * Called once a relay's historical events have been synced, either through
     * Negentropy or through the `fetchEvents` fallback.
     */
    onRelaySynced?: (relay: NDKRelay, eventCount: number) => void;

    /**
     * Called when every relay has finished its sync attempt (successfully or not).
     */
    onSyncComplete?: () => void;

    /**
     * Called when a relay could not be synced at all: Negentropy was unavailable or
     * the negotiation failed, and the `fetchEvents` fallback failed too.
     * Negotiation failures that are recovered by the fallback are not reported here;
     * each relay ends with exactly one of `onRelaySynced` or `onRelayError`.
     */
    onRelayError?: (relay: NDKRelay, error: Error) => void | Promise<void>;

    /**
     * Called during negentropy sync negotiation to provide real-time progress updates.
     * Provides visibility into the sync rounds and event discovery process.
     *
     * @param relay - The relay currently being synced
     * @param progress - Current negotiation progress information
     *
     * @example
     * ```typescript
     * const sub = await syncAndSubscribe.call(ndk, filters, {
     *   onNegotiationProgress: (relay, progress) => {
     *     console.log(`${relay.url}: Round ${progress.round}, ${progress.phase}`);
     *     console.log(`  Need: ${progress.needCount}, Have: ${progress.haveCount}`);
     *   }
     * });
     * ```
     */
    onNegotiationProgress?: (
        relay: NDKRelay,
        progress: import("./types.js").NegotiationProgress,
    ) => void | Promise<void>;

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

        // Consumer callbacks run outside the try/catch blocks that classify the sync outcome, so an
        // exception thrown by the consumer is never mistaken for a negotiation or fetch failure.
        // Such exceptions are logged and otherwise ignored (syncWithRelay is not awaited by anyone).
        const invokeCallback = (name: string, relay: NDKRelay | undefined, fn: () => void | Promise<void>) =>
            Promise.resolve()
                .then(fn)
                .catch((error) => {
                    console.error(
                        `[syncAndSubscribe] ${name} callback threw${relay ? ` for ${relay.url}` : ""}:`,
                        error,
                    );
                });

        const syncWithRelay = async (relay: NDKRelay) => {
            let outcome: { synced: number } | { failed: Error } | undefined;
            let negotiationError: Error | undefined;

            // Try Negentropy sync first.
            // ndkSync() does not reject when a single relay fails to negotiate (NOTICE, NEG-ERR,
            // timeout); it reports the failure through onRelayError and resolves with an empty
            // result. Track it so we fall back instead of reporting an empty sync as success.
            try {
                const result = await ndkSync.call(this, filterArray, {
                    relaySet: new NDKRelaySet(new Set([relay]), this),
                    autoFetch: true, // Fetched events automatically route to subscription
                    onNegotiationProgress: opts.onNegotiationProgress,
                    onRelayError: (_relay, error) => {
                        negotiationError = error;
                    },
                });
                if (!negotiationError) outcome = { synced: result.events.length };
            } catch (error) {
                negotiationError = error instanceof Error ? error : new Error(String(error));
            }

            // Relay doesn't support Negentropy (or negotiation failed) - fallback to fetchEvents.
            // Same guardrail exemption as NDKSync.syncSingleRelay(): this is the intended use of fetchEvents.
            if (!outcome) {
                try {
                    const events = await this.guardrailOff("fetch-events-usage").fetchEvents(filterArray, {
                        relaySet: new NDKRelaySet(new Set([relay]), this),
                        subId: "sync-fetch-fallback",
                        groupable: false,
                    });
                    outcome = { synced: events.size };
                } catch (fetchError) {
                    console.error(
                        `[syncAndSubscribe] Failed to sync/fetch from ${relay.url} (negotiation: ${negotiationError?.message}):`,
                        fetchError,
                    );
                    outcome = { failed: fetchError instanceof Error ? fetchError : new Error(String(fetchError)) };
                }
            }

            const terminal = outcome;
            if ("failed" in terminal) {
                await invokeCallback("onRelayError", relay, () => opts.onRelayError?.(relay, terminal.failed));
            } else {
                await invokeCallback("onRelaySynced", relay, () => opts.onRelaySynced?.(relay, terminal.synced));
            }

            completedCount++;
            if (completedCount === totalRelays) {
                await invokeCallback("onSyncComplete", undefined, () => opts.onSyncComplete?.());
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
