import type NDK from "@nostr-dev-kit/ndk";
import { type Hexpubkey, isValidPubkey, type NDKEvent, NDKKind, NDKRelayList, type NDKSigner, type NDKUser } from "@nostr-dev-kit/ndk";
import { createStore } from "zustand/vanilla";
import type { NDKSession, SessionStartOptions, SessionState } from "./types";
import { NDKNotInitializedError, SessionNotFoundError } from "./utils/errors";

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
            if ("user" in userOrSigner && typeof userOrSigner.user === "function") {
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
                { closeOnEose: false, subId: "session" },
                {
                    onEvent: (event) => handleIncomingEvent(event, pubkey, get),
                },
            );

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
                    // Clear filters when no session is active
                    state.ndk.muteFilter = undefined;
                    state.ndk.relayConnectionFilter = undefined;
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

            // Update NDK signer and filters
            if (state.ndk) {
                state.ndk.signer = signer;

                // Set muteFilter based on session's mute data
                if (session.muteSet || session.mutedWords) {
                    state.ndk.muteFilter = (event) => {
                        // Check if author is muted
                        if (session.muteSet?.has(event.pubkey)) return true;

                        // Check if event ID is muted
                        if (event.id && session.muteSet?.has(event.id)) return true;

                        // Check if content contains muted words
                        if (event.content && session.mutedWords && session.mutedWords.size > 0) {
                            const lowerContent = event.content.toLowerCase();
                            for (const word of session.mutedWords) {
                                if (lowerContent.includes(word)) return true;
                            }
                        }

                        return false;
                    };
                } else {
                    state.ndk.muteFilter = undefined;
                }

                // Set relayConnectionFilter based on session's blocked relays
                if (session.blockedRelays && session.blockedRelays.size > 0) {
                    const blockedRelays = session.blockedRelays;
                    state.ndk.relayConnectionFilter = (relayUrl) => {
                        // Block connection if relay is in blockedRelays
                        return !blockedRelays.has(relayUrl);
                    };
                } else {
                    state.ndk.relayConnectionFilter = undefined;
                }
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

            // If this was the active session, handle active state
            if (state.activePubkey === pubkey) {
                const remainingSessions = Array.from(newSessions.keys());
                if (remainingSessions.length === 0) {
                    // No sessions left, clear active state
                    updates.activePubkey = undefined;
                    if (state.ndk) {
                        state.ndk.signer = undefined;
                        state.ndk.muteFilter = undefined;
                        state.ndk.relayConnectionFilter = undefined;
                    }
                }
            }

            // Apply the session removal
            set(updates);

            // After removing, switch to another session if needed
            if (state.activePubkey === pubkey) {
                const remainingSessions = Array.from(newSessions.keys());
                if (remainingSessions.length > 0) {
                    // Switch to the next available session
                    get().switchToUser(remainingSessions[0]);
                }
            }
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

    if (opts.follows) {
        kinds.push(NDKKind.Contacts); // Contact list
        if (Array.isArray(opts.follows)) {
            kinds.push(...opts.follows);
        }
    }

    if (opts.mutes) {
        kinds.push(NDKKind.MuteList); // Mute list
    }

    if (opts.blockedRelays) {
        kinds.push(NDKKind.BlockRelayList); // Block relay list
    }

    if (opts.relayList) {
        kinds.push(NDKKind.RelayList); // User relay list
    }

    if (opts.wallet) {
        kinds.push(NDKKind.CashuWallet, NDKKind.CashuMintList); // NIP-60 wallet
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
 * Processes follows, mutes, and other events appropriately.
 */
function handleIncomingEvent(event: NDKEvent, pubkey: Hexpubkey, getState: () => SessionStore): void {
    const currentSession = getState().sessions.get(pubkey);
    if (!currentSession) return;

    // Process contact list
    if (event.kind === NDKKind.Contacts) {
        handleContactListEvent(event, pubkey, getState);
        return;
    }

    // Process mute list
    if (event.kind === NDKKind.MuteList) {
        handleMuteListEvent(event, pubkey, getState);
        return;
    }

    // Process block relay list
    if (event.kind === NDKKind.BlockRelayList) {
        handleBlockRelayListEvent(event, pubkey, getState);
        return;
    }

    // Process user relay list
    if (event.kind === NDKKind.RelayList) {
        handleRelayListEvent(event, pubkey, getState);
        return;
    }

    // Store other replaceable events
    handleReplaceableEvent(event, currentSession, pubkey, getState);
}

/**
 * Process contact list event
 */
function handleContactListEvent(event: NDKEvent, pubkey: Hexpubkey, getState: () => SessionStore): void {
    const session = getState().sessions.get(pubkey);
    if (!session || event.kind === undefined) return;

    const existingEvent = session.events.get(event.kind);
    if (existingEvent) {
        if (existingEvent.id === event.id) return;
        if ((existingEvent.created_at ?? 0) > (event.created_at ?? 0)) return;
    }

    const followSet = new Set<Hexpubkey>();
    for (const tag of event.tags) {
        if (tag[0] === "p" && tag[1] && isValidPubkey(tag[1])) {
            followSet.add(tag[1]);
        }
    }

    // Update both followSet and store the event
    session.events.set(event.kind, event);
    getState().updateSession(pubkey, { followSet, events: new Map(session.events) });
}

/**
 * Process mute list event (kind 10000)
 */
function handleMuteListEvent(event: NDKEvent, pubkey: Hexpubkey, getState: () => SessionStore): void {
    const session = getState().sessions.get(pubkey);
    if (!session || event.kind === undefined) return;

    const existingEvent = session.events.get(event.kind);
    if (existingEvent) {
        if (existingEvent.id === event.id) return;
        if ((existingEvent.created_at ?? 0) > (event.created_at ?? 0)) return;
    }

    const muteSet = new Map<string, string>();
    const mutedWords = new Set<string>();

    for (const tag of event.tags) {
        // Handle muted pubkeys and events
        if ((tag[0] === "p" || tag[0] === "e") && tag[1]) {
            muteSet.set(tag[1], tag[0]);
        }
        // Handle muted words
        if (tag[0] === "word" && tag[1]) {
            mutedWords.add(tag[1].toLowerCase());
        }
    }

    // Update both mute data and store the event
    session.events.set(event.kind, event);
    getState().updateSession(pubkey, { muteSet, mutedWords, events: new Map(session.events) });
}

/**
 * Process block relay list event (kind 10001)
 */
function handleBlockRelayListEvent(event: NDKEvent, pubkey: Hexpubkey, getState: () => SessionStore): void {
    const session = getState().sessions.get(pubkey);
    if (!session || event.kind === undefined) return;

    const existingEvent = session.events.get(event.kind);
    if (existingEvent) {
        if (existingEvent.id === event.id) return;
        if ((existingEvent.created_at ?? 0) > (event.created_at ?? 0)) return;
    }

    const blockedRelays = new Set<string>();

    for (const tag of event.tags) {
        if (tag[0] === "relay" && tag[1]) {
            blockedRelays.add(tag[1]);
        }
    }

    // Update both blockedRelays and store the event
    session.events.set(event.kind, event);
    getState().updateSession(pubkey, { blockedRelays, events: new Map(session.events) });
}

/**
 * Process user relay list event (kind 10002)
 */
function handleRelayListEvent(event: NDKEvent, pubkey: Hexpubkey, getState: () => SessionStore): void {
    const session = getState().sessions.get(pubkey);
    if (!session || event.kind === undefined) return;

    const existingEvent = session.events.get(event.kind);
    if (existingEvent) {
        if (existingEvent.id === event.id) return;
        if ((existingEvent.created_at ?? 0) > (event.created_at ?? 0)) return;
    }

    const relayListEvent = NDKRelayList.from(event);
    const relayList = new Map<string, { read: boolean; write: boolean }>();

    // Add read-only relays
    for (const url of relayListEvent.readRelayUrls) {
        relayList.set(url, { read: true, write: false });
    }

    // Add write-only relays
    for (const url of relayListEvent.writeRelayUrls) {
        const existing = relayList.get(url);
        if (existing) {
            existing.write = true;
        } else {
            relayList.set(url, { read: false, write: true });
        }
    }

    // Add both read and write relays
    for (const url of relayListEvent.bothRelayUrls) {
        relayList.set(url, { read: true, write: true });
    }

    // Update both relayList and store the event
    session.events.set(event.kind, event);
    getState().updateSession(pubkey, { relayList, events: new Map(session.events) });
}

/**
 * Store replaceable event
 */
function handleReplaceableEvent(
    event: NDKEvent,
    session: NDKSession,
    pubkey: Hexpubkey,
    getState: () => SessionStore,
): void {
    if (event.kind === undefined) return;

    const existingEvent = session.events.get(event.kind);

    // Skip if we already have this exact event or a newer one
    if (existingEvent) {
        if (existingEvent.id === event.id) return;
        if ((existingEvent.created_at ?? 0) > (event.created_at ?? 0)) return;
    }

    session.events.set(event.kind, event);
    getState().updateSession(pubkey, { events: new Map(session.events) });
}
