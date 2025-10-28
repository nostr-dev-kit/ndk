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
import type { NDKEventWithFrom } from "../../subscribe/hooks";

/**
 * User-specific session data stored within the main store.
 */
export interface NDKUserSession {
    pubkey: Hexpubkey; // Changed from string for clarity

    profile?: NDKUserProfile;
    followSet?: Set<Hexpubkey>;

    /**
     * Events that are unique per kind, part of the session;
     * we will keep subscriptions permanently opened monitoring these
     * event kinds
     */
    events: Map<NDKKind, NDKEvent | null>;

    /**
     * Active subscriptions fetching session data.
     */
    subscriptions: NDKSubscription[];

    /**
     * Last time the session was set to be the active one (in seconds)
     */
    lastActive: number;
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
 * Options for starting a user session subscription.
 * Corresponds to NDK['subscribe'] filters and options.
 */
export interface SessionStartOptions {
    profile?: boolean;

    /**
     * Fetch contacts (follows) for the user - kind 3
     */
    follows?: boolean;

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
}

/**
 * The state structure for the NDK Sessions Zustand store.
 */
export interface NDKSessionsState {
    ndk?: NDK;
    sessions: Map<Hexpubkey, NDKUserSession>;
    signers: Map<Hexpubkey, NDKSigner>;
    activePubkey: Hexpubkey | undefined;

    /** Initializes the store with an NDK instance. */
    init: (ndk: NDK) => void;

    /**
     * Ensures a session exists for the given user or signer.
     * If a signer is provided, it's added to the signers map,
     * its user is fetched, and the session is created/updated.
     * If only a user is provided, ensures a basic session entry exists.
     * Does NOT automatically start the session subscription or set it active.
     * @param userOrSigner - The NDKUser or NDKSigner to add.
     * @param setActive - If true, sets the session as active.
     * @returns The Hexpubkey of the added/ensured session.
     */
    addSession: (userOrSigner: NDKUser | NDKSigner, setActive: boolean) => Promise<Hexpubkey>;

    /**
     * Starts fetching data for a specific session by creating an NDK subscription.
     * Stores the subscription handle to allow stopping it later.
     * @param pubkey - The Hexpubkey of the session to start.
     * @param opts - Subscription options (filters like kinds, authors, etc.).
     */
    startSession: (pubkey: Hexpubkey, opts: SessionStartOptions) => void;

    /**
     * Stops the active data subscription for a specific session.
     * @param pubkey - The Hexpubkey of the session to stop.
     */
    stopSession: (pubkey: Hexpubkey) => void;

    /**
     * Add monitors to the active session
     * @param monitor - Array of monitor items (event constructors or kind numbers)
     */
    addMonitor: (monitor: MonitorItem[]) => void;

    /**
     * Switches the active user session.
     * Sets the `activePubkey` and configures `ndk.signer` if the session has one.
     * @param pubkey - The Hexpubkey of the user to switch to, or null to deactivate.
     */
    switchToUser: (pubkey: Hexpubkey | null) => void;

    /**
     * Removes a session and its associated signer (if present and not used by other sessions).
     * If the removed session was active, attempts to set another session as active.
     * @param pubkey - The Hexpubkey of the session to remove.
     */
    removeSession: (pubkey: Hexpubkey) => void;

    /**
     * Updates the data for an existing session. Used internally.
     * @param pubkey - The Hexpubkey of the session to update.
     * @param data - Partial session data to merge.
     */
    updateSession: (pubkey: Hexpubkey, data: Partial<NDKUserSession>) => void;
}
