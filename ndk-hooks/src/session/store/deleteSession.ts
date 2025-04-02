// src/session/store/deleteSession.ts
import type { StoreApi } from 'zustand';
import type { SessionState } from '../types';

export function deleteSession(
    set: StoreApi<SessionState>['setState'],
    get: StoreApi<SessionState>['getState'], // Added get for consistency
    pubkey: string
): void {
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
            newActivePubkey =
                remainingKeys.length > 0 ? remainingKeys[0] : null;
        }

        return { sessions: newSessions, activeSessionPubkey: newActivePubkey };
    });
}
