import { NDKKind } from '@nostr-dev-kit/ndk'; // Import NDKKind
import { create } from 'zustand'; // Import StateCreator and StoreApi
import { type SessionState, type UserSessionData } from '../types';
import { createSession } from './createSession';
import { deleteSession } from './deleteSession';
// processMuteList is now only used in setMuteListForSession.ts
import { initializeSession } from './initSession';
import { muteItemForSession } from './muteItemForSession';
import { setActiveSession } from './setActiveSession';
import { processMuteListForSession } from './setMuteListForSession'; // Renamed function
import { updateSession } from './updateSession';

// createDefaultSession moved to createSession.ts

// Create and export the store
export const useNDKSessions = create<SessionState>()((set, get) => ({
    sessions: new Map<string, UserSessionData>(),
    activeSessionPubkey: null,

    // --- Basic Session Management ---
    // Bind extracted functions
    createSession: (pubkey, initialData) =>
        createSession(set, get, pubkey, initialData),
    updateSession: (pubkey, data) => updateSession(set, get, pubkey, data),
    deleteSession: (pubkey) => deleteSession(set, get, pubkey),
    setActiveSession: (pubkey) => setActiveSession(set, get, pubkey),

    // --- Getters (remain inline as they are short) ---
    getSession: (pubkey) => {
        return get().sessions.get(pubkey);
    },
    getActiveSession: () => {
        const activePubkey = get().activeSessionPubkey;
        if (!activePubkey) return undefined;
        return get().sessions.get(activePubkey);
    },

    // --- Session Data Interaction (bind extracted functions) ---
    muteItemForSession: (pubkey, value, itemType, publish) =>
        muteItemForSession(set, get, pubkey, value, itemType, publish),

    initSession: (ndk, user, opts, cb) =>
        initializeSession(set, get, ndk, user, opts, cb),
})); // End of create function call

// Removed leftover comment
// Subscribe to store changes to reactively process mute lists
// This needs to be outside the create() call
useNDKSessions.subscribe((state: SessionState, prevState: SessionState) => {
    // Check if sessions map changed
    if (state.sessions !== prevState.sessions) {
        state.sessions.forEach((session: UserSessionData, pubkey: string) => {
            const prevSession = prevState.sessions.get(pubkey);
            const currentMuteEvent = session.replaceableEvents.get(
                NDKKind.MuteList
            );
            const prevMuteEvent = prevSession?.replaceableEvents.get(
                NDKKind.MuteList
            );

            // If the mute list event for this session has changed, reprocess it
            if (currentMuteEvent !== prevMuteEvent) {
                console.debug(
                    `Mute list event changed for ${pubkey}, reprocessing...`
                );
                // Use the store's internal methods directly
                processMuteListForSession(
                    useNDKSessions.setState,
                    useNDKSessions.getState,
                    pubkey
                );
            }
        });
    }
});

// Selector hook for convenience (optional, but common practice)
export const useUserSession = (pubkey?: string) =>
    useNDKSessions((state: SessionState) => {
        const targetPubkey = pubkey ?? state.activeSessionPubkey;
        return targetPubkey ? state.sessions.get(targetPubkey) : undefined;
    });
