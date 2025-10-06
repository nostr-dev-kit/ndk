/**
 * @nostr-dev-kit/sync
 *
 * NIP-77 Negentropy sync protocol implementation for NDK.
 *
 * This package extends NDK with efficient event synchronization capabilities
 * using the Negentropy set reconciliation protocol.
 *
 * @example
 * ```typescript
 * import NDK from '@nostr-dev-kit/ndk';
 * import '@nostr-dev-kit/sync';  // Adds .sync() method to NDK
 *
 * const ndk = new NDK({
 *   explicitRelayUrls: ['wss://relay.damus.io'],
 *   cacheAdapter: myCacheAdapter  // Required for sync
 * });
 *
 * await ndk.connect();
 *
 * // Sync recent notes from a user
 * const result = await ndk.sync({
 *   kinds: [1],
 *   authors: [pubkey],
 *   since: Math.floor(Date.now() / 1000) - 86400
 * });
 *
 * console.log(`Synced ${result.events.length} events`);
 * ```
 */

import NDK, { type NDKFilter, type NDKSubscription } from "@nostr-dev-kit/ndk";
import { ndkSync } from "./ndk-sync.js";
import { syncAndSubscribe, type SyncAndSubscribeOptions } from "./sync-subscribe.js";
import type { NDKSyncOptions, NDKSyncResult } from "./types.js";

// TypeScript declaration merging
declare module "@nostr-dev-kit/ndk" {
    interface NDK {
        /**
         * Perform NIP-77 Negentropy sync with relays.
         *
         * @param filters - Filters to sync
         * @param opts - Sync options
         * @returns Sync result with events, need, and have sets
         */
        sync(filters: NDKFilter | NDKFilter[], opts?: NDKSyncOptions): Promise<NDKSyncResult>;

        /**
         * Subscribe and sync - ensures complete event coverage without missing events.
         *
         * This function:
         * 1. Immediately starts a live subscription with limit: 0 to catch new events
         * 2. Returns the subscription right away (non-blocking)
         * 3. In the background, syncs historical events from each relay
         * 4. All synced events automatically flow to the subscription
         *
         * @param filters - NDK filter(s) to sync and subscribe to
         * @param opts - Subscription options with sync callbacks
         * @returns NDKSubscription that receives both live and historical events
         */
        syncAndSubscribe(
            filters: NDKFilter | NDKFilter[],
            opts?: SyncAndSubscribeOptions,
        ): Promise<NDKSubscription>;
    }
}

// Attach methods to NDK prototype for better DX
(NDK.prototype as any).sync = ndkSync;
(NDK.prototype as any).syncAndSubscribe = syncAndSubscribe;

// Re-export the main sync functions
export { ndkSync, syncAndSubscribe };

export { Accumulator } from "./negentropy/accumulator.js";
// Export core classes (for advanced usage)
export { Negentropy } from "./negentropy/core.js";
export { NegentropyStorage } from "./negentropy/storage.js";
// Export utilities (for advanced usage)
export {
    compareUint8Array,
    decodeVarInt,
    encodeVarInt,
    FINGERPRINT_SIZE,
    hexToUint8Array,
    ID_SIZE,
    PROTOCOL_VERSION,
    uint8ArrayToHex,
    WrappedBuffer,
} from "./negentropy/utils.js";
export { SyncSession } from "./relay/sync-session.js";
export type { SyncAndSubscribeOptions } from "./sync-subscribe.js";
// Export types
export type { Bound, NDKSyncOptions, NDKSyncResult, StorageItem } from "./types.js";
export { NegentropyMode } from "./types.js";
export type { RelayCapabilities } from "./utils/relay-capabilities.js";
// Export relay capability checking utilities
export {
    filterNegentropyRelays,
    getRelayCapabilities,
    supportsNegentropy,
} from "./utils/relay-capabilities.js";
