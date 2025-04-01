// types.ts - Type definitions for session data using Zustand
import type NDK from "@nostr-dev-kit/ndk";
import type { NDKEvent, NDKUser } from "@nostr-dev-kit/ndk";

/**
 * User-specific session data stored within the main store.
 */
export interface UserSessionData {
    userPubkey: string; // User's public key (primary identifier)
    ndk?: NDK; // NDK instance for this user
    follows?: string[]; // User's follows (pubkeys)
    relays?: string[]; // User's preferred relays
    muteListEvent?: NDKEvent; // The raw mute list event
    mutedPubkeys: Set<string>; // Pubkeys muted by this user
    mutedHashtags: Set<string>; // Hashtags muted by this user
    mutedWords: Set<string>; // Words muted by this user
    mutedEventIds: Set<string>; // Event IDs muted by this user
    // events: Map<number, NDKEvent[]>; // Removed - Events fetched for this user, keyed by kind
    lastActive: number; // Timestamp of last activity
    metadata?: UserMetadata; // User profile metadata
    // Add other user-specific fields as needed, e.g., wot scores
    wot?: Map<string, number>;
}

/**
 * User metadata (profile information)
 */
export interface UserMetadata {
    name?: string;
    displayName?: string;
    picture?: string;
    about?: string;
    nip05?: string;
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
    // addEventToSession: (pubkey: string, event: NDKEvent) => void; // Removed
    muteItemForSession: (
        pubkey: string,
        value: string,
        itemType: "pubkey" | "hashtag" | "word" | "event",
        publish?: boolean,
    ) => void;
    setMuteListForSession: (pubkey: string, muteListEvent: NDKEvent) => void;
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
    fetchProfiles?: boolean; // Fetch user profile metadata
    fetchFollows?: boolean; // Fetch user follows list
    fetchMuteList?: boolean; // Fetch user mute list
    explicitRelays?: string[]; // Explicit relays to use for this session's NDK
    autoSetActive?: boolean; // Automatically set this session as active upon creation
}