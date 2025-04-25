import type { NDKEvent, Hexpubkey, NDKUser, NDKList } from "@nostr-dev-kit/ndk";
import NDK from "@nostr-dev-kit/ndk";

/**
 * Mute criteria used for filtering events
 */
/**
 * Criteria used for filtering events based on mute settings.
 */
export interface MuteCriteria {
    pubkeys: Set<Hexpubkey>;
    eventIds: Set<string>;
    hashtags: Set<string>;
    words: Set<string>;
}

/**
 * User-specific mute data
 */
export interface NDKUserMutes {
    pubkeys: Set<Hexpubkey>;
    hashtags: Set<string>;
    words: Set<string>;
    eventIds: Set<string>;

    /**
     * The NDKEvent representing the mute list (kind 10000)
     */
    muteListEvent?: NDKList;
}

/**
 * Type for items that can be muted
 */
export type MuteableItem = NDKEvent | NDKUser | string;

/**
 * Type for the mute item type
 */
export type MuteItemType = "pubkey" | "hashtag" | "word" | "event";

/**
 * The state structure for the NDK Mutes Zustand store
 */

export interface NDKMutesState {
    /**
     * The NDK instance used for mute operations
     */
    ndk: NDK | undefined;

    /**
     * Map of user mutes by pubkey
     */
    mutes: Map<Hexpubkey, NDKUserMutes>;

    /**
     * Extra mutes that won't be included in the published mute list
     * This is at the application level, not per user
     */
    extraMutes: NDKUserMutes;

    /**
     * The active pubkey for mute operations
     */
    activePubkey: Hexpubkey | null;

    /**
     * The active mute list
     */
    muteList: NDKList;

    /**
     * The combined mute criteria for the active pubkey and extraMutes
     */
    muteCriteria: MuteCriteria;

    /**
     * Initialize mutes for a user
     * @param pubkey The pubkey of the user
     */
    initMutes: (pubkey: Hexpubkey) => void;

    /**
     * Load mute list for a user from an event
     * @param event The mute list event
     */
    loadMuteList: (event: NDKEvent) => void;

    /**
     * Mute an item for a user
     * @param pubkey The pubkey of the user
     * @param item The item to mute
     * @param type The type of the item
     * @param options Options for publishing the mute list
     */
    /**
     * Mute an item for a user
     * @param item The item to mute
     * @param pubkey The pubkey of the user (optional, uses active pubkey if undefined)
     */
    mute: (item: MuteableItem, pubkey?: Hexpubkey) => void;

    /**
     * Unmute an item for a user
     * @param item The item to unmute
     * @param pubkey The pubkey of the user (optional, uses active pubkey if undefined)
     */
    unmute: (item: MuteableItem, pubkey?: Hexpubkey) => void;

    /**
     * Set the active pubkey for mute operations
     * @param pubkey The pubkey to set as active
     */
    setActivePubkey: (pubkey: Hexpubkey | null) => void;

    /**
     * Add multiple extra mute items that won't be included in the published mute list
     * @param items Array of items to mute
     */
    addExtraMuteItems: (items: MuteableItem[]) => void;
}
