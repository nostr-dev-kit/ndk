// src/session/store/remove-session.ts
import type { Hexpubkey, NDKSigner } from "@nostr-dev-kit/ndk";
import type { NDKSessionsState } from "./types";

export const removeSession = (
    set: (partial: Partial<NDKSessionsState> | ((state: NDKSessionsState) => Partial<NDKSessionsState>)) => void,
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

    const wasActive = state.activePubkey === pubkey;

    set((current) => {
        // Clone maps for immutability
        const newSessions = new Map(current.sessions);
        newSessions.delete(pubkey);

        const newSigners = new Map(current.signers);
        newSigners.delete(pubkey);

        let nextActivePubkey: Hexpubkey | undefined = current.activePubkey;
        let nextActiveSigner: NDKSigner | undefined;
        const ndk = current.ndk;

        if (wasActive) {
            // Find the remaining session with the most recent lastActive time
            let latestLastActive = 0;
            nextActivePubkey = undefined;
            for (const [key, session] of newSessions.entries()) {
                if (session.lastActive > latestLastActive) {
                    latestLastActive = session.lastActive;
                    nextActivePubkey = key;
                }
            }
            nextActiveSigner = nextActivePubkey ? newSigners.get(nextActivePubkey) : undefined;
            if (ndk) {
                ndk.signer = nextActiveSigner;
            }
        }

        return {
            sessions: newSessions,
            signers: newSigners,
            activePubkey: wasActive ? nextActivePubkey : current.activePubkey,
        };
    });
};
