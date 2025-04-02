import type NDK from '@nostr-dev-kit/ndk';
import type {
    Hexpubkey,
    NDKEvent,
    NDKKind,
    NDKUser,
    NDKUserProfile,
} from '@nostr-dev-kit/ndk';

/**
 * User-specific session data stored within the main store.
 */
export interface UserSessionData {
    userPubkey: string;
    ndk?: NDK;
    relays?: string[];
    mutedPubkeys: Set<string>;
    mutedHashtags: Set<string>;
    mutedWords: Set<string>;
    mutedEventIds: Set<string>;

    profile?: NDKUserProfile;
    followSet?: Set<Hexpubkey>;

    /**
     * Events that are unique per kind, part of the session;
     * we will keep a subscription permanently opened monitoring this
     * event kinds
     */
    replaceableEvents: Map<NDKKind, NDKEvent | null>;

    lastActive: number;

    wot?: Map<string, number>;
}

/**
 * The overall state managed by the Zustand store.
 */
export interface SessionState {
    sessions: Map<string, UserSessionData>;
    activeSessionPubkey: string | null;

    createSession: (
        pubkey: string,
        initialData?: Partial<UserSessionData>
    ) => void;
    updateSession: (pubkey: string, data: Partial<UserSessionData>) => void;
    deleteSession: (pubkey: string) => void;
    setActiveSession: (pubkey: string | null) => void;
    getSession: (pubkey: string) => UserSessionData | undefined;
    getActiveSession: () => UserSessionData | undefined;
    muteItemForSession: (
        pubkey: string,
        value: string,
        itemType: 'pubkey' | 'hashtag' | 'word' | 'event',
        publish?: boolean
    ) => void;
    initSession: (
        ndk: NDK,
        user: NDKUser,
        opts?: SessionInitOptions,
        cb?: (error: Error | null, pubkey?: string) => void
    ) => Promise<string | undefined>;
}

/**
 * Session initialization options
 */
export interface SessionInitOptions {
    profile?: boolean;
    follows?: boolean;
    muteList?: boolean;
    events?: Map<NDKKind, { wrap?: { from: (event: NDKEvent) => NDKEvent } }>;
    autoSetActive?: boolean;
}
