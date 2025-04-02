import type { StoreApi } from 'zustand';
import type { SessionState } from '../types';

export function setActiveSession(
    set: StoreApi<SessionState>['setState'],
    get: StoreApi<SessionState>['getState'],
    pubkey: string | null
): void {
    set((state) => {
        if (pubkey === null || state.sessions.has(pubkey)) {
            if (pubkey && state.sessions.has(pubkey)) {
                const session = state.sessions.get(pubkey)!;
                const updatedSession = { ...session, lastActive: Date.now() };
                const newSessions = new Map(state.sessions);
                newSessions.set(pubkey, updatedSession);
                return { activeSessionPubkey: pubkey, sessions: newSessions };
            }
            return { activeSessionPubkey: pubkey };
        }
        console.warn(`Attempted to set non-existent session active: ${pubkey}`);
        return state;
    });
}
