// src/session/store/switch-to-user.ts
import type { Draft } from 'immer';
import type { Hexpubkey } from '@nostr-dev-kit/ndk';
import type { NDKSessionsState } from './types';
import { useNDKStore } from '../../ndk/store';

/**
 * Implementation for switching the active user session.
 * Sets the activePubkey in the store and configures ndk.signer.
 */
export const switchToUser = (
    set: (fn: (draft: Draft<NDKSessionsState>) => void) => void,
    get: () => NDKSessionsState,
    pubkey: Hexpubkey | null // Allow null to deactivate
): void => {
    const signers = get().signers;
    const ndk = get().ndk;
    if (!ndk) {
        console.error('Cannot switch user: NDK instance not initialized in session store.');
        return;
    }

    if (pubkey === null) {
        // Deactivate user
        set((draft) => {
            draft.activePubkey = null;
        });
        ndk.signer = undefined;
        console.log('Deactivated current user session.');
        return;
    }

    // Activate user
    const session = get().sessions.get(pubkey);

    if (!session) {
        console.error(`Cannot switch to user ${pubkey}: Session does not exist.`);
        // Optionally, we could try to add the session here if desired,
        // but the current requirement implies it should already exist.
        // For now, just log an error.
        return;
    }

    const signer = signers.get(pubkey);
    console.log(`Switching to user ${pubkey}..., signer: ${signer ? 'present' : 'not present'}`);

    // Set NDK signer (can be undefined if no signer is associated with the session)
    useNDKStore.getState().setSigner(signer);
    console.log(`NDK signer set to ${signer ? signer.pubkey : 'none'}`);

    // Update active pubkey and lastActive timestamp
    set((draft) => {
        draft.activePubkey = pubkey;
        const draftSession = draft.sessions.get(pubkey);
        if (draftSession) {
            draftSession.lastActive = Date.now();
        }
    });

    if (signer) {
        console.log(`Switched to user ${pubkey} with active signer.`);
    } else {
        console.log(`Switched to user ${pubkey} (read-only).`);
    }
};