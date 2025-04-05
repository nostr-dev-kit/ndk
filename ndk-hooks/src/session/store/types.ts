import type NDK from "@nostr-dev-kit/ndk";
import type { NDKFilter, NDKSubscription } from "@nostr-dev-kit/ndk";
import type { Hexpubkey, NDKEvent, NDKKind, NDKUser, NDKUserProfile, NDKSigner } from "@nostr-dev-kit/ndk";
import { NDKEventWithFrom } from "../../subscribe/hooks";

/**
 * User-specific session data stored within the main store.
 */
export interface NDKUserSession {
    pubkey: Hexpubkey; // Changed from string for clarity
    mutedPubkeys: Set<Hexpubkey>; // Changed from string
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
    events: Map<NDKKind, NDKEvent | null>;

    /**
     * The active subscription fetching session data.
     */
    subscription?: NDKSubscription;

    /**
     * Last time the session was set to be the active one (in seconds)
     */
    lastActive: number;
}

/**
 * Options for starting a user session subscription.
 * Corresponds to NDK['subscribe'] filters and options.
 */
export interface SessionStartOptions {
    profile?: boolean;
    follows?: boolean;
    muteList?: boolean;

    /**
     * Fetch other specific replaceable event kinds (10k-20k, 30k-40k).
     * Provide a map where keys are NDKKind and values are optional NDKFilters
     * to apply specifically to that kind (e.g., for NIP-65 relay lists).
     * If the value is null or undefined, a default filter `{ authors: [pubkey], kinds: [kind], limit: 1 }` is used.
     */
    events?: Map<NDKKind, NDKEventWithFrom<NDKEvent>>;
}

/**
 * The state structure for the NDK Sessions Zustand store.
 */
export interface NDKSessionsState {
    ndk?: NDK;
    sessions: Map<Hexpubkey, NDKUserSession>;
    signers: Map<Hexpubkey, NDKSigner>;
    activePubkey: Hexpubkey | null;

    /** Initializes the store with an NDK instance. */
    init: (ndk: NDK) => void;

    /**
     * Ensures a session exists for the given user or signer.
     * If a signer is provided, it's added to the signers map,
     * its user is fetched, and the session is created/updated.
     * If only a user is provided, ensures a basic session entry exists.
     * Does NOT automatically start the session subscription or set it active.
     * @param userOrSigner - The NDKUser or NDKSigner to add.
     * @returns The Hexpubkey of the added/ensured session.
     */
    addSession: (userOrSigner: NDKUser | NDKSigner) => Promise<Hexpubkey>;

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

    // Removed functions based on requirements:
    // - addSigner
    // - removeSigner
    // - muteItemForSession
}
