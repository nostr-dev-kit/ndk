import type NDK from "src/index.js";
import type { NDKEvent, NDKEventId } from "../events/index.js";
import type { NDKRelay } from "../relay/index.js";
import type { NDKRelayInformation } from "../relay/nip11.js";
import type { NDKFilter, NDKSubscription } from "../subscription/index.js";
import type { NDKNutzapState } from "../types.js";
import type { Hexpubkey, ProfilePointer } from "../user/index.js";
import type { NDKUserProfile } from "../user/profile.js";
import type { NDKLnUrlData } from "../zapper/ln.js";

/**
 * Cashu mint information (from @cashu/cashu-ts)
 */
export type CashuMintInfo = {
    name?: string;
    pubkey?: string;
    version?: string;
    description?: string;
    description_long?: string;
    contact?: Array<Array<string>>;
    motd?: string;
    nuts?: Record<string, unknown>;
};

/**
 * Cashu mint keys (from @cashu/cashu-ts)
 */
export type CashuMintKeys = {
    id: string;
    unit: string;
    keys: Record<number, string>;
};

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

    loadNip05?(
        nip05: string,
        maxAgeForMissing?: number,
    ): Promise<ProfilePointer | null | "missing">;
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
    getRelayStatus?(
        relayUrl: WebSocket["url"],
    ): NDKCacheRelayInfo | undefined | Promise<NDKCacheRelayInfo | undefined>;

    /**
     * Tracks a publishing event.
     * @param event
     * @param relayUrls List of relays that the event will be published to.
     */
    addUnpublishedEvent?(event: NDKEvent, relayUrls: WebSocket["url"][]): void | Promise<void>;

    /**
     * Fetches all unpublished events.
     */
    getUnpublishedEvents?(): Promise<
        { event: NDKEvent; relays?: WebSocket["url"][]; lastTryAt?: number }[]
    >;

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
     * Loads cached Cashu mint information.
     * @param mintUrl The URL of the mint.
     * @param maxAgeInSecs Maximum age of cached data in seconds (optional).
     * @returns The mint info, or undefined if not cached or expired.
     */
    loadCashuMintInfo?(mintUrl: string, maxAgeInSecs?: number): Promise<CashuMintInfo | undefined>;

    /**
     * Saves Cashu mint information to the cache.
     * @param mintUrl The URL of the mint.
     * @param info The mint information to cache.
     */
    saveCashuMintInfo?(mintUrl: string, info: CashuMintInfo): Promise<void>;

    /**
     * Loads cached Cashu mint keys (keysets).
     * @param mintUrl The URL of the mint.
     * @param maxAgeInSecs Maximum age of cached data in seconds (optional).
     * @returns Array of mint keys, or undefined if not cached or expired.
     */
    loadCashuMintKeys?(
        mintUrl: string,
        maxAgeInSecs?: number,
    ): Promise<CashuMintKeys[] | undefined>;

    /**
     * Saves Cashu mint keys (keysets) to the cache.
     * @param mintUrl The URL of the mint.
     * @param keys Array of mint keys to cache.
     */
    saveCashuMintKeys?(mintUrl: string, keys: CashuMintKeys[]): Promise<void>;
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
