import { useEffect, useRef } from 'react';
// No longer need NDK type here directly if we get it from useNDK
import {
    useNDK,
    useNDKSessions,
    type UserSessionData,
    ndkSignerFromPayload,
    type NDKUser,
    type NDKSigner
} from '@nostr-dev-kit/ndk-hooks'; // Consolidate imports
import {
    loadSessionsFromStorage,
    addOrUpdateStoredSession,
    removeStoredSession
} from './session-storage.js';

/**
 * Hook to monitor NDK session state and persist changes to secure storage.
 * It also loads persisted sessions on initial mount.
 */
export function useSessionMonitor() { // Remove ndk parameter
    // Access the whole state object first
    const { ndk } = useNDK();
    const {
        sessions,
        activeSessionPubkey,
        initSession,
        getActiveSession,
        // deleteSession, // Include if needed elsewhere
    } = useNDKSessions();

    const isInitialized = useRef(false);

    // Effect to initialize sessions from storage on startup
    useEffect(() => {
        if (!ndk || isInitialized.current) return;
        isInitialized.current = true;

        async function initializeFromStorage() {
            if (!ndk) return; // Guard against null ndk

            try {
                const storedSessions = await loadSessionsFromStorage();
                if (storedSessions.length === 0) {
                    console.log('[NDK-Mobile] No saved sessions found.');
                    return;
                }

                console.log(`[NDK-Mobile] Found ${storedSessions.length} saved sessions`);

                let isFirst = true;
                for (const storedSession of storedSessions) {
                    try {
                        const user: NDKUser = ndk.getUser({ pubkey: storedSession.pubkey });
                        let signer: NDKSigner | undefined = undefined;

                        if (storedSession.signerPayload) {
                            signer = await ndkSignerFromPayload(
                                storedSession.signerPayload,
                                ndk
                            );
                            if (!signer) {
                                console.warn(`[NDK-Mobile] Failed to deserialize signer for ${storedSession.pubkey}, session will be read-only.`);
                            }
                        }

                        // Use initSession to initialize the session in the store
                        await initSession(ndk, user, signer, {
                            // profile: false, // Optional: control fetching profile
                            // follows: false, // Optional: control fetching follows
                            // muteList: false, // Optional: control fetching mute list
                            autoSetActive: isFirst,
                        });

                        console.log(`[NDK-Mobile] Restored session for pubkey: ${storedSession.pubkey}${signer ? ' with signer' : ' (read-only)'}`);
                        isFirst = false;
                    } catch (error) {
                        console.error(
                            `[NDK-Mobile] Failed to restore session for pubkey ${storedSession.pubkey}:`,
                            error
                        );
                        // Consider removing from storage if init fails critically
                        await removeStoredSession(storedSession.pubkey);
                    }
                }
            } catch (error) {
                console.error('[NDK-Mobile] Error initializing sessions from storage:', error);
            }
        }

        initializeFromStorage();
    }, [ndk, initSession]); // Dependency is now initSession

    // Effect to persist active session changes
    useEffect(() => {
        if (!ndk || !isInitialized.current || !activeSessionPubkey) return;

        // Get the full active session data using the selector/getter
        const activeSessionData = getActiveSession();

        if (!activeSessionData) {
            // This case might happen briefly if activeSessionPubkey is set but data isn't ready
            // Or if the active session was deleted.
            // console.log("[NDK-Mobile] Active session pubkey set, but no data found yet.");
            return;
        }

        async function persistActiveSession() {
            // Access the signer directly from the session data
            const signerPayload = activeSessionData.signer
                ? activeSessionData.signer.toPayload()
                : undefined;

            try {
                await addOrUpdateStoredSession(
                    activeSessionPubkey, // Already checked this is not null
                    signerPayload
                );
                console.log(`[NDK-Mobile] Persisted active session: ${activeSessionPubkey}`);
            } catch (error) {
                console.error(`[NDK-Mobile] Failed to persist session ${activeSessionPubkey}:`, error);
            }
        }

        persistActiveSession();
        // Dependencies: activeSessionPubkey triggers the effect.
        // getActiveSession is assumed stable (common in Zustand).
        // ndk is needed for potential signer operations (though payload handles it here).
    }, [activeSessionPubkey, getActiveSession, ndk]);

    // Effect to handle storage removal when a session is removed from the store
    const prevSessionsRef = useRef<Map<string, UserSessionData>>(new Map()); // Use correct type
    useEffect(() => {
        const currentSessions = sessions;
        const prevSessions = prevSessionsRef.current;

        prevSessions.forEach((_, pubkey) => {
            if (!currentSessions.has(pubkey)) {
                console.log(`Session ${pubkey} detected as removed, updating storage.`);
                removeStoredSession(pubkey);
            }
        });

        prevSessionsRef.current = new Map(currentSessions);

    }, [sessions]);


    return null;
}