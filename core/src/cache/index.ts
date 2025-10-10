import type NDK from "src/index.js";
import type { NDKEvent, NDKEventId } from "../events/index.js";
import type { NDKRelay } from "../relay/index.js";
import type { NDKRelayInformation } from "../relay/nip11.js";
import type { NDKFilter, NDKSubscription } from "../subscription/index.js";
import type { NDKNutzapState } from "../types.js";
import type { Hexpubkey, ProfilePointer } from "../user/index.js";
import type { NDKUserProfile } from "../user/profile.js";
import type { NDKLnUrlData } from "../zapper/ln.js";

export type NDKCacheEntry<T> = T & {
    cachedAt?: number;
};

export interface NDKCacheAdapter {
    /**
     * Whether this cache adapter is expected to be fast.
     * If this is true, the cache will be queried before the relays.
     * When this is false, the cache will be queried in addition to the relays.
     */
    locking: boolean;

    /**
     * Weather the cache is ready.
     */
    ready?: boolean;

    initializeAsync?(ndk: NDK): Promise<void>;
    initialize?(ndk: NDK): void;

    /**
     * Either synchronously or asynchronously queries the cache.
     *
     * Cache adapters that return values synchronously should return an array of events.
     * Asynchronous cache adapters should call the subscription.eventReceived method for each event.
     */
    query(subscription: NDKSubscription): NDKEvent[] | Promise<NDKEvent[]>;
    setEvent(event: NDKEvent, filters: NDKFilter[], relay?: NDKRelay): Promise<void>;

    /**
     * Called when we receive a duplicate event from a relay.
     * This associates the relay with an existing cached event without re-processing the event data.
     * @param event - The duplicate event received.
     * @param relay - The relay that sent the duplicate event.
     */
    setEventDup?(event: NDKEvent, relay: NDKRelay): Promise<void> | void;

    /**
     * Called when an event is deleted by the client.
     * Cache adapters should remove the event from their cache.
     * @param eventIds - The ids of the events that were deleted.
     */
    deleteEventIds?(eventIds: NDKEventId[]): Promise<void>;

    /**
     * Fetches a profile from the cache synchronously.
     * @param pubkey - The pubkey of the profile to fetch.
     * @returns The profile, or null if it is not in the cache.
     */
    fetchProfileSync?(pubkey: Hexpubkey): NDKCacheEntry<NDKUserProfile> | null;

    /**
     * Retrieve all profiles from the cache synchronously.
     * @returns A map of pubkeys to profiles.
     */
    getAllProfilesSync?(): Map<Hexpubkey, NDKCacheEntry<NDKUserProfile>>;

    /**
     * Special purpose
     */
    fetchProfile?(pubkey: Hexpubkey): Promise<NDKCacheEntry<NDKUserProfile> | null>;
    saveProfile?(pubkey: Hexpubkey, profile: NDKUserProfile): void | Promise<void>;

    /**
     * Fetches profiles that match the given filter.
     * @param filter
     * @returns NDKUserProfiles that match the filter.
     * @example
     * const searchFunc = (pubkey, profile) => profile.name.toLowerCase().includes("alice");
     * const allAliceProfiles = await cache.getProfiles(searchFunc);
     */
    getProfiles?: (
        filter: (pubkey: Hexpubkey, profile: NDKUserProfile) => boolean,
    ) => Promise<Map<Hexpubkey, NDKUserProfile> | undefined>;

    loadNip05?(nip05: string, maxAgeForMissing?: number): Promise<ProfilePointer | null | "missing">;
    saveNip05?(nip05: string, profile: ProfilePointer | null): void;

    /**
     * Fetches a user's LNURL data from the cache.
     * @param pubkey The pubkey of the user to fetch the LNURL data for.
     * @param maxAgeInSecs The maximum age of the data in seconds.
     * @param maxAgeForMissing The maximum age of the data in seconds if it is missing before it returns that it should be refetched.
     * @returns The LNURL data, null if it is not in the cache and under the maxAgeForMissing, or "missing" if it should be refetched.
     */
    loadUsersLNURLDoc?(
        pubkey: Hexpubkey,
        maxAgeInSecs?: number,
        maxAgeForMissing?: number,
    ): Promise<NDKLnUrlData | null | "missing">;
    saveUsersLNURLDoc?(pubkey: Hexpubkey, doc: NDKLnUrlData | null): void;

    /**
     * Updates information about the relay.
     */
    updateRelayStatus?(relayUrl: WebSocket["url"], info: NDKCacheRelayInfo): void | Promise<void>;

    /**
     * Fetches information about the relay.
     */
    getRelayStatus?(relayUrl: WebSocket["url"]): NDKCacheRelayInfo | undefined | Promise<NDKCacheRelayInfo | undefined>;

