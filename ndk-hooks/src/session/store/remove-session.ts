import type { Hexpubkey } from '@nostr-dev-kit/ndk';
import type { NDKSessionsState } from './index';
import type { StoreApi } from 'zustand';

/**
 * Implementation for removing a session entirely from the store.
 * Also handles switching the active session if the removed one was active.
 */
export async function removeSession(
    get: StoreApi<NDKSessionsState>['getState'],
    set: StoreApi<NDKSessionsState>['setState'],
    pubkey: Hexpubkey
): Promise<void> {
    const sessions = get().sessions;
    const activeSessionPubkey = get().activeSessionPubkey;

    if (!sessions.has(pubkey)) {
        console.warn(`No session found to remove for pubkey: ${pubkey}`);
        return;
    }

    // Remove the session data from the map
    set((state) => {
        const updatedSessions = new Map(state.sessions);
        updatedSessions.delete(pubkey);

        // If the removed session was active, try to set the next available one as active, or null
        let nextActivePubkey = state.activeSessionPubkey;
        if (state.activeSessionPubkey === pubkey) {
            nextActivePubkey = updatedSessions.keys().next().value ?? null;
        }

        return { sessions: updatedSessions, activeSessionPubkey: nextActivePubkey };
    });

    // Note: Clearing the global NDK currentUser or signer should be handled
    // by the logic that calls removeSession or removeSigner, if appropriate.
    // This function only manages the session store state.

    console.log(`Session removed from store for pubkey: ${pubkey}`);
}