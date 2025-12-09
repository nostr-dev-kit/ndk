// src/session/store/stop-session.ts
import type { Hexpubkey } from "@nostr-dev-kit/ndk";
import type { NDKSessionsState } from "./types";

export const stopSession = (
    set: (partial: Partial<NDKSessionsState> | ((state: NDKSessionsState) => Partial<NDKSessionsState>)) => void,
    get: () => NDKSessionsState,
    pubkey: Hexpubkey,
): void => {
    const session = get().sessions.get(pubkey);

    if (session?.subscriptions && session.subscriptions.length > 0) {
        console.debug(`Stopping session subscriptions for ${pubkey}`);
        try {
            for (const sub of session.subscriptions) {
                sub.stop();
            }
        } catch (error) {
            console.error(`Error stopping subscriptions for ${pubkey}:`, error);
        }

        // Remove subscription handles from state immutably
        set((state) => {
            const session = state.sessions.get(pubkey);
            if (!session) return {};
            const updatedSession = { ...session, subscriptions: [] };
            const newSessions = new Map(state.sessions);
            newSessions.set(pubkey, updatedSession);
            return { sessions: newSessions };
        });
    } else {
        console.debug(`No active subscriptions found for session ${pubkey} to stop.`);
    }
};
