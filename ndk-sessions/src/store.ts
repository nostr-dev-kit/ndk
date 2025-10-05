import { createStore } from 'zustand/vanilla';
import type NDK from "@nostr-dev-kit/ndk";
import { NDKUser, NDKKind } from "@nostr-dev-kit/ndk";
import type { Hexpubkey, NDKSigner, NDKEvent } from "@nostr-dev-kit/ndk";
import type { NDKSession, SessionStartOptions, SessionState } from "./types";
import { SessionNotFoundError, NDKNotInitializedError } from "./utils/errors";

export interface SessionStoreActions {
    /**
     * Initialize the store with an NDK instance
     */
    init: (ndk: NDK) => void;

    /**
     * Add a session for a user or signer
     */
    addSession: (userOrSigner: NDKUser | NDKSigner, setActive: boolean) => Promise<Hexpubkey>;

    /**
     * Start fetching data for a session
     */
    startSession: (pubkey: Hexpubkey, opts: SessionStartOptions) => void;

    /**
     * Stop fetching data for a session
     */
    stopSession: (pubkey: Hexpubkey) => void;

    /**
     * Switch to a different session
     */
    switchToUser: (pubkey: Hexpubkey | null) => void;

    /**
     * Remove a session
     */
    removeSession: (pubkey: Hexpubkey) => void;

    /**
     * Update session data
     */
    updateSession: (pubkey: Hexpubkey, data: Partial<NDKSession>) => void;
}

export type SessionStore = SessionState & SessionStoreActions;

/**
 * Create a session store
 */
export function createSessionStore() {
    return createStore<SessionStore>((set, get) => ({
        sessions: new Map(),
        signers: new Map(),
        activePubkey: undefined,

        init: (ndk: NDK) => {
            set({ ndk });
        },

        addSession: async (userOrSigner: NDKUser | NDKSigner, setActive: boolean): Promise<Hexpubkey> => {
            const state = get();
            let user: NDKUser;
            let signer: NDKSigner | undefined;

            // Check if it's a signer
            if ('user' in userOrSigner && typeof userOrSigner.user === 'function') {
                signer = userOrSigner as NDKSigner;
                user = await signer.user();
            } else {
                user = userOrSigner as NDKUser;
            }

            const pubkey = user.pubkey;

            // Create or update session
            const existingSession = state.sessions.get(pubkey);
            const session: NDKSession = existingSession || {
                pubkey,
                events: new Map(),
                lastActive: setActive ? Math.floor(Date.now() / 1000) : 0,
            };

            // Update maps
            const newSessions = new Map(state.sessions);
            newSessions.set(pubkey, session);

            const updates: Partial<SessionState> = { sessions: newSessions };

            if (signer) {
                const newSigners = new Map(state.signers);
                newSigners.set(pubkey, signer);
                updates.signers = newSigners;
            }

            if (setActive) {
                updates.activePubkey = pubkey;
                if (state.ndk && signer) {
                    state.ndk.signer = signer;
                }
            }

            set(updates);
            return pubkey;
        },

        startSession: (pubkey: Hexpubkey, opts: SessionStartOptions) => {
            const state = get();
            const { ndk, sessions } = state;

            if (!ndk) {
                throw new NDKNotInitializedError();
            }

            const session = sessions.get(pubkey);
            if (!session) {
                throw new SessionNotFoundError(pubkey);
            }

            // Stop existing subscription if any
            if (session.subscription) {
                session.subscription.stop();
            }

            // Build subscription kinds
            const kinds = buildSubscriptionKinds(opts);
            if (kinds.length === 0) {
                return; // Nothing to fetch
            }

            // Create subscription
            const subscription = ndk.subscribe(
                {
                    kinds,
                    authors: [pubkey],
                },
                { closeOnEose: false }
            );

            // Handle events
            subscription.on('event', (event) => handleIncomingEvent(event, pubkey, get));

            // Update session with subscription
            get().updateSession(pubkey, { subscription });
        },

        stopSession: (pubkey: Hexpubkey) => {
            const state = get();
            const session = state.sessions.get(pubkey);

            if (session?.subscription) {
                session.subscription.stop();
                get().updateSession(pubkey, { subscription: undefined });
            }
        },

        switchToUser: (pubkey: Hexpubkey | null) => {
            const state = get();

            if (pubkey === null) {
                set({ activePubkey: undefined });
                if (state.ndk) {
                    state.ndk.signer = undefined;
                }
                return;
            }

            const session = state.sessions.get(pubkey);
            if (!session) {
                throw new SessionNotFoundError(pubkey);
            }

            const signer = state.signers.get(pubkey);

            // Update session last active time
            get().updateSession(pubkey, { lastActive: Math.floor(Date.now() / 1000) });

            // Switch active session
            set({ activePubkey: pubkey });

            // Update NDK signer
            if (state.ndk) {
                state.ndk.signer = signer;
            }
        },

        removeSession: (pubkey: Hexpubkey) => {
            const state = get();

            // Stop subscription
            get().stopSession(pubkey);

            // Remove from maps
            const newSessions = new Map(state.sessions);
            const newSigners = new Map(state.signers);
            newSessions.delete(pubkey);
            newSigners.delete(pubkey);

            const updates: Partial<SessionState> = {
                sessions: newSessions,
                signers: newSigners,
            };

            // If this was the active session, switch to another
            if (state.activePubkey === pubkey) {
                const remainingSessions = Array.from(newSessions.keys());
                if (remainingSessions.length > 0) {
                    updates.activePubkey = remainingSessions[0];
                    if (state.ndk) {
                        state.ndk.signer = newSigners.get(remainingSessions[0]);
                    }
                } else {
                    updates.activePubkey = undefined;
                    if (state.ndk) {
                        state.ndk.signer = undefined;
                    }
                }
            }

            set(updates);
        },

        updateSession: (pubkey: Hexpubkey, data: Partial<NDKSession>) => {
            const state = get();
            const session = state.sessions.get(pubkey);

            if (!session) {
                return;
            }

            const updatedSession = { ...session, ...data };
            const newSessions = new Map(state.sessions);
            newSessions.set(pubkey, updatedSession);

            set({ sessions: newSessions });
        },
    }));
}

