import type { Hexpubkey } from '@nostr-dev-kit/ndk';
import type { NDKSessionsState } from './index';
import { useNDKStore } from '../ndk'; // Corrected import path

/**
 * Implementation for removing a session entirely from the store.
 */
export async function removeSession(
    get: () => NDKSessionsState,
    set: (state: Partial<NDKSessionsState> | ((state: NDKSessionsState) => Partial<NDKSessionsState>)) => void,
    pubkey: Hexpubkey
): Promise<void> {
    const sessions = get().sessions;
    const activeSessionPubkey = get().activeSessionPubkey;

    if (!sessions.has(pubkey)) {
        console.log(`No session found to remove for pubkey: ${pubkey}`);
        return;
    }

    // First, stop any active subscriptions for this session
    await get().stopSession(pubkey);

    // Remove the session data from the map
    set((state: NDKSessionsState) => {
        const updatedSessions = new Map(state.sessions);
        updatedSessions.delete(pubkey);
        return { sessions: updatedSessions };
    });

    // If this was the active session, clear the active session state
    if (activeSessionPubkey === pubkey) {
        set({ activeSessionPubkey: null });
        useNDKStore.setState({ currentUser: null });

        // Also clear the NDK signer if it belonged to this user
        const ndk = useNDKStore.getState().ndk;
        if (ndk?.signer) { // Use optional chaining
            const signerUser = await ndk.signer.user();
            if (signerUser.pubkey === pubkey) {
                ndk.signer = undefined;
            }
        }
    }

    console.log(`Session removed for pubkey: ${pubkey}`);
}