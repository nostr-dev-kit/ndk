import type { Hexpubkey } from '@nostr-dev-kit/ndk';
import { useNDKStore } from '../ndk'; // Corrected import path
import type { NDKSessionsState } from './index';
import type { NDKUserSession } from './types';

/**
 * Implementation for switching to a user
 */
export async function switchToUser(
    get: () => NDKSessionsState,
    set: (state: Partial<NDKSessionsState> | ((state: NDKSessionsState) => Partial<NDKSessionsState>)) => void,
    pubkey: Hexpubkey
): Promise<void> {
    const ndk = useNDKStore.getState().ndk;
    if (!ndk) {
        console.error('Cannot switch user: NDK instance not initialized.');
        return;
    }
    
    // Start session if it doesn't exist
    if (!get().sessions.has(pubkey)) {
        await get().startSession(pubkey, { makeActive: false });
    }
    
    // Get signer if available
    const signers = get().signers;
    const newSigner = signers.get(pubkey);
    
    // Set NDK signer
    ndk.signer = newSigner;
    
    // Create or get user
    const user = ndk.getUser({ pubkey });
    
    // Update NDK store's current user
    useNDKStore.setState({ currentUser: user });
    
    // Update active session pubkey
    set({ activeSessionPubkey: pubkey });
    
    // Update session's last active timestamp
    set((state: NDKSessionsState) => {
        const sessions = new Map(state.sessions);
        const session = sessions.get(pubkey);
        if (session) {
            const updatedSession: NDKUserSession = {
                ...session,
                pubkey: pubkey, // Ensure pubkey is included
                lastActive: Date.now()
            };
            sessions.set(pubkey, updatedSession);
        }
        return { sessions };
    });
    
    if (newSigner) {
        console.log(`Switched to user ${pubkey} with active signer.`);
    } else {
        console.log(`Switched to user ${pubkey} in read-only mode.`);
    }
}