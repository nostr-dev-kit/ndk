import { useMemo } from 'react';
import NDK, { NDKEvent, NDKKind, NDKUser, Hexpubkey, NDKUserProfile } from '@nostr-dev-kit/ndk';
import { useUserSession, useNDKSessions, SessionState, UserSessionData } from '../session'; // Combined imports
import { useProfile } from './profile'; // Added import for profile hook
import { useNDK } from './ndk'; // Added import

/**
 * Returns the list of followed pubkeys for the active session.
 * Returns an empty array if there is no active session or no follows list.
 */
export const useFollows = (): string[] => {
    const activeSession = useUserSession();
    // Read from followSet which is updated based on Kind 3 event
    return activeSession?.followSet ? Array.from(activeSession.followSet) : [];
};

/**
 * Returns the mute list data for the active session.
 * Includes sets of muted pubkeys, hashtags, words, event IDs, and the raw mute list event.
 * Returns default empty sets and undefined for the event if no active session exists.
 */
export const useMuteList = () => {
    const activeSession = useUserSession();
    // Read the event from replaceableEvents map
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
    options: UseNDKSessionEventOptions<T> & Required<Pick<UseNDKSessionEventOptions<T>, 'create'>>,
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
    options?: Omit<UseNDKSessionEventOptions<T>, 'create'>,
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
    // Get active session data from the main store hook
    const activeSession = useUserSession(); // Use the existing hook
    const activeSessionPubkey = useNDKSessions(state => state.activeSessionPubkey); // Need pubkey for user creation

    // Memoize the result to prevent unnecessary recalculations/creations
    const event = useMemo(() => {
        if (!activeSession || !activeSessionPubkey) {
            return undefined;
        }

        const existingEvent = activeSession.replaceableEvents.get(kind);

        if (existingEvent) return existingEvent as T;

        // Event doesn't exist, try creating if requested
        if (create && ndk) {
            try {
                // Instantiate the class, passing NDK instance if needed by constructor
                const newInstance = new create(ndk);
                 // Assign the user's pubkey if the created instance has a pubkey field
                 // (This is a common pattern but might vary depending on the class T)
                 if ('pubkey' in newInstance && activeSessionPubkey) {
                     (newInstance as any).pubkey = activeSessionPubkey;
                 }
                // Note: This newly created instance is NOT automatically saved back to the store.
                // It's returned for immediate use. Saving would require a separate action.
                return newInstance;
            } catch (error) {
                console.error(`Failed to create instance for kind ${kind} using provided class:`, error);
                return undefined;
            }
        }

        // Event doesn't exist and create option not provided or failed
        return undefined;

    }, [activeSession, kind, create, ndk, activeSessionPubkey]) as T | undefined; // Assert final type

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
    // Get active session pubkey from the main store hook
    const activeSessionPubkey = useNDKSessions(state => state.activeSessionPubkey);

    // Use the useProfile hook to get the profile for the active user's pubkey
    // Note: useProfile returns NDKUserProfile | undefined directly
    // Note: useProfile expects string | undefined, so convert null to undefined
    const profile = useProfile(activeSessionPubkey ?? undefined);

    return profile;
};