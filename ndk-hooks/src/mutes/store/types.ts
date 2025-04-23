import type { NDKEvent, Hexpubkey } from "@nostr-dev-kit/ndk";

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
    muteListEvent?: NDKEvent;
}

/**
 * Type for items that can be muted
 */
export type MuteableItem = NDKEvent | Hexpubkey | string;

/**
 * Type for the mute item type
 */
export type MuteItemType = "pubkey" | "hashtag" | "word" | "event";

/**
 * Options for publishing mute list events
 */
export interface PublishMuteListOptions {
    /**
     * Whether to publish the mute list event
     * @default true
     */
    publish?: boolean;
}

/**
 * The state structure for the NDK Mutes Zustand store
 */
export interface NDKMutesState {
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
     * @param pubkey The pubkey of the user
     * @param event The mute list event
     */
    loadMuteList: (pubkey: Hexpubkey, event: NDKEvent) => void;

    /**
     * Mute an item for a user
     * @param pubkey The pubkey of the user
     * @param item The item to mute
     * @param type The type of the item
     * @param options Options for publishing the mute list
     */
    muteItem: (pubkey: Hexpubkey, item: string, type: MuteItemType, options?: PublishMuteListOptions) => void;

    /**
     * Unmute an item for a user
     * @param pubkey The pubkey of the user
     * @param item The item to unmute
     * @param type The type of the item
     * @param options Options for publishing the mute list
     */
    unmuteItem: (pubkey: Hexpubkey, item: string, type: MuteItemType, options?: PublishMuteListOptions) => void;

    /**
     * Set the active pubkey for mute operations
     * @param pubkey The pubkey to set as active
     */
    setActivePubkey: (pubkey: Hexpubkey | null) => void;

    /**
     * Check if an item is muted for a user
     * @param pubkey The pubkey of the user
     * @param item The item to check
     * @param type The type of the item
     */
    isItemMuted: (pubkey: Hexpubkey, item: string, type: MuteItemType) => boolean;

    /**
     * Add multiple extra mute items that won't be included in the published mute list
     * @param items Array of items to mute
     */
    addExtraMuteItems: (items: MuteableItem[]) => void;

    /**
     * Publish the mute list for a user
     * @param pubkey The pubkey of the user
     */
    publishMuteList: (pubkey: Hexpubkey) => Promise<NDKEvent | undefined>;
}
