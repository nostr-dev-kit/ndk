// src/session/store/setActiveSession.ts
import type { StoreApi } from "zustand";
import type { SessionState } from "../types";

export function setActiveSession(
    set: StoreApi<SessionState>['setState'],
    get: StoreApi<SessionState>['getState'], // Added get for consistency
    pubkey: string | null,
): void {
    set((state) => {
        if (pubkey === null || state.sessions.has(pubkey)) {
            // Update lastActive timestamp for the newly active session
            if (pubkey && state.sessions.has(pubkey)) {
                const session = state.sessions.get(pubkey)!;
                // Avoid unnecessary update if already active and timestamp is recent? No, update always.
                const updatedSession = { ...session, lastActive: Date.now() };
                const newSessions = new Map(state.sessions);
                newSessions.set(pubkey, updatedSession);
                return { activeSessionPubkey: pubkey, sessions: newSessions };
            }
            // Setting active to null or session doesn't exist (shouldn't happen with check)
            return { activeSessionPubkey: pubkey };
        }
        console.warn(`Attempted to set non-existent session active: ${pubkey}`);
        return state; // Don't change active if the target doesn't exist
    });
}