    /**
     * Tracks a publishing event.
     * @param event
     * @param relayUrls List of relays that the event will be published to.
     */
    addUnpublishedEvent?(event: NDKEvent, relayUrls: WebSocket["url"][]): void | Promise<void>;

    /**
     * Fetches all unpublished events.
     */
    getUnpublishedEvents?(): Promise<{ event: NDKEvent; relays?: WebSocket["url"][]; lastTryAt?: number }[]>;

    /**
     * Removes an unpublished event.
     */
    discardUnpublishedEvent?(eventId: NDKEventId): void | Promise<void>;

    /**
     * Called when the cache is ready.
     */
    onReady?(callback: () => void): void;

    /**
     * Get a decrypted event from the cache by ID.
     * @param eventId - The ID of the decrypted event to get.
     * @returns The decrypted event, or null if it doesn't exist.
     */
    getDecryptedEvent?(eventId: NDKEventId): NDKEvent | null | Promise<NDKEvent | null>;

    /**
     * Store a decrypted event in the cache.
     * @param event - The decrypted event to store.
     */
    addDecryptedEvent?(event: NDKEvent): void | Promise<void>;

    /**
     * Cleans up the cache. This is called when the user logs out.
     */
    clear?(): Promise<void>;

    /**
     * Gets all nutzap states from the cache.
     * @returns A map of event IDs to nutzap states.
     */
    getAllNutzapStates?(): Promise<Map<NDKEventId, NDKNutzapState>>;

    /**
     * Sets the state of a nutzap in the cache.
     * @param id The ID of the nutzap event.
     * @param stateChange The partial state change to apply.
     */
    setNutzapState?(id: NDKEventId, stateChange: Partial<NDKNutzapState>): Promise<void>;

    /**
     * Generic key-value cache storage for packages.
     * Packages should namespace their keys (e.g., "wallet:mint:info:https://mint.url").
     * @param namespace The namespace for the data (e.g., "wallet", "sync")
     * @param key The key within the namespace
     * @param maxAgeInSecs Maximum age of cached data in seconds (optional)
     * @returns The cached data, or undefined if not cached or expired
     */
    getCacheData?<T>(namespace: string, key: string, maxAgeInSecs?: number): Promise<T | undefined>;

    /**
     * Generic key-value cache storage for packages.
     * @param namespace The namespace for the data (e.g., "wallet", "sync")
     * @param key The key within the namespace
     * @param data The data to cache
     */
    setCacheData?<T>(namespace: string, key: string, data: T): Promise<void>;
}

/**
 * Relay metadata and statistics stored in cache.
 *
 * This type supports both core connection tracking and extensible package-specific metadata.
 * Packages can store custom data using the metadata field with namespacing.
 *
 * @example
 * ```typescript
 * // Core connection tracking
 * await cache.updateRelayStatus(url, {
 *   lastConnectedAt: Date.now(),
 *   consecutiveFailures: 0
 * });
 *
 * // Package-specific metadata (sync package)
 * await cache.updateRelayStatus(url, {
 *   metadata: {
 *     sync: {
 *       supportsNegentropy: false,
 *       lastChecked: Date.now()
 *     }
 *   }
 * });
 *
 * // Package-specific metadata (auth/rate limiting)
 * await cache.updateRelayStatus(url, {
 *   metadata: {
 *     auth: {
 *       token: 'AUTH_TOKEN_HERE',
 *       expiresAt: Date.now() + 3600000
 *     },
 *     rateLimit: {
 *       requestCount: 42,
 *       windowStart: Date.now(),
 *       maxPerWindow: 100
 *     }
 *   }
 * });
 *
 * // NIP-11 caching
 * await cache.updateRelayStatus(url, {
 *   nip11: {
 *     data: relayInfo,
 *     fetchedAt: Date.now()
 *   }
 * });
 * ```
 */
export type NDKCacheRelayInfo = {
    /**
     * Timestamp of last successful connection
     */
    lastConnectedAt?: number;

    /**
     * Don't attempt connection before this timestamp
     */
    dontConnectBefore?: number;

    /**
     * Number of consecutive connection failures
     */
    consecutiveFailures?: number;

    /**
     * Timestamp of last connection failure
     */
    lastFailureAt?: number;

    /**
     * Cached NIP-11 relay information document
     */
    nip11?: {
        data: NDKRelayInformation;
        fetchedAt: number;
    };

    /**
     * Package-specific metadata (namespaced).
     *
     * Packages should use their package name as the namespace key.
     *
     * @example
     * ```typescript
     * metadata: {
     *   sync: { supportsNegentropy: false, lastChecked: 1234567890 },
     *   auth: { token: 'abc123', expiresAt: 1234567890 },
     *   rateLimit: { requestCount: 42, windowStart: 1234567890, maxPerWindow: 100 }
     * }
     * ```
     */
    metadata?: Record<string, Record<string, unknown>>;
};
