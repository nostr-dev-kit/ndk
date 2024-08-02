import type { NDKEvent, NDKEventId } from "../events/index.js";
import type { NDKRelay } from "../relay/index.js";
import type { NDKFilter, NDKSubscription } from "../subscription/index.js";
import type { Hexpubkey, ProfilePointer } from "../user/index.js";
import type { NDKUserProfile } from "../user/profile.js";
import type { NDKLnUrlData } from "../zapper/ln.js";

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

    query(subscription: NDKSubscription): Promise<void>;
    setEvent(event: NDKEvent, filters: NDKFilter[], relay?: NDKRelay): Promise<void>;

    /**
     * Called when an event is deleted by the client.
     * Cache adapters should remove the event from their cache.
     * @param event - The event that was deleted.
     */
    deleteEvent?(event: NDKEvent): Promise<void>;

    /**
     * Special purpose
     */
    fetchProfile?(pubkey: Hexpubkey): Promise<NDKUserProfile | null>;
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
        filter: (pubkey: Hexpubkey, profile: NDKUserProfile) => boolean
    ) => Promise<Map<Hexpubkey, NDKUserProfile> | undefined>;

    loadNip05?(
        nip05: string,
        maxAgeForMissing?: number
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
        maxAgeForMissing?: number
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
    getUnpublishedEvents?(): Promise<
        { event: NDKEvent; relays?: WebSocket["url"][]; lastTryAt?: number }[]
    >;

    /**
     * Removes an unpublished event.
     */
    discardUnpublishedEvent?(eventId: NDKEventId): void;

    /**
     * Called when the cache is ready.
     */
    onReady?(callback: () => void): void;
}

export type NDKCacheRelayInfo = {
    lastConnectedAt?: number;
    dontConnectBefore?: number;
};
