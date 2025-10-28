// src/session/store/add-session.ts
import { type Hexpubkey, type NDKSigner, NDKUser } from "@nostr-dev-kit/ndk";
import { useNDKMutes } from "../../mutes/store";
import { useNDKStore } from "../../ndk/store";
import type { NDKSessionsState, NDKUserSession } from "./types";

/**
 * Creates a default empty session object.
 */
const createDefaultSession = (pubkey: Hexpubkey): NDKUserSession => ({
    pubkey,
    events: new Map(),
    subscriptions: [],
    lastActive: Date.now() / 1000,
});

/**
 * Adds a new session to the store.
 *
 * @note This function should not be called directly. Use the useNDKSessionLogin hook instead.
 * @see useNDKSessionLogin in src/session/hooks/index.ts
 */
export const addSession = async (
    set: (partial: Partial<NDKSessionsState> | ((state: NDKSessionsState) => Partial<NDKSessionsState>)) => void,
    get: () => NDKSessionsState,
    userOrSigner: NDKUser | NDKSigner,
    setActive = true,
): Promise<Hexpubkey> => {
    let user: NDKUser;
    let signer: NDKSigner | undefined;
    let userPubkey: Hexpubkey;

    if (userOrSigner instanceof NDKUser) {
        user = userOrSigner as NDKUser;
        userPubkey = user.pubkey;
    } else {
        signer = userOrSigner as NDKSigner;
        try {
            user = await signer.user();
            userPubkey = user.pubkey;

            // Add signer to the signers map immutably
            set((state) => {
                const newSigners = new Map(state.signers);
                newSigners.set(userPubkey, signer as NDKSigner);
                return { signers: newSigners };
            });
        } catch (error) {
            console.error("Failed to get user from signer:", error);
            throw new Error("Could not retrieve user from the provided signer.");
        }
    }

    // Ensure session exists, update signer if provided now, using immutable updates
    set((state) => {
        const newSessions = new Map(state.sessions);
        let session = newSessions.get(userPubkey);

        if (!session) {
            // Create new session if it doesn't exist
            session = createDefaultSession(userPubkey);
            newSessions.set(userPubkey, session);
        } else {
            // Update last active time for existing session
            session = { ...session, lastActive: Date.now() / 1000 };
            newSessions.set(userPubkey, session);
            console.debug(`Session already exists for ${userPubkey}, updating lastActive.`);
        }

        const update: Partial<NDKSessionsState> = { sessions: newSessions };
        if (setActive) {
            update.activePubkey = userPubkey;
            useNDKStore.getState().setSigner(signer);
        }
        return update;
    });

    // Initialize mutes for this user in the mute store
    useNDKMutes.getState().initMutes(userPubkey);

    // If setting as active, also update the active pubkey in the mute store
    if (setActive) {
        useNDKMutes.getState().setActivePubkey(userPubkey);
    }

    return userPubkey;
};
