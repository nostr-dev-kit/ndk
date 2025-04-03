import type { Hexpubkey } from '@nostr-dev-kit/ndk';
import { useMemo } from 'react';
import { useNDKSessions } from '../store'; // Corrected import path

/**
 * Interface for the useAvailableSessions hook return value
 */
interface UseAvailableSessionsResult {
    /**
     * An array of hex pubkeys for which signers are available in the store.
     * Represents the available user sessions (started sessions).
     */
    availablePubkeys: Hexpubkey[];
}

/**
 * Hook to get a list of available session pubkeys.
 *
 * This hook retrieves the list of signers from the NDK store
 * and returns an array of their corresponding public keys (from started sessions).
 * This represents the sessions that the user can potentially switch to.
 *
 * @returns {UseAvailableSessionsResult} Object containing an array of available pubkeys.
 */
export const useAvailableSessions = (): UseAvailableSessionsResult => {
    const sessions = useNDKSessions((state) => state.sessions); // Use sessions store and sessions map

    const availablePubkeys = useMemo(
        () => Array.from(sessions.keys()), // Get keys from sessions map
        [sessions]
    );

    return useMemo(() => ({ availablePubkeys }), [availablePubkeys]);
};
