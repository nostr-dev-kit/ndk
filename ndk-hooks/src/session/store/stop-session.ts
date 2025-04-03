// src/session/store/stop-session.ts
import type { Draft } from 'immer';
import type { Hexpubkey } from '@nostr-dev-kit/ndk';
import type { NDKSessionsState } from './types';

export const stopSession = (
    set: (fn: (draft: Draft<NDKSessionsState>) => void) => void,
    get: () => NDKSessionsState,
    pubkey: Hexpubkey
): void => {
    const session = get().sessions.get(pubkey);

    if (session?.subscription) {
        console.debug(`Stopping session subscription for ${pubkey}`);
        try {
            session.subscription.stop();
        } catch (error) {
            console.error(`Error stopping subscription for ${pubkey}:`, error);
        }

        // Remove subscription handle from state
        set((draft) => {
            const draftSession = draft.sessions.get(pubkey);
            if (draftSession) {
                draftSession.subscription = undefined; // Set to undefined instead of deleting
            }
        });
    } else {
        console.debug(`No active subscription found for session ${pubkey} to stop.`);
    }
};