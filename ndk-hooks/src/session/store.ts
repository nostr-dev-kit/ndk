import { create } from "zustand";
import type NDK from "@nostr-dev-kit/ndk";
import type { NDKEvent, NDKUser } from "@nostr-dev-kit/ndk";
import { type SessionState, type UserSessionData, type SessionInitOptions } from "./types";
import { processMuteList } from "./utils.js"; // Assuming a utility function for processing mute lists

// Helper function to create a default session object
const createDefaultSession = (pubkey: string): UserSessionData => ({
    userPubkey: pubkey,
    mutedPubkeys: new Set<string>(),
    mutedHashtags: new Set<string>(),
    mutedWords: new Set<string>(),
    mutedEventIds: new Set<string>(),
    events: new Map<number, NDKEvent[]>(),
    lastActive: Date.now(),
    wot: new Map<string, number>(),
});

export const useNDKSessions = create<SessionState>()((set, get) => ({
    sessions: new Map<string, UserSessionData>(),
    activeSessionPubkey: null,

    // --- Basic Session Management ---

    createSession: (pubkey, initialData = {}) => {
        set((state) => {
            if (state.sessions.has(pubkey)) {
                console.warn(`Session for pubkey ${pubkey} already exists.`);
                return state; // Avoid overwriting existing session unintentionally
            }
            const newSession = { ...createDefaultSession(pubkey), ...initialData };
            const newSessions = new Map(state.sessions);
            newSessions.set(pubkey, newSession);

            // Optionally set the first created session as active
            const activePubkey = state.activeSessionPubkey ?? pubkey;

            return { sessions: newSessions, activeSessionPubkey: activePubkey };
        });
    },

    updateSession: (pubkey, data) => {
        set((state) => {
            const session = state.sessions.get(pubkey);
            if (!session) {
                console.warn(`Attempted to update non-existent session: ${pubkey}`);
                return state;
            }
            const updatedSession = { ...session, ...data, lastActive: Date.now() };
            const newSessions = new Map(state.sessions);
            newSessions.set(pubkey, updatedSession);
            return { sessions: newSessions };
        });
    },

    deleteSession: (pubkey) => {
        set((state) => {
            if (!state.sessions.has(pubkey)) {
                return state; // No change if session doesn't exist
            }
            const newSessions = new Map(state.sessions);
            newSessions.delete(pubkey);

            let newActivePubkey = state.activeSessionPubkey;
            // If the deleted session was the active one, try to set another as active
            if (newActivePubkey === pubkey) {
                const remainingKeys = Array.from(newSessions.keys());
                newActivePubkey = remainingKeys.length > 0 ? remainingKeys[0] : null;
            }

            return { sessions: newSessions, activeSessionPubkey: newActivePubkey };
        });
    },

    setActiveSession: (pubkey) => {
        set((state) => {
            if (pubkey === null || state.sessions.has(pubkey)) {
                // Update lastActive timestamp for the newly active session
                if (pubkey && state.sessions.has(pubkey)) {
                    const session = state.sessions.get(pubkey)!;
                    const updatedSession = { ...session, lastActive: Date.now() };
                    const newSessions = new Map(state.sessions);
                    newSessions.set(pubkey, updatedSession);
                    return { activeSessionPubkey: pubkey, sessions: newSessions };
                }
                // Setting active to null or session doesn't exist (shouldn't happen with check)
                return { activeSessionPubkey: pubkey };
            }
            console.warn(`Attempted to set non-existent session active: ${pubkey}`);
            return state; // Don't change active if the target doesn't exist
        });
    },

    // --- Getters ---

    getSession: (pubkey) => {
        return get().sessions.get(pubkey);
    },

    getActiveSession: () => {
        const activePubkey = get().activeSessionPubkey;
        if (!activePubkey) return undefined;
        return get().sessions.get(activePubkey);
    },

    // --- Session Data Interaction ---

    addEventToSession: (pubkey, event) => {
        set((state) => {
            const session = state.sessions.get(pubkey);
            if (!session) return state;

            const newEvents = new Map(session.events);
            const kindEvents = newEvents.get(event.kind) || [];

            // Avoid duplicates
            if (!kindEvents.some((e) => e.id === event.id)) {
                newEvents.set(event.kind, [...kindEvents, event]);
                const updatedSession = { ...session, events: newEvents };
                const newSessions = new Map(state.sessions);
                newSessions.set(pubkey, updatedSession);
                return { sessions: newSessions };
            }
            return state; // No change if event already exists
        });
    },

    muteItemForSession: (pubkey, value, itemType, publish = true) => {
        set((state) => {
            const session = state.sessions.get(pubkey);
            if (!session) return state;

            const newSession = { ...session }; // Clone session
            let changed = false;

            switch (itemType) {
                case "pubkey":
                    if (!newSession.mutedPubkeys.has(value)) {
                        newSession.mutedPubkeys = new Set(newSession.mutedPubkeys).add(value);
                        changed = true;
                    }
                    break;
                case "hashtag":
                    const lowerCaseValue = value.toLowerCase();
                    if (!newSession.mutedHashtags.has(lowerCaseValue)) {
                        newSession.mutedHashtags = new Set(newSession.mutedHashtags).add(
                            lowerCaseValue,
                        );
                        changed = true;
                    }
                    break;
                case "word":
                    if (!newSession.mutedWords.has(value)) {
                        newSession.mutedWords = new Set(newSession.mutedWords).add(value);
                        changed = true;
                    }
                    break;
                case "event":
                    if (!newSession.mutedEventIds.has(value)) {
                        newSession.mutedEventIds = new Set(newSession.mutedEventIds).add(value);
                        changed = true;
                    }
                    break;
            }

            if (changed) {
                const newSessions = new Map(state.sessions);
                newSessions.set(pubkey, newSession);

                // TODO: Implement publishing the updated mute list if publish is true
                // This would involve:
                // 1. Getting the NDK instance for the session (session.ndk)
                // 2. Constructing a new mute list event (kind 10000)
                // 3. Signing and publishing the event
                if (publish && session.ndk) {
                    console.warn("Publishing updated mute list is not yet implemented.");
                    // Example placeholder:
                    // const updatedMuteListEvent = createMuteListEvent(newSession);
                    // session.ndk.publish(updatedMuteListEvent);
                }

                return { sessions: newSessions };
            }

            return state; // No change if item was already muted
        });
    },

    setMuteListForSession: (pubkey, muteListEvent) => {
        set((state) => {
            const session = state.sessions.get(pubkey);
            if (!session) return state;

            const { mutedPubkeys, mutedHashtags, mutedWords, mutedEventIds } =
                processMuteList(muteListEvent);

            const updatedSession = {
                ...session,
                muteListEvent,
                mutedPubkeys,
                mutedHashtags,
                mutedWords,
                mutedEventIds,
            };
            const newSessions = new Map(state.sessions);
            newSessions.set(pubkey, updatedSession);
            return { sessions: newSessions };
        });
    },

    // --- Initialization ---

    initSession: async (ndk, user, opts = {}, cb) => {
        const pubkey = user.pubkey;
        // Actions need to be accessed via get() inside the async function
        // const { createSession, updateSession, setActiveSession, setMuteListForSession } = get(); // Incorrect usage

        try {
            // 1. Create or Get Session
            let session = get().sessions.get(pubkey); // Use get() here
            if (!session) {
                get().createSession(pubkey, { ndk }); // Use get() to access action
                session = get().sessions.get(pubkey)!; // Re-fetch after creation using get()
            } else if (!session.ndk) {
                // If session exists but lacks NDK instance, update it
                get().updateSession(pubkey, { ndk }); // Use get() to access action
                session = { ...session, ndk }; // Update local copy
            }

            // 2. Set Active (if requested)
            if (opts.autoSetActive !== false) {
                get().setActiveSession(pubkey); // Use get() to access action
            }

            // 3. Fetch Initial Data (Profile, Follows, Mute List) - Run in parallel
            const promises = [];

            // Fetch Profile
            if (opts.fetchProfiles !== false) { // Default to true
                promises.push(
                    user.fetchProfile().then((profileEvent) => {
                        // Ensure content is a string before parsing
                        if (profileEvent?.content && typeof profileEvent.content === 'string') {
                            try {
                                const metadata = JSON.parse(profileEvent.content);
                                get().updateSession(pubkey, { metadata }); // Use get() to access action
                            } catch (e) {
                                console.error("Failed to parse profile metadata", e);
                            }
                        }
                    }),
                );
            }

            // Fetch Follows
            if (opts.fetchFollows) {
                promises.push(
                    user.follows().then((followsSet) => {
                        const follows = Array.from(followsSet).map((u: NDKUser) => u.pubkey); // Add type hint for clarity
                        get().updateSession(pubkey, { follows }); // Use get() to access action
                    }),
                );
            }

            // Fetch Mute List
            if (opts.fetchMuteList) {
                promises.push(
                    ndk.fetchEvent({ kinds: [10000], authors: [pubkey] }).then((muteEvent) => {
                        if (muteEvent) { // Ensure muteEvent is not null/undefined
                            get().setMuteListForSession(pubkey, muteEvent); // Use get() to access action
                        }
                    }),
                );
            }

            await Promise.all(promises);

            cb?.(null, pubkey);
            return pubkey;
        } catch (error) {
            console.error(`Error initializing session for ${pubkey}:`, error);
            cb?.(error as Error);
            return undefined;
        }
    },
}));

// Selector hook for convenience (optional, but common practice)
export const useSession = (pubkey: string) => useNDKSessions((state) => state.sessions.get(pubkey));
export const useActiveSessionData = () =>
    useNDKSessions((state) =>
        state.activeSessionPubkey ? state.sessions.get(state.activeSessionPubkey) : undefined,
    );