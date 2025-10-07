/**
 * NDKSync - Clean class-based API for sync operations
 *
 * Provides a type-safe, stateful interface for syncing events with relays
 * using Negentropy protocol where available, with automatic fallback.
 */

import type NDK from "@nostr-dev-kit/ndk";
import { type NDKFilter, type NDKRelay, NDKRelaySet, type NDKSubscription } from "@nostr-dev-kit/ndk";
import { TIMEOUTS } from "./constants.js";
import { ndkSync } from "./ndk-sync.js";
import type { SyncAndSubscribeOptions } from "./sync-subscribe.js";
import type { NDKSyncOptions, NDKSyncResult } from "./types.js";
import { getRelayCapabilities, supportsNegentropy } from "./utils/relay-capabilities.js";

/**
 * Relay capability tracking
 */
interface RelayCapability {
    supportsNegentropy: boolean;
    lastChecked: number;
    lastError?: string;
}

/**
 * NDKSync - Stateful sync manager
 *
 * Tracks which relays support Negentropy and provides clean sync APIs.
 *
 * @example
 * ```typescript
 * import { NDKSync } from '@nostr-dev-kit/sync';
 *
 * const sync = new NDKSync(ndk);
 *
 * // Sync events
 * const result = await sync.sync({ kinds: [1], limit: 100 });
 *
 * // Sync and subscribe
 * const sub = await sync.syncAndSubscribe({ kinds: [1] }, {
 *   onRelaySynced: (relay, count) => {
 *     console.log(`Synced ${count} from ${relay.url}`);
 *   }
 * });
 * ```
 */
export class NDKSync {
    private ndk: NDK;
    private relayCapabilities: Map<string, RelayCapability> = new Map();
    private readonly CAPABILITY_CACHE_TTL = 3600000; // 1 hour

    constructor(ndk: NDK) {
        this.ndk = ndk;
    }

    /**
     * Check if a relay supports Negentropy
     * Uses cached result if available and fresh
     */
    async checkRelaySupport(relay: NDKRelay): Promise<boolean> {
        const cached = this.relayCapabilities.get(relay.url);
        const now = Date.now();

        // Return cached if fresh
        if (cached && now - cached.lastChecked < this.CAPABILITY_CACHE_TTL) {
            return cached.supportsNegentropy;
        }

        // Check relay capabilities
        try {
            const supports = await supportsNegentropy(relay);
            this.relayCapabilities.set(relay.url, {
                supportsNegentropy: supports,
                lastChecked: now,
            });
            return supports;
        } catch (error) {
            // On error, assume no support and cache briefly
            this.relayCapabilities.set(relay.url, {
                supportsNegentropy: false,
                lastChecked: now,
                lastError: error instanceof Error ? error.message : "Unknown error",
            });
            return false;
        }
    }

    /**
     * Get all relays that support Negentropy
     */
    async getNegentropyRelays(relays?: NDKRelay[]): Promise<NDKRelay[]> {
        const relaysToCheck = relays || Array.from(this.ndk.pool?.relays?.values() || []);
        const results = await Promise.all(
            relaysToCheck.map(async (relay) => ({
                relay,
                supports: await this.checkRelaySupport(relay),
            })),
        );
        return results.filter((r) => r.supports).map((r) => r.relay);
    }

    /**
     * Get relay capability info
     */
    getRelayCapability(relayUrl: string): RelayCapability | undefined {
        return this.relayCapabilities.get(relayUrl);
    }

    /**
     * Clear capability cache (useful for testing or after relay updates)
     */
    clearCapabilityCache(relayUrl?: string): void {
        if (relayUrl) {
            this.relayCapabilities.delete(relayUrl);
        } else {
            this.relayCapabilities.clear();
        }
    }

    /**
     * Perform NIP-77 Negentropy sync with relays
     *
     * @param filters - Filters to sync
     * @param opts - Sync options
     * @returns Sync result with events, need, and have sets
     */
    async sync(filters: NDKFilter | NDKFilter[], opts?: NDKSyncOptions): Promise<NDKSyncResult> {
        return ndkSync.call(this.ndk, filters, opts);
    }

