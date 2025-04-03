// src/session/store/update-session.ts
import type { Draft } from 'immer';
import type { Hexpubkey } from '@nostr-dev-kit/ndk';
import type { NDKSessionsState, NDKUserSession } from './types';

export const updateSession = (
    set: (fn: (draft: Draft<NDKSessionsState>) => void) => void,
    get: () => NDKSessionsState, // get signature remains the same
    pubkey: Hexpubkey,
    data: Partial<NDKUserSession>
): void => {
    set((draft) => {
        const session = draft.sessions.get(pubkey);
        if (!session) {
            console.warn(`Attempted to update non-existent session: ${pubkey}`);
            return; // No changes needed if session doesn't exist
        }

        // Merge partial data into the draft session
        Object.assign(session, data);

        // Always update lastActive timestamp on update
        session.lastActive = Date.now();
    });
};
