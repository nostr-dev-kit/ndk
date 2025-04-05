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

    const signerToRemove = sessionToRemove.signer;
    const wasActive = state.activePubkey === pubkey;

    set((draft) => {
        // --- Remove Session ---
        draft.sessions.delete(pubkey);
        console.log(`Session removed from store for pubkey: ${pubkey}`);

        // --- Handle Signer Removal ---
        if (signerToRemove) {
            let signerInUse = false;
            // Check if any *other* remaining session uses this signer
            for (const session of draft.sessions.values()) {
                if (session.signer === signerToRemove) {
                    signerInUse = true;
                    break;
                }
            }

            if (!signerInUse) {
                draft.signers.delete(pubkey);
                console.log(`Signer for ${pubkey} removed as it's no longer used by any session.`);
            }
        }

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

            // Update global NDK signer based on the new active session (or lack thereof)
            const ndk = draft.ndk; // Access NDK from draft
            if (ndk) {
                if (nextActivePubkey) {
                    const nextActiveSession = draft.sessions.get(nextActivePubkey);
                    ndk.signer = nextActiveSession?.signer; // Set to new signer or undefined
                    console.log(`Switched active session to ${nextActivePubkey}`);
                } else {
                    ndk.signer = undefined; // No sessions left, clear signer
                    console.log("No remaining sessions, deactivated active user.");
                }
            }
        }
    });
};
