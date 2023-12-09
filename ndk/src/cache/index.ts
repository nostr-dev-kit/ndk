import type { NDKEvent } from "../events/index.js";
import type { NDKRelay } from "../relay/index.js";
import type { NDKFilter, NDKSubscription } from "../subscription/index.js";
import type { Hexpubkey, ProfilePointer } from "../user/index.js";
import type { NDKUserProfile } from "../user/profile.js";

export interface NDKCacheAdapter {
    /**
     * Whether this cache adapter is expected to be fast.
     * If this is true, the cache will be queried before the relays.
     * When this is false, the cache will be queried in addition to the relays.
     */
    locking: boolean;

    query(subscription: NDKSubscription): Promise<void>;
    setEvent(event: NDKEvent, filters: NDKFilter[], relay?: NDKRelay): Promise<void>;

    /**
     * Special purpose
     */
    fetchProfile?(pubkey: Hexpubkey): Promise<NDKUserProfile | null>;
    saveProfile?(pubkey: Hexpubkey, profile: NDKUserProfile): void;

    loadNip05?(nip05: string): Promise<ProfilePointer | null>;
    saveNip05?(nip05: string, profile: ProfilePointer): void;
}
