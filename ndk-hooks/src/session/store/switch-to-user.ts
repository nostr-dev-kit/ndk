import type { Hexpubkey } from '@nostr-dev-kit/ndk';
import { useNDKStore } from '../../ndk/store'; // Corrected import path
import type { NDKSessionsState } from './index';
import { setActiveSession } from './set-active-session'; // Import the function
import type { StoreApi } from 'zustand';

/**
 * Implementation for switching the active user session.
 * Ensures the session exists, sets the NDK signer, updates NDKStore,
 * and sets the active session in the session store.
 */
export async function switchToUser(
    get: StoreApi<NDKSessionsState>['getState'],
    set: StoreApi<NDKSessionsState>['setState'],
    pubkey: Hexpubkey
): Promise<void> {
    const ndk = useNDKStore.getState().ndk;
    if (!ndk) {
        console.error('Cannot switch user: NDK instance not initialized.');
        return;
    }

    // Create user object first
    const user = ndk.getUser({ pubkey });

    // Ensure session exists for this user (does not set signer here)
    const ensuredPubkey = get().ensureSession(user);
    if (!ensuredPubkey) {
        console.error(`Failed to ensure session for ${pubkey} during switch.`);
        return;
    }

    // Get signer if available from the session store's signer map
    const signers = get().signers;
    const newSigner = signers.get(pubkey);

    // Set NDK signer (can be undefined if no signer is associated)
    ndk.signer = newSigner;

    // Update NDK store's current user
    useNDKStore.setState({ currentUser: user });

    // Update active session pubkey and lastActive timestamp using the dedicated function
    setActiveSession(set, get, pubkey);

    if (newSigner) {
        console.log(`Switched to user ${pubkey} with active signer.`);
    } else {
        console.log(`Switched to user ${pubkey} in read-only mode.`);
    }
}