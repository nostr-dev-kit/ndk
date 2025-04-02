// src/session/store/updateSession.ts
import type { StoreApi } from 'zustand';
import type { SessionState, UserSessionData } from '../types';

export function updateSession(
    set: StoreApi<SessionState>['setState'],
    get: StoreApi<SessionState>['getState'], // Added get for consistency
    pubkey: string,
    data: Partial<UserSessionData>
): void {
    set((state) => {
        const session = state.sessions.get(pubkey);
        if (!session) {
            console.warn(`Attempted to update non-existent session: ${pubkey}`);
            return state;
        }
        // Ensure lastActive is always updated on any update
        const updatedSession = { ...session, ...data, lastActive: Date.now() };
        const newSessions = new Map(state.sessions);
        newSessions.set(pubkey, updatedSession);
        return { sessions: newSessions };
    });
}
