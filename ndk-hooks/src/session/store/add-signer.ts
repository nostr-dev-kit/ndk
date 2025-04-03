import type { NDKSigner } from '@nostr-dev-kit/ndk';
import type { NDKSessionsState } from './index';
import type { StoreApi } from 'zustand';

/**
 * Implementation for adding a signer to the sessions store.
 * Ensures a session exists for the signer's user.
 */
export async function addSigner(
    get: StoreApi<NDKSessionsState>['getState'],
    set: StoreApi<NDKSessionsState>['setState'],
    signer: NDKSigner,
    makeActive = true
): Promise<void> {
    try {
        const user = await signer.user();
        const pubkey = user.pubkey;

        // Ensure a session entry exists for this user, associating the signer
        const ensuredPubkey = get().ensureSession(user, signer);

        if (!ensuredPubkey) {
            // ensureSession should log errors, but we throw here to indicate failure
            throw new Error(`Failed to ensure session for pubkey ${pubkey}`);
        }

        // Update signers map (this might be slightly redundant if ensureSession updated it,
        // but ensures it's definitely set)
        set((state) => ({
            signers: new Map(state.signers).set(pubkey, signer)
        }));

        console.log(`Signer added/updated for pubkey: ${pubkey}`);

        // Make this the active user if requested
        if (makeActive) {
            // switchToUser will handle setting the activeSessionPubkey
            // and potentially updating the global NDK signer state
            await get().switchToUser(pubkey);
        }
    } catch (error) {
        console.error('Failed to add signer:', error);
        // Optionally re-throw or handle differently
        throw error;
    }
}