import type { Hexpubkey, NDKSigner } from "@nostr-dev-kit/ndk";
import { useNDKStore } from "../../ndk/store";
import { useNDKMutes } from "../../mutes/store";
import type { NDKSessionsState } from "./types";

/**
 * Implementation for switching the active user session.
 * Sets the activePubkey in the store and synchronizes with the mute store.
 *
 * @note This function should not be called directly. Use the useNDKSessionSwitch hook instead.
 * @see useNDKSessionSwitch in src/session/hooks/index.ts
 */
export const switchToUser = (
    set: (partial: Partial<NDKSessionsState> | ((state: NDKSessionsState) => Partial<NDKSessionsState>)) => void,
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

    // Update active pubkey and lastActive timestamp immutably
    set((state) => {
        let newSessions = state.sessions;
        let newActivePubkey: Hexpubkey | undefined = pubkey === null ? undefined : pubkey;
        if (pubkey) {
            const session = state.sessions.get(pubkey);
            if (session) {
                const updatedSession = { ...session, lastActive: Date.now() / 1000 };
                newSessions = new Map(state.sessions);
                newSessions.set(pubkey, updatedSession);
            }
        }
        return {
            activePubkey: newActivePubkey,
            sessions: newSessions,
        };
    });

    // Synchronize with mute store
    const muteStore = useNDKMutes.getState();

    // Update the active pubkey in the mute store
    muteStore.setActivePubkey(pubkey);

    // Initialize mutes for the active user if they exist
    if (pubkey) {
        muteStore.initMutes(pubkey);
    }
};
