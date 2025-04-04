import { NDKKind } from '@nostr-dev-kit/ndk';
import { create } from 'zustand';
import { type SessionState, type UserSessionData } from '../types';
import { createSession } from './createSession';
import { deleteSession } from './deleteSession';
import { initializeSession } from './initSession';
import { muteItemForSession } from './muteItemForSession';
import { setActiveSession } from './setActiveSession';
import { processMuteListForSession } from './setMuteListForSession';
import { updateSession } from './updateSession';

export const useNDKSessions = create<SessionState>()((set, get) => ({
    sessions: new Map<string, UserSessionData>(),
    activeSessionPubkey: null,

    // --- Basic Session Management ---
    createSession: (pubkey, initialData) => createSession(set, get, pubkey, initialData),
    updateSession: (pubkey, data) => updateSession(set, get, pubkey, data),
    deleteSession: (pubkey) => deleteSession(set, get, pubkey),
    setActiveSession: (pubkey) => setActiveSession(set, get, pubkey),

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
    muteItemForSession: (pubkey, value, itemType, publish) =>
        muteItemForSession(set, get, pubkey, value, itemType, publish),

    initSession: (ndk, user, opts, cb) => initializeSession(set, get, ndk, user, opts, cb),
}));

useNDKSessions.subscribe((state: SessionState, prevState: SessionState) => {
    if (state.sessions !== prevState.sessions) {
        state.sessions.forEach((session: UserSessionData, pubkey: string) => {
            const prevSession = prevState.sessions.get(pubkey);
            const currentMuteEvent = session.replaceableEvents.get(NDKKind.MuteList);
            const prevMuteEvent = prevSession?.replaceableEvents.get(NDKKind.MuteList);

            if (currentMuteEvent !== prevMuteEvent) {
                console.debug(`Mute list event changed for ${pubkey}, reprocessing...`);
                processMuteListForSession(useNDKSessions.setState, useNDKSessions.getState, pubkey);
            }
        });
    }
});

export const useUserSession = (pubkey?: string) =>
    useNDKSessions((state: SessionState) => {
        const targetPubkey = pubkey ?? state.activeSessionPubkey;
        return targetPubkey ? state.sessions.get(targetPubkey) : undefined;
    });
