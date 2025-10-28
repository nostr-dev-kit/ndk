import type NDK from "@nostr-dev-kit/ndk";
import type { Hexpubkey, NDKEvent, NDKKind, NDKSigner, NDKUser, NDKUserProfile } from "@nostr-dev-kit/ndk";
import { useCallback, useMemo } from "react";
import { useNDK, useNDKCurrentPubkey } from "../../ndk/hooks";
import { useProfileValue } from "../../profiles/hooks";
import { useNDKSessions } from "../store";

const EMPTY_SET = new Set<Hexpubkey>();

/**
 * Hook to login a new session.
 * @param userOrSigner - A user (for read-only sessions) or a signer to login with.
 * @returns
 */
export const useNDKSessionLogin = () => {
    const addSession = useNDKSessions.getState().addSession;
    return useCallback(
        (userOrSigner: NDKUser | NDKSigner, setActive = true) => addSession(userOrSigner, setActive),
        [addSession],
    );
};

/**
 * Hook to logout the sessions
 *
 * @params pubkey - The pubkey of the user to logout. If not provided, it will use the current user's pubkey.
 * If no pubkey is provided and there is no current user, an error will be logged.
 * @returns
 */
export const useNDKSessionLogout = () => {
    const currentPubkey = useNDKCurrentPubkey();
    const removeSession = useNDKSessions.getState().removeSession;
    return useCallback(
        (pubkey?: Hexpubkey) => {
            const _pubkey = pubkey ?? currentPubkey;
            if (!_pubkey) {
                console.error("No pubkey provided for logout");
                return;
            }
            removeSession(_pubkey);
        },
        [removeSession, currentPubkey],
    );
};

/**
 * Hook to swtich the active session.
 * @returns
 */
export const useNDKSessionSwitch = () => {
    const switchToUser = useNDKSessions.getState().switchToUser;
    return useCallback((pubkey: Hexpubkey | null) => switchToUser(pubkey), [switchToUser]);
};

/**
 * Returns the list of followed pubkeys for the active session.
 * Returns an empty set if there is no active session or no follows list.
 */
export const useFollows = (): Set<Hexpubkey> => {
    return useNDKSessions((s) =>
        s.activePubkey ? (s.sessions.get(s.activePubkey)?.followSet ?? EMPTY_SET) : EMPTY_SET,
    );
};

interface UseNDKSessionEventOptions<T extends NDKEvent> {
    /**
     * Optional class (e.g., NDKList) to create a new, default instance
     * of the event type if none is found in the session.
     * The class should extend NDKEvent and have a constructor compatible with `new (ndk?: NDK) => T`.
     */
    create?: typeof NDKEvent & (new (ndk?: NDK) => T);
}

/**
 * Hook to retrieve a specific replaceable event (by kind) from the active user's session.
 * Creates a new instance if the event doesn't exist and the `create` option is provided.
 *
 * @param kind The NDKKind of the replaceable event to retrieve.
 * @param options Configuration object containing the `create` option.
 * @returns The NDKEvent (or subclass instance T). Guaranteed to return an instance if `create` is provided.
 */
export function useNDKSessionEvent<T extends NDKEvent>(
    kind: NDKKind,
    options: UseNDKSessionEventOptions<T> & Required<Pick<UseNDKSessionEventOptions<T>, "create">>,
): T;

/**
 * Hook to retrieve a specific replaceable event (by kind) from the active user's session.
 *
 * @param kind The NDKKind of the replaceable event to retrieve.
 * @param options Optional configuration (without `create` specified).
 * @returns The NDKEvent (or subclass instance T), or undefined if not found.
 */
export function useNDKSessionEvent<T extends NDKEvent>(
    kind: NDKKind,
    options?: Omit<UseNDKSessionEventOptions<T>, "create">,
): T | undefined;

/**
 * Implementation for useNDKSessionEvent.
 */
export function useNDKSessionEvent<T extends NDKEvent>(
    kind: NDKKind,
    options: UseNDKSessionEventOptions<T> = {},
): T | undefined {
    const { ndk } = useNDK();
    const { create } = options;
    const activePubkey = useNDKSessions((s) => s.activePubkey);
    const activeSessionEvents = useNDKSessions((s) =>
        s.activePubkey ? s.sessions.get(s.activePubkey)?.events : undefined,
    );

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    const event = useMemo(() => {
        if (!activeSessionEvents || !activePubkey) return undefined;

        const existingEvent = activeSessionEvents.get(kind);

        if (existingEvent) return existingEvent as T;

        if (create && ndk) {
            try {
                const newInstance = new create(ndk);
                newInstance.pubkey = activePubkey;
                return newInstance;
            } catch (error) {
                console.error(`Failed to create instance for kind ${kind} using provided class:`, error);
                return undefined;
            }
        }

        return undefined;
    }, [activeSessionEvents, kind, ndk, activePubkey]) as T | undefined;

    return event;
}

/**
 * Hook to retrieve the NDKUser profile object for the currently active session user.
 *
 * This hook combines session management with profile fetching.
 * It identifies the active user's public key from the session
 * and then uses `useProfileValue` to fetch and return their profile data.
 *
 * @returns The NDKUserProfile object for the active user, or undefined if no session is active
 *          or the profile hasn't been fetched yet.
 */
export const useCurrentUserProfile = (): NDKUserProfile | undefined => {
    const activePubkey = useNDKSessions((state) => state.activePubkey);

    const profile = useProfileValue(activePubkey ?? undefined);

    return profile;
};
