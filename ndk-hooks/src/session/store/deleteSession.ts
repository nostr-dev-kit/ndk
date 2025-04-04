import type { StoreApi } from 'zustand';
import type { SessionState } from '../types';

export function deleteSession(
    set: StoreApi<SessionState>['setState'],
    get: StoreApi<SessionState>['getState'],
    pubkey: string
): void {
    set((state) => {
        if (!state.sessions.has(pubkey)) {
            return state;
        }
        const newSessions = new Map(state.sessions);
        newSessions.delete(pubkey);

        let newActivePubkey = state.activeSessionPubkey;
        if (newActivePubkey === pubkey) {
            const remainingKeys = Array.from(newSessions.keys());
            newActivePubkey = remainingKeys.length > 0 ? remainingKeys[0] : null;
        }

        return { sessions: newSessions, activeSessionPubkey: newActivePubkey };
    });
}
