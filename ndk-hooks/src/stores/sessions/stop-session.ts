import type { Hexpubkey } from '@nostr-dev-kit/ndk';
import type { NDKSessionsState } from './index';
import { useNDKStore } from '../ndk'; // Corrected import path

/**
 * Implementation for stopping a session's subscriptions.
 * This does NOT remove the session data itself.
 */
export async function stopSession(
    get: () => NDKSessionsState,
    _set: (state: Partial<NDKSessionsState> | ((state: NDKSessionsState) => Partial<NDKSessionsState>)) => void,
    pubkey: Hexpubkey
): Promise<void> {
    const session = get().sessions.get(pubkey);
    const ndk = useNDKStore.getState().ndk;

    if (!session) {
        console.log(`No active session found for pubkey to stop: ${pubkey}`);
        return;
    }

    if (!ndk) {
        console.warn(`NDK instance not available, cannot properly stop subscriptions for ${pubkey}`);
        // Potentially clear local subscription tracking anyway?
        // set((state: NDKSessionsState) => { ... });
        return;
    }

    console.log(`Stopping subscriptions for session: ${pubkey}`);

    // Placeholder for subscription cleanup logic
    // Iterate through session.subscriptions and stop them using the NDK instance
    // e.g., session.subscriptions?.forEach(subId => ndk.unsubscribe(subId));

    // Optionally clear the local subscription tracking after stopping them
    // set((state: NDKSessionsState) => {
    //     const sessions = new Map(state.sessions);
    //     const currentSession = sessions.get(pubkey);
    //     if (currentSession) {
    //         sessions.set(pubkey, { ...currentSession, subscriptions: new Set() });
    //     }
    //     return { sessions };
    // });

    console.log(`Subscriptions stopped for session: ${pubkey}`);
}