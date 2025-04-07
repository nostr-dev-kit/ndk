// src/session/store/add-session.ts
import { type Hexpubkey, type NDKSigner, NDKUser } from "@nostr-dev-kit/ndk";
import type { Draft } from "immer"; // Import Draft type
import { useNDKStore } from "../../ndk/store";
import type { NDKSessionsState, NDKUserSession } from "./types";

/**
 * Creates a default empty session object.
 */
const createDefaultSession = (pubkey: Hexpubkey): NDKUserSession => ({
    pubkey,
    mutedPubkeys: new Set(),
    mutedHashtags: new Set(),
    mutedWords: new Set(),
    mutedEventIds: new Set(),
    events: new Map(),
    lastActive: Date.now() / 1000,
});

export const addSession = async (
    set: (fn: (draft: Draft<NDKSessionsState>) => void) => void,
    get: () => NDKSessionsState,
    userOrSigner: NDKUser | NDKSigner,
    setActive = true,
): Promise<Hexpubkey> => {
    let user: NDKUser;
    let signer: NDKSigner | undefined = undefined;
    let userPubkey: Hexpubkey;

    if (userOrSigner instanceof NDKUser) {
        user = userOrSigner as NDKUser;
        userPubkey = user.pubkey;
    } else {
        signer = userOrSigner as NDKSigner;
        try {
            user = await signer.user();
            userPubkey = user.pubkey;

            // Add signer to the signers map using Immer's draft
            set((draft) => {
                // No need for explicit check, signer is guaranteed here
                draft.signers.set(userPubkey, signer as NDKSigner);
            });
        } catch (error) {
            console.error("Failed to get user from signer:", error);
            throw new Error("Could not retrieve user from the provided signer.");
        }
    }

    // Ensure session exists, update signer if provided now, using Immer's draft
    set((draft) => {
        let session = draft.sessions.get(userPubkey);

        if (!session) {
            // Create new session if it doesn't exist
            session = createDefaultSession(userPubkey);
            draft.sessions.set(userPubkey, session);
        } else {
            // Update last active time for existing session
            session.lastActive = Date.now() / 1000;
            console.debug(`Session already exists for ${userPubkey}, updating lastActive.`);
        }

        if (setActive) {
            draft.activePubkey = userPubkey;
            useNDKStore.getState().setSigner(signer);
        }
    });

    return userPubkey;
};
