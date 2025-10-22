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

/**
 * Cache module definition for packages to extend the cache with their own data structures.
 * Packages define their schemas, indexes, and migrations.
 */
export interface CacheModuleDefinition {
    /**
     * Unique namespace for this module (e.g., "messages", "wallet", "sync")
     */
    namespace: string;

    /**
     * Current version of this module's schema
     */
    version: number;

    /**
     * Collection definitions for this module
     */
    collections: {
        [name: string]: {
            /**
             * Primary key field name
             */
            primaryKey: string;

            /**
             * Fields to create indexes on for efficient querying
             */
            indexes?: string[];

            /**
             * Optional schema definition (for validation or TypeScript generation)
             */
            schema?: Record<string, any>;

            /**
             * Compound indexes for multi-field queries
             */
            compoundIndexes?: Array<string[]>;
        };
    };

    /**
     * Migration functions keyed by version number
     * Version 1 is the initial setup, 2+ are upgrades
     */
    migrations: {
        [version: number]: (adapter: CacheModuleMigrationContext) => Promise<void>;
    };
}

/**
 * Migration context passed to module migration functions
 */
export interface CacheModuleMigrationContext {
    /**
     * Get a collection by name within the module's namespace
     */
    getCollection(name: string): Promise<CacheModuleCollection<any>>;

    /**
     * Create a new collection
     */
    createCollection(name: string, definition: CacheModuleDefinition["collections"][string]): Promise<void>;

    /**
     * Delete a collection
     */
    deleteCollection(name: string): Promise<void>;

    /**
     * Add an index to a collection
     */
    addIndex(collection: string, field: string | string[]): Promise<void>;

    /**
     * Current version being migrated from
     */
    fromVersion: number;

    /**
     * Target version being migrated to
     */
    toVersion: number;
}

/**
 * Collection interface for module data access
 */
export interface CacheModuleCollection<T> {
    /**
     * Get an item by its primary key
     */
    get(id: string): Promise<T | null>;

    /**
     * Get multiple items by their primary keys
     */
    getMany(ids: string[]): Promise<T[]>;

    /**
     * Save an item (upsert)
     */
    save(item: T): Promise<void>;

    /**
     * Save multiple items (bulk upsert)
     */
    saveMany(items: T[]): Promise<void>;

    /**
     * Delete an item by its primary key
     */
    delete(id: string): Promise<void>;

    /**
     * Delete multiple items by their primary keys
     */
    deleteMany(ids: string[]): Promise<void>;

    /**
     * Query items by a single field
     */
    findBy(field: string, value: any): Promise<T[]>;

    /**
     * Query items with multiple conditions
     */
    where(conditions: Record<string, any>): Promise<T[]>;

    /**
     * Get all items in the collection
     */
    all(): Promise<T[]>;

    /**
     * Count items matching conditions
     */
    count(conditions?: Record<string, any>): Promise<number>;

    /**
     * Clear all items from the collection
     */
    clear(): Promise<void>;
}

/**
 * Storage interface for cache modules that bridges to NDKCacheAdapter
 */
export interface CacheModuleStorage {
    /**
     * Register a cache module with the adapter
     */
    registerModule(module: CacheModuleDefinition): Promise<void>;

    /**
     * Get a collection from a module
     */
    getCollection<T>(namespace: string, collection: string): Promise<CacheModuleCollection<T>>;

    /**
     * Check if a module is registered
     */
    hasModule(namespace: string): boolean;

    /**
     * Get the current version of a module
     */
    getModuleVersion(namespace: string): Promise<number>;
}

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
     * @param filter - Either a filter function or a filter descriptor object
     * @returns NDKUserProfiles that match the filter.
     * @example
     * // Using a filter function
     * const searchFunc = (pubkey, profile) => profile.name.toLowerCase().includes("alice");
     * const allAliceProfiles = await cache.getProfiles(searchFunc);
     *
     * @example
     * // Using a filter descriptor (supported by some cache adapters like cache-sqlite-wasm)
     * const aliceProfiles = await cache.getProfiles({ field: 'name', contains: 'alice' });
     * // Or search multiple fields
     * const aliceProfiles = await cache.getProfiles({ fields: ['name', 'displayName'], contains: 'alice' });
     */
    getProfiles?: (
        filter: ((pubkey: Hexpubkey, profile: NDKUserProfile) => boolean) | { field?: string; fields?: string[]; contains: string },
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
     * Get a decrypted event from the cache by its wrapper ID.
     * @param wrapperId - The ID of the gift-wrapped event (kind 1059).
     * @returns The decrypted rumor event, or null if it doesn't exist.
     */
    getDecryptedEvent?(wrapperId: NDKEventId): NDKEvent | null | Promise<NDKEvent | null>;

    /**
     * Store a decrypted event in the cache.
     * @param wrapperId - The ID of the gift-wrapped event (kind 1059) to use as the cache key.
     * @param decryptedEvent - The decrypted rumor event to store.
     */
    addDecryptedEvent?(wrapperId: NDKEventId, decryptedEvent: NDKEvent): void | Promise<void>;

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

    /**
     * Cache module support - Register a module with its schema and migrations
     * @param module Module definition with schema, indexes, and migrations
     * @returns Promise that resolves when the module is registered and migrations are complete
     */
    registerModule?(module: CacheModuleDefinition): Promise<void>;

    /**
     * Cache module support - Get a collection from a registered module
     * @param namespace Module namespace
     * @param collection Collection name within the module
     * @returns Collection interface for data operations
     */
    getModuleCollection?<T>(namespace: string, collection: string): Promise<CacheModuleCollection<T>>;
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
