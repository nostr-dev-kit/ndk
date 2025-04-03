import type { StoreApi } from 'zustand';
import type { NDKSessionsState } from './index'; // Import the correct state type

export function setActiveSession(
    set: StoreApi<NDKSessionsState>['setState'],
    get: StoreApi<NDKSessionsState>['getState'],
    pubkey: string | null
): void {
    set((state) => {
        if (pubkey === null || state.sessions.has(pubkey)) {
            if (pubkey && state.sessions.has(pubkey)) {
                const session = state.sessions.get(pubkey);
                if (!session) {
                    // Should not happen due to the check on line 11, but safety first
                    console.warn(`Session ${pubkey} unexpectedly missing in setActiveSession.`);
                    return state;
                }
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
