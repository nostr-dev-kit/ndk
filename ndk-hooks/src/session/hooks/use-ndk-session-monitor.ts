import type { Hexpubkey } from "@nostr-dev-kit/ndk";
import { type NDKSigner, type NDKUser, ndkSignerFromPayload } from "@nostr-dev-kit/ndk";
import { useEffect, useRef } from "react";
import { useNDK, useNDKCurrentUser } from "../../ndk/hooks";
import {
    addOrUpdateStoredSession,
    clearActivePubkey,
    getActivePubkey,
    loadSessionsFromStorage,
    type NDKSessionStorageAdapter,
    removeStoredSession,
    storeActivePubkey,
} from "../storage";
import type { SessionStartOptions } from "../store/types";
import { useNDKSessionStart, useNDKSessionStop } from "./control";
import { useNDKSessionLogin } from "./index";
import { useNDKSessionSessions } from "./sessions";
import { useNDKSessionSigners } from "./signers";

/**
 * Interface for a stored user session, mirroring the structure used for persistence.
 */
export interface StoredSession {
    pubkey: Hexpubkey;
    signerPayload?: string; // Store the stringified payload from signer.toPayload()
}

/**
 * Hook to monitor NDK session state and persist changes to the provided storage adapter.
 * It also loads persisted sessions on initial mount.
 *
 * @param sessionStorage A storage adapter implementing NDKSessionStorageAdapter
 * @param opts Optional session start options
 */
export function useNDKSessionMonitor(sessionStorage: NDKSessionStorageAdapter | false, opts?: SessionStartOptions) {
    const { ndk } = useNDK();
    const isInitialized = useRef(false);
    const storedKeys = useRef(new Map<Hexpubkey, boolean>());
    const storedActivePubkey = sessionStorage && getActivePubkey(sessionStorage);
    const addSession = useNDKSessionLogin();
    const currentUser = useNDKCurrentUser();
    const signers = useNDKSessionSigners();
    const sessions = useNDKSessionSessions();
    const startSession = useNDKSessionStart();
    const stopSession = useNDKSessionStop();

    // Effect to initialize sessions from storage on startup
    // biome-ignore lint/correctness/useExhaustiveDependencies: We only want to run this on initial mount
    useEffect(() => {
        if (!ndk || isInitialized.current || !sessionStorage) return;

        async function initializeFromStorage() {
            if (!ndk || !sessionStorage) return;

            try {
                // Load stored sessions
                const storedSessions = loadSessionsFromStorage(sessionStorage);
                if (storedSessions.length === 0) {
                    return;
                }

                // Add all sessions to NDK
                for (const storedSession of storedSessions) {
                    const { pubkey, signerPayload } = storedSession;
                    try {
                        const user: NDKUser = ndk.getUser({ pubkey });
                        let signer: NDKSigner | undefined;

                        if (signerPayload) {
                            signer = await ndkSignerFromPayload(signerPayload, ndk);
                            if (!signer) {
                                console.warn(
                                    `[NDK] Failed to deserialize signer for ${pubkey}, session will be read-only.`,
                                );
                            } else {
                                storedKeys.current.set(pubkey, true);
                            }
                        } else {
                            storedKeys.current.set(pubkey, false);
                        }

                        // Add session to NDK
                        await addSession(signer ? signer : user, pubkey === storedActivePubkey);
                    } catch (error) {
                        console.error(
                            `[NDK] Failed to process stored session for pubkey ${storedSession.pubkey}:`,
                            error,
                        );
                    }
                }
            } catch (error) {
                console.error("[NDK] Error initializing sessions from storage:", error);
            }
        }

        initializeFromStorage().finally(() => {
            // start session
            if (storedActivePubkey) {
                startSession(storedActivePubkey, opts || {});
            }

            isInitialized.current = true;
        });
    }, [ndk, sessionStorage]);

    // Effect to persist active session changes
    useEffect(() => {
        if (!ndk || !isInitialized.current || !sessionStorage) return;

        async function persistSessions() {
            if (!ndk || !sessionStorage) return;

            // Store all signers with their payloads
            for (const [pubkey, signer] of signers) {
                if (storedKeys.current.get(pubkey)) continue;

                const payload = signer.toPayload();
                if (payload) {
                    await addOrUpdateStoredSession(sessionStorage, pubkey, payload);
                    storedKeys.current.set(pubkey, true);
                }
            }

            // Store all read-only sessions
            for (const pubkey of sessions.keys()) {
                if (storedKeys.current.has(pubkey)) continue;

                await addOrUpdateStoredSession(sessionStorage, pubkey);
                storedKeys.current.set(pubkey, true);
            }
        }

        persistSessions();
    }, [sessions, signers, ndk, sessionStorage]);

    const currentActivePubkey = useRef(currentUser?.pubkey);

    // Effect to persist active pubkey changes and start session
    // biome-ignore lint/correctness/useExhaustiveDependencies: <no need to depend on session start/stop or opts>
    useEffect(() => {
        if (!ndk || !isInitialized.current || !sessionStorage) return;
        if (currentUser?.pubkey === currentActivePubkey.current) {
            return;
        }

        async function updateActivePubkey() {
            if (!ndk || !sessionStorage) return;

            if (currentUser?.pubkey) {
                try {
                    if (currentActivePubkey.current !== currentUser.pubkey) {
                        if (currentActivePubkey.current) {
                            await stopSession(currentActivePubkey.current);
                        }
                        currentActivePubkey.current = currentUser.pubkey;
                    }
                    storeActivePubkey(sessionStorage, currentUser.pubkey);
                    await startSession(currentUser.pubkey, opts || {});
                } catch (error) {
                    console.error(`Failed to start session for active pubkey ${currentUser?.pubkey}:`, error);
                }
            } else {
                await clearActivePubkey(sessionStorage);
            }
        }

        updateActivePubkey();
        // Remove startSession and stopSession from dependencies to prevent infinite loop
        // These functions are stable enough and don't need to trigger effect re-runs
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser?.pubkey, ndk, sessionStorage]);

    // Infer the session data type from the 'sessions' map returned by the hook
    const prevSessionsRef = useRef(new Map());
    useEffect(() => {
        if (!sessionStorage) return;

        const currentSessions = sessions;
        const prevSessions = prevSessionsRef.current;

        prevSessions.forEach((_value: any, pubkey: Hexpubkey) => {
            if (!currentSessions.has(pubkey)) {
                console.log(`Session ${pubkey} detected as removed, updating storage.`);
                removeStoredSession(sessionStorage, pubkey);
            }
        });

        prevSessionsRef.current = new Map(currentSessions);
    }, [sessions, sessionStorage]);

    return null;
}
