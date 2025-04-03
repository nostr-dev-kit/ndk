import type { StoreApi } from 'zustand';
import type { SessionState, UserSessionData } from '../types';

const createDefaultSession = (pubkey: string): UserSessionData => ({
    pubkey,
    mutedPubkeys: new Set<string>(),
    mutedHashtags: new Set<string>(),
    mutedWords: new Set<string>(),
    mutedEventIds: new Set<string>(),
    replaceableEvents: new Map(),
    lastActive: Date.now(),
});

export function createSession(
    set: StoreApi<SessionState>['setState'],
    get: StoreApi<SessionState>['getState'],
    pubkey: string,
    initialData: Partial<UserSessionData> = {}
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