/**
 * Build subscription kinds array based on session options.
 * Centralizes the logic for determining which event kinds to subscribe to.
 */
function buildSubscriptionKinds(opts: SessionStartOptions): NDKKind[] {
    const kinds: NDKKind[] = [];

    if (opts.profile) {
        kinds.push(0); // Profile metadata
    }

    if (opts.follows) {
        kinds.push(3); // Contact list
        if (Array.isArray(opts.follows)) {
            kinds.push(...opts.follows);
        }
    }

    if (opts.events) {
        for (const kind of opts.events.keys()) {
            kinds.push(kind);
        }
    }

    return kinds;
}

/**
 * Handle incoming event from subscription.
 * Processes profiles, follows, and other events appropriately.
 */
function handleIncomingEvent(
    event: NDKEvent,
    pubkey: Hexpubkey,
    getState: () => SessionStore
): void {
    const currentSession = getState().sessions.get(pubkey);
    if (!currentSession) return;

    // Process profile metadata
    if (event.kind === 0) {
        handleProfileEvent(event, pubkey, getState);
        return;
    }

    // Process contact list
    if (event.kind === 3) {
        handleContactListEvent(event, pubkey, getState);
        return;
    }

    // Store other replaceable events
    handleReplaceableEvent(event, currentSession, pubkey, getState);
}

/**
 * Process profile metadata event
 */
function handleProfileEvent(
    event: NDKEvent,
    pubkey: Hexpubkey,
    getState: () => SessionStore
): void {
    try {
        const profile = JSON.parse(event.content);
        getState().updateSession(pubkey, { profile });
    } catch (error) {
        console.error('Failed to parse profile:', error);
    }
}

/**
 * Process contact list event
 */
function handleContactListEvent(
    event: NDKEvent,
    pubkey: Hexpubkey,
    getState: () => SessionStore
): void {
    const followSet = new Set<Hexpubkey>();
    for (const tag of event.tags) {
        if (tag[0] === 'p' && tag[1]) {
            followSet.add(tag[1]);
        }
    }
    getState().updateSession(pubkey, { followSet });
}

/**
 * Store replaceable event
 */
function handleReplaceableEvent(
    event: NDKEvent,
    session: NDKSession,
    pubkey: Hexpubkey,
    getState: () => SessionStore
): void {
    if (event.kind === undefined) return;
    
    session.events.set(event.kind, event);
    getState().updateSession(pubkey, { events: new Map(session.events) });
}
