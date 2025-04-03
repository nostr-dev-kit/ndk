// src/session/store/add-session.ts
import type { NDKSigner, NDKUser, Hexpubkey } from '@nostr-dev-kit/ndk';
import type { Draft } from 'immer'; // Import Draft type
import type { NDKSessionsState, NDKUserSession } from './types';

/**
 * Creates a default empty session object.
 */
const createDefaultSession = (pubkey: Hexpubkey): NDKUserSession => ({
    pubkey,
    mutedPubkeys: new Set(),
    mutedHashtags: new Set(),
    mutedWords: new Set(),
    mutedEventIds: new Set(),
    replaceableEvents: new Map(),
    lastActive: Date.now(),
    // profile, followSet, signer, subscription are initially undefined
});

export const addSession = async (
    set: (fn: (draft: Draft<NDKSessionsState>) => void) => void, // Immer-patched set
    get: () => NDKSessionsState, // get remains the same
    userOrSigner: NDKUser | NDKSigner
): Promise<Hexpubkey> => {
    let user: NDKUser;
    let signerInstance: NDKSigner | undefined = undefined;
    let userPubkey: Hexpubkey;

    // Check if it's a signer instance
    if ('user' in userOrSigner && typeof userOrSigner.user === 'function') {
        signerInstance = userOrSigner as NDKSigner;
        try {
            user = await signerInstance.user();
            userPubkey = user.pubkey;

            // Add signer to the signers map using Immer's draft
            set((draft) => {
                // No need for explicit check, signerInstance is guaranteed here
                draft.signers.set(userPubkey, signerInstance as NDKSigner);
            });

        } catch (error) {
            console.error("Failed to get user from signer:", error);
            throw new Error("Could not retrieve user from the provided signer.");
        }
    } else {
        user = userOrSigner as NDKUser;
        userPubkey = user.pubkey;
    }

    // Ensure session exists, update signer if provided now, using Immer's draft
    set((draft) => {
        let session = draft.sessions.get(userPubkey);

        if (!session) {
            // Create new session if it doesn't exist
            session = createDefaultSession(userPubkey);
            draft.sessions.set(userPubkey, session);
            console.debug(`Created new session for ${userPubkey}`);
        } else {
            // Update last active time for existing session
            session.lastActive = Date.now();
            console.debug(`Session already exists for ${userPubkey}, updating lastActive.`);
        }

        // If we processed a signer, ensure it's set on the session
        // Check against the signerInstance captured in the outer scope
        if (signerInstance && session.signer !== signerInstance) {
            session.signer = signerInstance;
            console.debug(`Updated signer for session ${userPubkey}`);
        }
    });

    return userPubkey;
};