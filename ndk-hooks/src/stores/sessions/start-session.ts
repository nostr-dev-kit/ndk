import type { Hexpubkey } from '@nostr-dev-kit/ndk';
import type { NDKSessionsState } from './index';
import type { NDKUserSession } from './types';

/**
 * Implementation for starting a session
 */
export async function startSession(
    get: () => NDKSessionsState,
    set: (state: Partial<NDKSessionsState> | ((state: NDKSessionsState) => Partial<NDKSessionsState>)) => void,
    pubkey: Hexpubkey,
    options?: { makeActive?: boolean }
): Promise<void> {
    const makeActive = options?.makeActive ?? true;
    
    // Create a new session if one doesn't exist
    if (!get().sessions.has(pubkey)) {
        const newSession: NDKUserSession = {
            pubkey,
            followSet: new Set<string>(),
            mutedPubkeys: new Set<string>(),
            mutedHashtags: new Set<string>(),
            mutedWords: new Set<string>(),
            mutedEventIds: new Set<string>(),
            events: new Map(),
            subscriptions: new Set<string>(),
            lastActive: Date.now(),
        };
        
        set((state: NDKSessionsState) => ({
            sessions: new Map(state.sessions).set(pubkey, newSession)
        }));
        
        console.log(`Session started for pubkey: ${pubkey}`);
    } else {
        // Update existing session's last active timestamp
        set((state: NDKSessionsState) => {
            const sessions = new Map(state.sessions);
            const session = sessions.get(pubkey);
            if (session) {
                const updatedSession: NDKUserSession = { 
                    ...session, 
                    pubkey: pubkey, // Ensure pubkey is included
                    lastActive: Date.now() 
                };
                sessions.set(pubkey, updatedSession);
            }
            return { sessions };
        });
        
        console.log(`Updated existing session for pubkey: ${pubkey}`);
    }
    
    // Make this the active session if requested
    if (makeActive) {
        await get().switchToUser(pubkey);
    }
}