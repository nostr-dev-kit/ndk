import { useEffect, useRef } from "react";
import {
    useNDK,
    useNDKSessions, // Keep the hook import
    ndkSignerFromPayload,
    type NDKUser,
    type NDKSigner,
    type SessionStartOptions, // Import from ndk-hooks (now exported)
} from "@nostr-dev-kit/ndk-hooks";
import {
    // Session storage functions
    loadSessionsFromStorage,
    addOrUpdateStoredSession,
    removeStoredSession,
    getActivePubkey,
    setActivePubkey,
    clearActivePubkey,
} from "./session-storage.js";
import { Hexpubkey } from "@nostr-dev-kit/ndk";

/**
 * Hook to monitor NDK session state and persist changes to secure storage.
 * It also loads persisted sessions on initial mount.
 */
export function useSessionMonitor(opts?: SessionStartOptions) {
    const { ndk } = useNDK();
    const { sessions, signers, activePubkey, addSession, startSession, stopSession, switchToUser } = useNDKSessions();
    // Actions are accessed directly from the hook, not getState()
    const isInitialized = useRef(false);
    const storedKeys = useRef(new Map<Hexpubkey, boolean>());

    // Effect to initialize sessions from storage on startup
    useEffect(() => {
        if (!ndk || isInitialized.current) return;

        async function initializeFromStorage() {
            if (!ndk) return; // Guard against null ndk

            try {
                // Load stored sessions
                const storedSessions = await loadSessionsFromStorage();
                if (storedSessions.length === 0) {
                    console.log("[NDK-Mobile] No saved sessions found.");
                    return;
                }

                console.log(`[NDK-Mobile] Found ${storedSessions.length} saved sessions`);

                // Load active pubkey
                const storedActivePubkey = await getActivePubkey();

                // Add all sessions to NDK
                for (const storedSession of storedSessions) {
                    try {
                        const user: NDKUser = ndk.getUser({ pubkey: storedSession.pubkey });
                        let signer: NDKSigner | undefined = undefined;

                        if (storedSession.signerPayload) {
                            signer = await ndkSignerFromPayload(storedSession.signerPayload, ndk);
                            if (!signer) {
                                console.warn(
                                    `[NDK-Mobile] Failed to deserialize signer for ${storedSession.pubkey}, session will be read-only.`,
                                );
                            } else {
                                storedKeys.current.set(storedSession.pubkey, true);
                            }
                        } else {
                            storedKeys.current.set(storedSession.pubkey, false);
                        }

                        // Add session to NDK
                        await addSession(signer ? signer : user);
                    } catch (error) {
                        console.error(
                            `[NDK-Mobile] Failed to process stored session for pubkey ${storedSession.pubkey}:`,
                            error,
                        );
                        // Optionally remove from storage on error
                        // await removeStoredSession(storedSession.pubkey);
                    }
                }

                // Switch to stored active pubkey or first session if available
                if (storedActivePubkey && sessions.has(storedActivePubkey)) {
                    await switchToUser(storedActivePubkey);
                    console.log("Switched to stored active pubkey:", storedActivePubkey);
                    await startSession(storedActivePubkey, opts);
                }

                console.log("stored active pubkey:", storedActivePubkey);
            } catch (error) {
                console.error("[NDK-Mobile] Error initializing sessions from storage:", error);
            }
        }

        initializeFromStorage().finally(() => {
            isInitialized.current = true;
        });
    }, [ndk, addSession, switchToUser]); // Update dependencies

    // Effect to persist active session changes
    useEffect(() => {
        if (!ndk || !isInitialized.current) return;

        async function persistSessions() {
            // Store all signers with their payloads
            for (const [pubkey, signer] of signers) {
                if (storedKeys.current.get(pubkey)) {
                    // we already have this signer in storage
                    continue;
                }

                const payload = signer.toPayload();
                if (payload) {
                    await addOrUpdateStoredSession(pubkey, payload);
                    storedKeys.current.set(pubkey, true);
                }
            }

            // Store all read-only sessions
            for (const pubkey of sessions.keys()) {
                if (storedKeys.current.has(pubkey)) {
                    // we already have this session in storage
                    continue;
                }

                await addOrUpdateStoredSession(pubkey);
                storedKeys.current.set(pubkey, true);
            }
        }

        persistSessions();
    }, [sessions, signers, ndk]);

    const currentActivePubkey = useRef(activePubkey);

    // Effect to persist active pubkey changes
    useEffect(() => {
        if (!ndk || !isInitialized.current) return;

        console.log(
            "Running updateActivePubkey effect",
            isInitialized.current,
            currentActivePubkey.current,
            activePubkey,
        );

        async function updateActivePubkey() {
            if (activePubkey) {
                if (currentActivePubkey.current !== activePubkey) {
                    console.log("Stopping previous session:", currentActivePubkey.current);
                    await stopSession(currentActivePubkey.current);
                    console.log(`Active pubkey changed to: ${activePubkey}`);
                    currentActivePubkey.current = activePubkey;
                }
                await setActivePubkey(activePubkey);
                console.log("Starting session for active pubkey:", activePubkey);
                await startSession(activePubkey, opts);
            } else {
                await clearActivePubkey();
            }
        }

        updateActivePubkey();
    }, [activePubkey, ndk]);

    // Infer the session data type from the 'sessions' map returned by the hook
    const prevSessionsRef = useRef<typeof sessions>(new Map());
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
