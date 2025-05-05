// src/session/store/update-session.ts
import type { Hexpubkey } from "@nostr-dev-kit/ndk";
import type { NDKSessionsState, NDKUserSession } from "./types";

export const updateSession = (
    set: (partial: Partial<NDKSessionsState> | ((state: NDKSessionsState) => Partial<NDKSessionsState>)) => void,
    get: () => NDKSessionsState,
    pubkey: Hexpubkey,
    data: Partial<NDKUserSession>,
): void => {
    set((state) => {
        const session = state.sessions.get(pubkey);
        if (!session) {
            console.warn(`Attempted to update non-existent session: ${pubkey}`);
            return {};
        }
        const updatedSession: NDKUserSession = { ...session, ...data, lastActive: Date.now() };
        const newSessions = new Map(state.sessions);
        newSessions.set(pubkey, updatedSession);
        return { sessions: newSessions };
    });
};
