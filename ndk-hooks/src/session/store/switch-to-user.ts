import type { Hexpubkey, NDKSigner } from "@nostr-dev-kit/ndk";
import type { Draft } from "immer";
import { useNDKStore } from "../../ndk/store";
import type { NDKSessionsState } from "./types";

/**
 * Implementation for switching the active user session.
 * Sets the activePubkey in the store.
 */
export const switchToUser = (
    set: (fn: (draft: Draft<NDKSessionsState>) => void) => void,
    get: () => NDKSessionsState,
    pubkey: Hexpubkey | null,
): void => {
    const signers = get().signers;
    const ndk = get().ndk;
    if (!ndk) {
        console.error("Cannot switch user: NDK instance not initialized in session store.");
        return;
    }

    let signer: NDKSigner | undefined = undefined;

    if (pubkey !== null) {
        // Activate user
        const session = get().sessions.get(pubkey);

        if (!session) {
            console.error(`Cannot switch to user ${pubkey}: Session does not exist.`);
            return;
        }

        signer = signers.get(pubkey);
    }

    // Set NDK signer (can be undefined if no signer is associated with the session)
    useNDKStore.getState().setSigner(signer);

    // Update active pubkey and lastActive timestamp
    set((draft) => {
        draft.activePubkey = pubkey;
        if (pubkey) {
            const draftSession = draft.sessions.get(pubkey);
            if (draftSession) {
                draftSession.lastActive = Date.now() / 1000;
            }
        }
    });
};
