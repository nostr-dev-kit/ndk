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
 * Sync package metadata stored in relay cache
 */
interface SyncRelayMetadata {
    supportsNegentropy?: boolean;
    lastChecked?: number;
    lastError?: string;
}

/**
 * NDKSync - Stateful sync manager
 *
 * Tracks which relays support Negentropy using persistent cache and provides clean sync APIs.
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
    private readonly CAPABILITY_CACHE_TTL = 3600000; // 1 hour

    constructor(ndk: NDK) {
        this.ndk = ndk;
    }

    /**
     * Check if a relay supports Negentropy
     * Uses persistent cache if available
     */
    async checkRelaySupport(relay: NDKRelay): Promise<boolean> {
        // Check persistent cache first
        const status = await this.ndk.cacheAdapter?.getRelayStatus?.(relay.url);
        const syncMeta = status?.metadata?.sync as SyncRelayMetadata | undefined;

        const now = Date.now();
        if (syncMeta && syncMeta.lastChecked && now - syncMeta.lastChecked < this.CAPABILITY_CACHE_TTL) {
            console.debug(
                `[NDK Sync] Using cached negentropy support for ${relay.url}: ${syncMeta.supportsNegentropy}`,
            );
            return syncMeta.supportsNegentropy ?? false;
        }

        // Check relay capabilities
        console.debug(`[NDK Sync] Checking negentropy support for ${relay.url}...`);
        try {
            const supports = await supportsNegentropy(relay);
            console.debug(`[NDK Sync] ${relay.url} negentropy support: ${supports}`);
            await this.ndk.cacheAdapter?.updateRelayStatus?.(relay.url, {
                metadata: {
                    sync: {
                        supportsNegentropy: supports,
                        lastChecked: now,
                    },
                },
            });
            return supports;
        } catch (error) {
            // On error, assume no support and cache
            console.debug(`[NDK Sync] Error checking ${relay.url}, assuming no negentropy support`);
            await this.ndk.cacheAdapter?.updateRelayStatus?.(relay.url, {
                metadata: {
                    sync: {
                        supportsNegentropy: false,
                        lastChecked: now,
                        lastError: error instanceof Error ? error.message : "Unknown error",
                    },
                },
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
     * Get relay capability info from persistent cache
     */
    async getRelayCapability(relayUrl: string): Promise<SyncRelayMetadata | undefined> {
        const status = await this.ndk.cacheAdapter?.getRelayStatus?.(relayUrl);
        return status?.metadata?.sync as SyncRelayMetadata | undefined;
    }

    /**
     * Clear capability cache for a specific relay or all relays
     * Useful for testing or after relay updates
     */
    async clearCapabilityCache(relayUrl?: string): Promise<void> {
        if (relayUrl) {
            // Clear only the sync metadata for this relay
            // undefined values are deleted by updateRelayStatus
            await this.ndk.cacheAdapter?.updateRelayStatus?.(relayUrl, {
                metadata: {
                    sync: undefined as any,
                },
            });
        } else {
            // We can't easily clear all sync metadata without enumerating all relays
            // So this is now a no-op, or could be enhanced if needed
            console.warn("clearCapabilityCache() without relayUrl is not supported with persistent cache");
        }
    }

    /**
     * Mark a relay as not supporting negentropy in the cache
     * @private
     */
    private async markRelayAsNotSupporting(relayUrl: string, error: Error): Promise<void> {
        await this.ndk.cacheAdapter?.updateRelayStatus?.(relayUrl, {
            metadata: {
                sync: {
                    supportsNegentropy: false,
                    lastChecked: Date.now(),
                    lastError: error.message,
                },
            },
        });
    }

    /**
     * Create an onRelayError handler that updates cache and calls user callback
     * @private
     */
    private createErrorHandler(userCallback?: (relay: NDKRelay, error: Error) => void | Promise<void>) {
        return async (relay: NDKRelay, error: Error) => {
            await userCallback?.(relay, error);
            await this.markRelayAsNotSupporting(relay.url, error);
        };
    }

    /**
     * Sync with a single relay, with automatic fallback to fetchEvents if negentropy not supported
     * @private
     */
    private async syncSingleRelay(
        relay: NDKRelay,
        filters: NDKFilter[],
        opts: NDKSyncOptions = {},
    ): Promise<NDKSyncResult> {
        const supportsNeg = await this.checkRelaySupport(relay);

        if (supportsNeg) {
            // Use Negentropy sync - errors are handled by onRelayError in opts
            console.debug(`[NDK Sync] Using negentropy sync for ${relay.url}`);
            return await ndkSync.call(this.ndk, filters, {
                ...opts,
                relaySet: new NDKRelaySet(new Set([relay]), this.ndk),
            });
        }

        // Fallback to fetchEvents when negentropy not supported
        console.debug(`[NDK Sync] Using fetchEvents fallback for ${relay.url}`);
        const events = await this.ndk.fetchEvents(filters, {
            relaySet: new NDKRelaySet(new Set([relay]), this.ndk),
            subId: "sync-fetch-fallback",
            groupable: false,
        });

        // Convert Set<NDKEvent> to NDKSyncResult format
        return {
            events: Array.from(events),
            need: new Set(),
            have: new Set(),
        };
    }

    /**
     * Perform NIP-77 Negentropy sync with relays
     *
     * @param filters - Filters to sync
     * @param opts - Sync options
     * @returns Sync result with events, need, and have sets
     */
    async sync(filters: NDKFilter | NDKFilter[], opts?: NDKSyncOptions): Promise<NDKSyncResult> {
        const filterArray = Array.isArray(filters) ? filters : [filters];

        // Determine relay set
        const relaySet =
            opts?.relaySet || (opts?.relayUrls ? NDKRelaySet.fromRelayUrls(opts.relayUrls, this.ndk) : undefined);

        const relays = relaySet ? Array.from(relaySet.relays) : Array.from(this.ndk.pool?.relays?.values() || []);

        if (relays.length === 0) {
            console.warn("[NDK Sync] No relays available for sync");
            return {
                events: [],
                need: new Set(),
                have: new Set(),
            };
        }

        // Result accumulators
        const result: NDKSyncResult = {
            events: [],
            need: new Set(),
            have: new Set(),
        };

        // Merge options with error handler
        const mergedOpts: NDKSyncOptions = {
            ...opts,
            onRelayError: this.createErrorHandler(opts?.onRelayError),
        };

        // Sync with each relay in parallel (with fallback for non-negentropy relays)
        await Promise.all(
            relays.map(async (relay) => {
                try {
                    const relayResult = await this.syncSingleRelay(relay, filterArray, mergedOpts);

                    // Merge results
                    result.events.push(...relayResult.events);
                    for (const id of relayResult.need) result.need.add(id);
                    for (const id of relayResult.have) result.have.add(id);
                } catch (error) {
                    console.error(`[NDK Sync] Failed to sync with relay ${relay.url}:`, error);
                }
            }),
        );

        return result;
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
                try {
                    const result = await this.syncSingleRelay(relay, filterArray, {
                        autoFetch: true,
                        onRelayError: this.createErrorHandler(opts.onRelayError),
                    });
                    opts.onRelaySynced?.(relay, result.events.length);
                } catch (error) {
                    console.error(`[NDKSync] Failed to sync from ${relay.url}:`, error);
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
