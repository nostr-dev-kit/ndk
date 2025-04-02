// src/session/store/createSession.ts
import type { StoreApi } from 'zustand';
import type { SessionState, UserSessionData } from '../types';

// Helper function moved here as it's only used by createSession
const createDefaultSession = (pubkey: string): UserSessionData => ({
    userPubkey: pubkey,
    mutedPubkeys: new Set<string>(),
    mutedHashtags: new Set<string>(),
    mutedWords: new Set<string>(),
    mutedEventIds: new Set<string>(),
    replaceableEvents: new Map(), // Initialize replaceableEvents
    // contactsEvent: undefined, // Removed
    lastActive: Date.now(),
    wot: new Map<string, number>(),
});

export function createSession(
    set: StoreApi<SessionState>['setState'],
    get: StoreApi<SessionState>['getState'], // Added get for consistency, though not used here
    pubkey: string,
    initialData: Partial<UserSessionData> = {}
): void {
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
}
