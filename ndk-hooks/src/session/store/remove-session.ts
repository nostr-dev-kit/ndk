// src/session/store/remove-session.ts
import type { Draft } from "immer";
import type { Hexpubkey, NDKSigner } from "@nostr-dev-kit/ndk";
import type { NDKSessionsState } from "./types";

export const removeSession = (
    set: (fn: (draft: Draft<NDKSessionsState>) => void) => void,
    get: () => NDKSessionsState,
    pubkey: Hexpubkey,
): void => {
    const state = get();
    const sessionToRemove = state.sessions.get(pubkey);
    const signerToRemove = state.signers.get(pubkey);

    if (!sessionToRemove) {
        console.warn(`No session found to remove for pubkey: ${pubkey}`);
        return;
    }

    // --- Stop Subscription ---
    if (sessionToRemove.subscription) {
        console.debug(`Stopping subscription for removed session ${pubkey}`);
        try {
            sessionToRemove.subscription.stop();
        } catch (error) {
            console.error(`Error stopping subscription for removed session ${pubkey}:`, error);
        }
        // The subscription handle will be removed when the session is deleted below.
    }

    const wasActive = state.activePubkey === pubkey;

    set((draft) => {
        draft.sessions.delete(pubkey);

        draft.signers.delete(pubkey);

        // --- Handle Active Session Change ---
        if (wasActive) {
            let nextActivePubkey: Hexpubkey | null = null;
            let latestLastActive = 0;

            // Find the remaining session with the most recent lastActive time
            for (const [key, session] of draft.sessions.entries()) {
                if (session.lastActive > latestLastActive) {
                    latestLastActive = session.lastActive;
                    nextActivePubkey = key;
                }
            }

            draft.activePubkey = nextActivePubkey;

            const nextActiveSigner = nextActivePubkey ? draft.signers.get(nextActivePubkey) : undefined;

            // Update global NDK signer based on the new active session (or lack thereof)
            const ndk = draft.ndk; // Access NDK from draft
            if (ndk) {
                ndk.signer = nextActiveSigner;
            }
        }
    });
};
