import type { Hexpubkey } from '@nostr-dev-kit/ndk';
import type { NDKSessionsState } from './index';
import { useNDKStore } from '../ndk'; // Corrected import path

/**
 * Implementation for removing a signer (logout/remove authentication).
 * This keeps the session data but removes the signer.
 */
export async function removeSigner(
    get: () => NDKSessionsState,
    set: (state: Partial<NDKSessionsState> | ((state: NDKSessionsState) => Partial<NDKSessionsState>)) => void,
    pubkey: Hexpubkey
): Promise<void> {
    const signers = get().signers;
    const activeSessionPubkey = get().activeSessionPubkey;

    if (!signers.has(pubkey)) {
        console.log(`No signer found to remove for pubkey: ${pubkey}`);
        return;
    }

    // Remove the signer from the map
    set((state: NDKSessionsState) => {
        const updatedSigners = new Map(state.signers);
        updatedSigners.delete(pubkey);
        return { signers: updatedSigners };
    });

    // If this was the active signer, clear the NDK signer
    // The session continues in read-only mode
    if (activeSessionPubkey === pubkey) {
        const ndk = useNDKStore.getState().ndk;
        if (ndk?.signer) {
            const signerUser = await ndk.signer.user();
            if (signerUser.pubkey === pubkey) {
                ndk.signer = undefined;
                console.log(`Active NDK signer cleared for ${pubkey}. Session is now read-only.`);
            }
        }
    }

    console.log(`Signer removed for pubkey: ${pubkey}. Session data retained.`);
}