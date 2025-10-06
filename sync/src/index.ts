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

import { ndkSync } from "./ndk-sync.js";
import { syncAndSubscribe } from "./sync-subscribe.js";

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
export type {
    RelayCapabilities,
    RelayInformation,
} from "./utils/relay-capabilities.js";
// Export relay capability checking utilities
export {
    fetchRelayInformation,
    filterNegentropyRelays,
    getRelayCapabilities,
    supportsNegentropy,
} from "./utils/relay-capabilities.js";
