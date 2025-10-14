import type NDK from "@nostr-dev-kit/ndk";
import type { Hexpubkey, NDKEvent, NDKKind, NDKSigner, NDKSubscription } from "@nostr-dev-kit/ndk";

/**
 * User session data
 */
export interface NDKSession {
    pubkey: Hexpubkey;
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

    /**
     * User preferences for this session
     */
    preferences?: SessionPreferences;
}

/**
 * Event class constructor with static kinds property and from method
 */
export interface NDKEventConstructor {
    kinds: NDKKind[];
    from(event: NDKEvent): NDKEvent;
}

/**
 * Options for starting a session
 */
export interface SessionStartOptions {
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
     * Fetch NIP-60 wallet (kind 17375)
     */
    wallet?: boolean;

    /**
     * Fetch specific replaceable event kinds
     * Map keys are NDKKind, values are event class constructors with a static from method
     */
    events?: Map<NDKKind, { from(event: NDKEvent): NDKEvent }>;

    /**
     * Event class constructors to register for automatic wrapping
     * This is a more ergonomic alternative to the events option
     * @example
     * ```typescript
     * eventConstructors: [NDKBlossomList, NDKArticle]
     * // Instead of:
     * // events: new Map([[NDKKind.BlossomList, NDKBlossomList], [NDKKind.Article, NDKArticle]])
     * ```
     */
    eventConstructors?: NDKEventConstructor[];

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
 * User preferences for a session
 */
export interface SessionPreferences {
    /**
     * Whether wallet fetching should be enabled for this session
     */
    walletEnabled?: boolean;
}

/**
 * Serialized session data for storage
 * Only persists identity and signer - all data comes from NDK cache
 */
export interface SerializedSession {
    pubkey: Hexpubkey;
    signerPayload?: string; // NDKSigner's toPayload() result
    lastActive: number;
    preferences?: SessionPreferences;
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
