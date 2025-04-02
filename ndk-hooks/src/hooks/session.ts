import NDK, {
    Hexpubkey,
    NDKEvent,
    NDKKind,
    NDKUser,
    NDKUserProfile,
} from '@nostr-dev-kit/ndk';
import { useMemo } from 'react';
import {
    SessionState,
    UserSessionData,
    useNDKSessions,
    useUserSession,
} from '../session';
import { useNDK } from './ndk';
import { useProfile } from './profile';

/**
 * Returns the list of followed pubkeys for the active session.
 * Returns an empty array if there is no active session or no follows list.
 */
export const useFollows = (): string[] => {
    const activeSession = useUserSession();
    return activeSession?.followSet ? Array.from(activeSession.followSet) : [];
};

/**
 * Returns the mute list data for the active session.
 * Includes sets of muted pubkeys, hashtags, words, event IDs, and the raw mute list event.
 * Returns default empty sets and undefined for the event if no active session exists.
 */
export const useMuteList = () => {
    const activeSession = useUserSession();
    const event = activeSession?.replaceableEvents?.get(NDKKind.MuteList);
    const pubkeys = activeSession?.mutedPubkeys ?? new Set<string>();
    const hashtags = activeSession?.mutedHashtags ?? new Set<string>();
    const words = activeSession?.mutedWords ?? new Set<string>();
    const eventIds = activeSession?.mutedEventIds ?? new Set<string>();

    return { pubkeys, hashtags, words, eventIds, event };
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
    options: UseNDKSessionEventOptions<T> &
        Required<Pick<UseNDKSessionEventOptions<T>, 'create'>>
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
    options?: Omit<UseNDKSessionEventOptions<T>, 'create'>
): T | undefined;

/**
 * Implementation for useNDKSessionEvent.
 */
export function useNDKSessionEvent<T extends NDKEvent>(
    kind: NDKKind,
    options: UseNDKSessionEventOptions<T> = {}
): T | undefined {
    const { ndk } = useNDK();
    const { create } = options;
    const activeSession = useUserSession();
    const activeSessionPubkey = useNDKSessions(
        (state) => state.activeSessionPubkey
    );

    const event = useMemo(() => {
        if (!activeSession || !activeSessionPubkey) return undefined;

        const existingEvent = activeSession.replaceableEvents.get(kind);

        if (existingEvent) return existingEvent as T;

        if (create && ndk) {
            try {
                const newInstance = new create(ndk);
                newInstance.pubkey = activeSessionPubkey;
                return newInstance;
            } catch (error) {
                console.error(
                    `Failed to create instance for kind ${kind} using provided class:`,
                    error
                );
                return undefined;
            }
        }

        return undefined;
    }, [activeSession, kind, create, ndk, activeSessionPubkey]) as
        | T
        | undefined;

    return event;
}

/**
 * Hook to retrieve the NDKUser profile object for the currently active session user.
 *
 * This hook combines session management with profile fetching.
 * It identifies the active user's public key from the session
 * and then uses `useProfile` to fetch and return their profile data.
 *
 * @returns The NDKUserProfile object for the active user, or undefined if no session is active
 *          or the profile hasn't been fetched yet.
 */
export const useCurrentUserProfile = (): NDKUserProfile | undefined => {
    const activeSessionPubkey = useNDKSessions(
        (state) => state.activeSessionPubkey
    );

    const profile = useProfile(activeSessionPubkey ?? undefined);

    return profile;
};
