/**
 * @nostr-dev-kit/sync
 *
 * NIP-77 Negentropy sync protocol implementation for NDK.
 *
 * Provides efficient event synchronization using the Negentropy set reconciliation
 * protocol with automatic fallback for relays that don't support it.
 *
 * @example
 * ```typescript
 * import NDK from '@nostr-dev-kit/ndk';
 * import { NDKSync } from '@nostr-dev-kit/sync';
 *
 * const ndk = new NDK({
 *   explicitRelayUrls: ['wss://relay.damus.io'],
 *   cacheAdapter: myCacheAdapter  // Required for sync
 * });
 *
 * await ndk.connect();
 *
 * // Recommended: Use NDKSync class (tracks relay capabilities)
 * const sync = new NDKSync(ndk);
 *
 * // Sync recent notes
 * const result = await sync.sync({
 *   kinds: [1],
 *   authors: [pubkey],
 *   since: Math.floor(Date.now() / 1000) - 86400
 * });
 *
 * console.log(`Synced ${result.events.length} events`);
 *
 * // Sync and subscribe
 * const sub = await sync.syncAndSubscribe({ kinds: [1] }, {
 *   onRelaySynced: (relay, count) => {
 *     console.log(`${relay.url}: ${count} events`);
 *   }
 * });
 *
 * // Alternative: Static methods
 * await NDKSync.sync(ndk, { kinds: [1] });
 * await NDKSync.syncAndSubscribe(ndk, { kinds: [1] });
 * ```
 */

import { syncAndSubscribe, type SyncAndSubscribeOptions } from "./sync-subscribe.js";

// Export main class - USE THIS
export { NDKSync } from "./ndk-sync-class.js";

// Export syncAndSubscribe (uses NDKSync internally)
export { syncAndSubscribe };

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
