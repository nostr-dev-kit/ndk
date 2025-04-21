import type { Hexpubkey } from "@nostr-dev-kit/ndk";
import {
    type NDKSigner,
    type NDKUser,
    type SessionStartOptions,
    ndkSignerFromPayload,
    useNDK,
    useNDKCurrentUser,
    useNDKSessionLogin,
    useNDKSessionSessions,
    useNDKSessionSigners,
    useNDKSessionStart,
    useNDKSessionStop,
} from "@nostr-dev-kit/ndk-hooks";
import { useEffect, useRef } from "react";
import {
    addOrUpdateStoredSession,
    clearActivePubkey,
    getActivePubkey,
    loadSessionsFromStorage,
    removeStoredSession,
    setActivePubkey,
} from "./session-storage.js";

/**
 * Hook to monitor NDK session state and persist changes to secure storage.
 * It also loads persisted sessions on initial mount.
 */
export function useSessionMonitor(opts?: SessionStartOptions) {
    const { ndk } = useNDK();
    const isInitialized = useRef(false);
    const storedKeys = useRef(new Map<Hexpubkey, boolean>());
    const storedActivePubkey = getActivePubkey();
    const addSession = useNDKSessionLogin();
    const currentUser = useNDKCurrentUser();
    const signers = useNDKSessionSigners();
    const sessions = useNDKSessionSessions();
    const startSession = useNDKSessionStart();
    const stopSession = useNDKSessionStop();

    // Effect to initialize sessions from storage on startup
    useEffect(() => {
        if (!ndk || isInitialized.current) return;

        async function initializeFromStorage() {
            if (!ndk) return; // Guard against null ndk

            try {
                // Load stored sessions
                const storedSessions = await loadSessionsFromStorage();
                if (storedSessions.length === 0) {
                    return;
                }

                // Load active pubkey

                // Add all sessions to NDK
                for (const storedSession of storedSessions) {
                    try {
                        const user: NDKUser = ndk.getUser({
                            pubkey: storedSession.pubkey,
                        });
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
                        await addSession(signer ? signer : user, storedSession.pubkey === storedActivePubkey);
                    } catch (error) {
                        console.error(
                            `[NDK-Mobile] Failed to process stored session for pubkey ${storedSession.pubkey}:`,
                            error,
                        );
                        // Optionally remove from storage on error
                        // await removeStoredSession(storedSession.pubkey);
                    }
                }
            } catch (error) {
                console.error("[NDK-Mobile] Error initializing sessions from storage:", error);
            }
        }

        initializeFromStorage().finally(() => {
            // start session
            startSession(storedActivePubkey, opts);

            isInitialized.current = true;
        });
        // We're intentionally only running this effect when ndk changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ndk]);

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

    const currentActivePubkey = useRef(currentUser?.pubkey);

    // Effect to persist active pubkey changes and start session
    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        if (!ndk || !isInitialized.current) {
            return;
        }

        async function updateActivePubkey() {
            if (currentUser?.pubkey) {
                try {
                    if (currentActivePubkey.current !== currentUser?.pubkey) {
                        await stopSession(currentActivePubkey.current);
                        currentActivePubkey.current = currentUser?.pubkey;
                    }
                    setActivePubkey(currentUser?.pubkey);
                    await startSession(currentUser?.pubkey, opts);
                } catch (error) {
                    console.error(`Failed to start session for active pubkey ${currentUser?.pubkey}:`, error);
                }
            } else {
                await clearActivePubkey();
            }
        }

        updateActivePubkey();
    }, [currentUser?.pubkey, ndk]);

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
