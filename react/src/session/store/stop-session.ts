// src/session/store/stop-session.ts
import type { Hexpubkey } from "@nostr-dev-kit/ndk";
import type { NDKSessionsState } from "./types";

export const stopSession = (
    set: (partial: Partial<NDKSessionsState> | ((state: NDKSessionsState) => Partial<NDKSessionsState>)) => void,
    get: () => NDKSessionsState,
    pubkey: Hexpubkey,
): void => {
    const session = get().sessions.get(pubkey);

    if (session?.subscription) {
        console.debug(`Stopping session subscription for ${pubkey}`);
        try {
            session.subscription.stop();
        } catch (error) {
            console.error(`Error stopping subscription for ${pubkey}:`, error);
        }

        // Remove subscription handle from state immutably
        set((state) => {
            const session = state.sessions.get(pubkey);
            if (!session) return {};
            const updatedSession = { ...session, subscription: undefined };
            const newSessions = new Map(state.sessions);
            newSessions.set(pubkey, updatedSession);
            return { sessions: newSessions };
        });
    } else {
        console.debug(`No active subscription found for session ${pubkey} to stop.`);
    }
};
