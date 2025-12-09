import type NDK from "@nostr-dev-kit/ndk";
import type { Hexpubkey, NDKEvent, NDKKind, NDKSigner, NDKSubscription } from "@nostr-dev-kit/ndk";

/**
 * User session data
 */
export interface NDKSession {
    pubkey: Hexpubkey;
    followSet?: Set<Hexpubkey>;

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
     * Active subscriptions for this session
     */
    subscriptions: NDKSubscription[];

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
 * Monitor item - can be either an event constructor or a raw kind number
 */
export type MonitorItem = NDKEventConstructor | NDKKind;

/**
 * Options for starting a session
 */
export interface SessionStartOptions {
    /**
     * Fetch contacts (follows) - kind 3
     */
    follows?: boolean;

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
     * Monitor specific event kinds and/or event constructors
     * @example
     * ```typescript
     * monitor: [NDKInterestList, 10050, 10051]
     * // Monitors:
     * // - NDKInterestList (wraps with constructor)
     * // - Kind 10050 (as regular NDKEvent)
     * // - Kind 10051 (as regular NDKEvent)
     * ```
     */
    monitor?: MonitorItem[];

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
