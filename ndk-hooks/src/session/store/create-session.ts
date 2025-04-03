import type { StoreApi } from 'zustand';
import type { NDKUserSession } from './types';
import type { NDKSessionsState } from './index'; // Import the correct state type

const createDefaultSession = (pubkey: string): NDKUserSession => ({
    pubkey,
    mutedPubkeys: new Set<string>(),
    mutedHashtags: new Set<string>(),
    mutedWords: new Set<string>(),
    mutedEventIds: new Set<string>(),
    replaceableEvents: new Map(),
    lastActive: Date.now(),
});

export function createSession(
    set: StoreApi<NDKSessionsState>['setState'],
    get: StoreApi<NDKSessionsState>['getState'],
    pubkey: string,
    initialData: Partial<NDKUserSession> = {}
): void {
    set((state) => {
        if (state.sessions.has(pubkey)) {
            console.warn(`Session for pubkey ${pubkey} already exists.`);
            return state;
        }
        const newSession = { ...createDefaultSession(pubkey), ...initialData };
        const newSessions = new Map(state.sessions);
        newSessions.set(pubkey, newSession);

        const activePubkey = state.activeSessionPubkey ?? pubkey;

        return { sessions: newSessions, activeSessionPubkey: activePubkey };
    });
}
