import type { NDKSigner, NDKUser } from '@nostr-dev-kit/ndk';
import type { StoreApi } from 'zustand';
import type { NDKUserSession } from './types';
import type { NDKSessionsState } from './index';

/**
 * Creates a default session object.
 */
const createDefaultSession = (pubkey: string, signer?: NDKSigner): NDKUserSession => ({
    pubkey,
    signer, // Include signer if provided
    mutedPubkeys: new Set<string>(),
    mutedHashtags: new Set<string>(),
    mutedWords: new Set<string>(),
    mutedEventIds: new Set<string>(),
    replaceableEvents: new Map(),
    lastActive: Date.now(),
    // profile and followSet will be populated by separate fetch mechanisms
});


/**
 * Ensures a session entry exists in the store for a Nostr user.
 * Creates a new session if one doesn't exist, or updates the signer
 * if a new one is provided for an existing session.
 * Does NOT fetch data (profile, follows, etc.).
 */
export function ensureSession( // Renamed function
    set: StoreApi<NDKSessionsState>['setState'],
    get: StoreApi<NDKSessionsState>['getState'],
    user: NDKUser,
    signer?: NDKSigner
): string | undefined { // Returns pubkey if successful, otherwise undefined
    const pubkey = user.pubkey;

    try {
        let session = get().sessions.get(pubkey);

        if (!session) {
            // Create new session
            const newSession = createDefaultSession(pubkey, signer);
            set((state) => {
                const newSessions = new Map(state.sessions);
                newSessions.set(pubkey, newSession);
                // Do not automatically set active here, let addSigner or switchToUser handle it
                return { sessions: newSessions };
            });
            session = get().sessions.get(pubkey); // Re-get after setting

            if (!session) {
                console.error(`Failed to create session for pubkey ${pubkey}`);
                return undefined;
            }
        } else {
            // Update existing session only if signer is new or different
            if (signer && session.signer?.pubkey !== signer.pubkey) {
                set((state) => {
                    const current = state.sessions.get(pubkey);
                    if (!current) return state; // Should not happen, but safety check
                    const updatedSession = { ...current, signer };
                    const newSessions = new Map(state.sessions);
                    newSessions.set(pubkey, updatedSession);
                    return { sessions: newSessions };
                });
                session = get().sessions.get(pubkey); // Re-get after setting
            }
        }

        return session ? pubkey : undefined;
    } catch (error) {
        console.error(`Error initializing session data for ${pubkey}:`, error);
        return undefined;
    }
}
