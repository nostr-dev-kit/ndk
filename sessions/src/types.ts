import type NDK from "@nostr-dev-kit/ndk";
import type {
    Hexpubkey,
    NDKEvent,
    NDKKind,
    NDKSigner,
    NDKSubscription,
    NDKUser,
    NDKUserProfile,
} from "@nostr-dev-kit/ndk";

/**
 * User session data
 */
export interface NDKSession {
    pubkey: Hexpubkey;
    profile?: NDKUserProfile;
    followSet?: Set<Hexpubkey>;

    /**
     * Follows per kind (e.g., NIP-51 follow lists)
     * Map<kind, Map<pubkey, { followed, last_updated_at }>>
     */
    kindFollowSet?: Map<NDKKind, Map<Hexpubkey, { followed: boolean; last_updated_at: number }>>;

    /**
     * Muted IDs (from kind 10000)
     * Map<id, type> where type is "p" for pubkey or "e" for event
     */
    muteSet?: Map<string, string>;

    /**
     * Muted words (from kind 10000 "word" tags)
     */
    mutedWords?: Set<string>;

    /**
     * Blocked relay URLs (from kind 10001)
     */
    blockedRelays?: Set<string>;

    /**
     * User's relay list (from kind 10002)
     */
    relayList?: Map<string, { read: boolean; write: boolean }>;

    /**
     * Events that are unique per kind (replaceable events)
     */
    events: Map<NDKKind, NDKEvent | null>;

    /**
     * Active subscription for this session
     */
    subscription?: NDKSubscription;

    /**
     * Last time this session was active (seconds)
     */
    lastActive: number;
}

/**
 * Options for starting a session
 */
export interface SessionStartOptions {
    /**
     * Fetch user profile
     */
    profile?: boolean;

    /**
     * Fetch contacts (follows)
     * - true: Fetch default contact list (kind 3)
     * - false: Don't fetch contacts
     * - NDKKind[]: Fetch contact list + kind-scoped follows
     */
    follows?: boolean | NDKKind[];

    /**
     * Fetch mute list (kind 10000)
     */
    mutes?: boolean;

    /**
     * Fetch blocked relay list (kind 10001)
     */
    blockedRelays?: boolean;

    /**
     * Fetch user's relay list (kind 10002)
     */
    relayList?: boolean;

    /**
     * Fetch specific replaceable event kinds
     * Map keys are NDKKind, values are the events to fetch
     */
    events?: Map<NDKKind, NDKEvent>;

    /**
     * Set the muteFilter on NDK based on session's mute data
     * @default true
     */
    setMuteFilter?: boolean;

    /**
     * Set the relayConnectionFilter on NDK based on session's blocked relays
     * @default true
     */
    setRelayConnectionFilter?: boolean;
}

/**
 * Serialized session data for storage
 */
export interface SerializedSession {
    pubkey: Hexpubkey;
    signerPayload?: string; // NDKSigner's toPayload() result
    profile?: NDKUserProfile;
    followSet?: Hexpubkey[];
    muteSet?: Array<[string, string]>; // Serialized as array of tuples
    mutedWords?: string[];
    blockedRelays?: string[];
    relayList?: Array<[string, { read: boolean; write: boolean }]>; // Serialized as array of tuples
    lastActive: number;
}

/**
 * Session store state
 */
export interface SessionState {
    ndk?: NDK;
    sessions: Map<Hexpubkey, NDKSession>;
    signers: Map<Hexpubkey, NDKSigner>;
    activePubkey?: Hexpubkey;
}

/**
 * Login options
 */
export interface LoginOptions extends SessionStartOptions {
    /**
     * Set this session as active immediately
     */
    setActive?: boolean;
}
