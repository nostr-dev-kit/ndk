import type { NDKEvent, NDKEventId } from "../events/index.js";
import type { NDKRelay } from "../relay/index.js";
import type { NDKFilter, NDKSubscription } from "../subscription/index.js";
import type { Hexpubkey, ProfilePointer } from "../user/index.js";
import type { NDKUserProfile } from "../user/profile.js";
import type { NDKLnUrlData } from "../zapper/ln.js";
import type { NDKNutzapState } from "../types.js";
import NDK from "src/index.js";

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
    saveProfile?(pubkey: Hexpubkey, profile: NDKUserProfile): void;

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
    updateRelayStatus?(relayUrl: WebSocket["url"], info: NDKCacheRelayInfo): void;

    /**
     * Fetches information about the relay.
     */
    getRelayStatus?(relayUrl: WebSocket["url"]): NDKCacheRelayInfo | undefined;

    /**
     * Tracks a publishing event.
     * @param event
     * @param relayUrls List of relays that the event will be published to.
     */
    addUnpublishedEvent?(event: NDKEvent, relayUrls: WebSocket["url"][]): void;

    /**
     * Fetches all unpublished events.
     */
    getUnpublishedEvents?(): Promise<{ event: NDKEvent; relays?: WebSocket["url"][]; lastTryAt?: number }[]>;

    /**
     * Removes an unpublished event.
     */
    discardUnpublishedEvent?(eventId: NDKEventId): void;

    /**
     * Called when the cache is ready.
     */
    onReady?(callback: () => void): void;

    /**
     * Get a decrypted event from the cache by ID.
     * @param eventId - The ID of the decrypted event to get.
     * @returns The decrypted event, or null if it doesn't exist.
     */
    getDecryptedEvent?(eventId: NDKEventId): NDKEvent | null;

    /**
     * Store a decrypted event in the cache.
     * @param event - The decrypted event to store.
     */
    addDecryptedEvent?(event: NDKEvent): void;

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
}

export type NDKCacheRelayInfo = {
    lastConnectedAt?: number;
    dontConnectBefore?: number;
};