    /**
     * Subscribe and sync - ensures complete event coverage without missing events
     *
     * This method:
     * 1. Immediately starts a live subscription with limit: 0 to catch new events
     * 2. Returns the subscription right away (non-blocking)
     * 3. In the background, syncs historical events from each relay:
     *    - Uses Negentropy sync where available (tracked via capability cache)
     *    - Falls back to fetchEvents for relays without Negentropy
     * 4. All synced events automatically flow to the subscription
     *
     * @param filters - NDK filter(s) to sync and subscribe to
     * @param opts - Subscription options with sync callbacks
     * @returns NDKSubscription that receives both live and historical events
     */
    async syncAndSubscribe(
        filters: NDKFilter | NDKFilter[],
        opts: SyncAndSubscribeOptions = {},
    ): Promise<NDKSubscription> {
        // Ensure we have a cache adapter for syncing
        if (!this.ndk.cacheAdapter) {
            console.warn("[NDKSync] No cache adapter - sync will not work, using subscription only");
        }

        const filterArray = Array.isArray(filters) ? filters : [filters];

        // Determine relay set
        const relaySet =
            opts.relaySet || (opts.relayUrls ? NDKRelaySet.fromRelayUrls(opts.relayUrls, this.ndk) : undefined);

        const relays = relaySet ? Array.from(relaySet.relays) : Array.from(this.ndk.pool?.relays?.values() || []);

        if (relays.length === 0) {
            throw new Error("No relays available for syncAndSubscribe");
        }

        // 1. Start live subscription with limit: 0
        // This catches all NEW events from now on
        const subFilters = filterArray.map((f) => ({
            ...f,
            limit: 0,
        }));

        const sub = this.ndk.subscribe(subFilters, {
            ...opts,
            relaySet,
            closeOnEose: false,
        });

        // 2. Background: sync historical events from each relay
        if (this.ndk.cacheAdapter) {
            // Track completion across all relays
            let completedCount = 0;
            const totalRelays = relays.length;

            const syncWithRelay = async (relay: NDKRelay) => {
                // Check if relay supports negentropy
                const supportsNeg = await this.checkRelaySupport(relay);

                try {
                    if (supportsNeg) {
                        // Use Negentropy sync
                        const result = await ndkSync.call(this.ndk, filterArray, {
                            relaySet: new NDKRelaySet(new Set([relay]), this.ndk),
                            autoFetch: true,
                        });
                        opts.onRelaySynced?.(relay, result.events.length);
                    } else {
                        // Fallback to fetchEvents
                        const events = await this.ndk.fetchEvents(filterArray, {
                            relaySet: new NDKRelaySet(new Set([relay]), this.ndk),
                            subId: "sync-fetch-fallback",
                            groupable: false,
                        });
                        opts.onRelaySynced?.(relay, events.size);
                    }
                } catch (error) {
                    console.error(`[NDKSync] Failed to sync from ${relay.url}:`, error);
                    // Mark relay as not supporting negentropy on error
                    this.relayCapabilities.set(relay.url, {
                        supportsNegentropy: false,
                        lastChecked: Date.now(),
                        lastError: error instanceof Error ? error.message : "Unknown error",
                    });
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
                    syncWithRelay(relay);
                } else {
                    // Relay not connected yet, wait for it
                    let completed = false;
                    const onReady = () => {
                        if (completed) return;
                        completed = true;
                        relay.off("ready", onReady);
                        syncWithRelay(relay);
                    };
                    relay.once("ready", onReady);

                    // Handle case where relay never connects
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
            // No cache adapter - can't sync
            setTimeout(() => opts.onSyncComplete?.(), 0);
        }

        return sub;
    }

    /**
     * Static factory methods for backwards compatibility
     */
    static sync(ndk: NDK, filters: NDKFilter | NDKFilter[], opts?: NDKSyncOptions): Promise<NDKSyncResult> {
        const sync = new NDKSync(ndk);
        return sync.sync(filters, opts);
    }

    static syncAndSubscribe(
        ndk: NDK,
        filters: NDKFilter | NDKFilter[],
        opts?: SyncAndSubscribeOptions,
    ): Promise<NDKSubscription> {
        const sync = new NDKSync(ndk);
        return sync.syncAndSubscribe(filters, opts);
    }
}
