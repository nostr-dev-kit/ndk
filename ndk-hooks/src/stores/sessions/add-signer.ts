import type { NDKSigner } from '@nostr-dev-kit/ndk';
import type { NDKSessionsState } from './index';

/**
 * Implementation for adding a signer to the sessions store
 */
export async function addSigner(
    get: () => NDKSessionsState,
    set: (state: Partial<NDKSessionsState> | ((state: NDKSessionsState) => Partial<NDKSessionsState>)) => void,
    signer: NDKSigner,
    makeActive = true
): Promise<void> {
    try {
        const user = await signer.user();
        const pubkey = user.pubkey;
        
        // Update signers map
        set((state: NDKSessionsState) => ({
            signers: new Map(state.signers).set(pubkey, signer)
        }));
        
        console.log(`Signer added for pubkey: ${pubkey}`);
        
        // Start a session for this user if one doesn't exist
        if (!get().sessions.has(pubkey)) {
            await get().startSession(pubkey, { makeActive: false });
        }
        
        // Make this the active user if requested
        if (makeActive) {
            await get().switchToUser(pubkey);
        }
    } catch (error) {
        console.error('Failed to add signer:', error);
        throw error;
    }
}