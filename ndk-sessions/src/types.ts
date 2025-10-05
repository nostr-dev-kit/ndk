import type NDK from "@nostr-dev-kit/ndk";
import type { NDKSubscription } from "@nostr-dev-kit/ndk";
import type { Hexpubkey, NDKEvent, NDKKind, NDKSigner, NDKUser, NDKUserProfile } from "@nostr-dev-kit/ndk";

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
     * Fetch specific replaceable event kinds
     * Map keys are NDKKind, values are the events to fetch
     */
    events?: Map<NDKKind, NDKEvent>;
}

/**
 * Serialized session data for storage
 */
export interface SerializedSession {
    pubkey: Hexpubkey;
    signerPayload?: string; // NDKSigner's toPayload() result
    profile?: NDKUserProfile;
    followSet?: Hexpubkey[];
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
