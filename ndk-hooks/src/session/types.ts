// types.ts - Type definitions for session data using Zustand
import type NDK from "@nostr-dev-kit/ndk";
import type { Hexpubkey, NDKEvent, NDKKind, NDKUser, NDKUserProfile } from "@nostr-dev-kit/ndk";

/**
 * User-specific session data stored within the main store.
 */
export interface UserSessionData {
    userPubkey: string; // User's public key (primary identifier)
    ndk?: NDK; // NDK instance for this user
    relays?: string[]; // User's preferred relays
    // muteListEvent?: NDKEvent; // Removed: Now stored in replaceableEvents[10000]
    mutedPubkeys: Set<string>; // Pubkeys muted by this user
    mutedHashtags: Set<string>; // Hashtags muted by this user
    mutedWords: Set<string>; // Words muted by this user
    mutedEventIds: Set<string>; // Event IDs muted by this user

    profile?: NDKUserProfile;
    followSet?: Set<Hexpubkey>; // Set of followed pubkeys
    // contactsEvent?: NDKEvent; // Removed: Now stored in replaceableEvents[3]

    /**
     * Events that are unique per kind, part of the session;
     * we will keep a subscription permanently opened monitoring this
     * event kinds
     */
    replaceableEvents: Map<NDKKind, NDKEvent | null>;

    lastActive: number; // Timestamp of last activity
    
    // Add other user-specific fields as needed, e.g., wot scores
    wot?: Map<string, number>;
}

/**
 * The overall state managed by the Zustand store.
 */
export interface SessionState {
    // Map of user sessions, keyed by pubkey
    sessions: Map<string, UserSessionData>;
    // Currently active session pubkey (null if none)
    activeSessionPubkey: string | null;

    // Actions - defined within the store creation
    // These are examples, the actual implementation will be in the store file
    createSession: (pubkey: string, initialData?: Partial<UserSessionData>) => void;
    updateSession: (pubkey: string, data: Partial<UserSessionData>) => void;
    deleteSession: (pubkey: string) => void;
    setActiveSession: (pubkey: string | null) => void;
    getSession: (pubkey: string) => UserSessionData | undefined;
    getActiveSession: () => UserSessionData | undefined;
    muteItemForSession: (
        pubkey: string,
        value: string,
        itemType: "pubkey" | "hashtag" | "word" | "event",
        publish?: boolean,
    ) => void;
    initSession: (
        ndk: NDK,
        user: NDKUser,
        opts?: SessionInitOptions,
        cb?: (error: Error | null, pubkey?: string) => void,
    ) => Promise<string | undefined>;
}

/**
 * Session initialization options
 */
export interface SessionInitOptions {
    profile?: boolean; // Fetch user profile metadata
    follows?: boolean; // Fetch user follows list
    muteList?: boolean; // Fetch user mute list
    events?: Map<NDKKind, { wrap?: { from: (event: NDKEvent) => NDKEvent } }>; // Map of kinds to fetch with optional wrapper class
    autoSetActive?: boolean; // Automatically set this session as active upon creation
}