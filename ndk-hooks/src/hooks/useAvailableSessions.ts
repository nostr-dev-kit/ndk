import type { Hexpubkey } from '@nostr-dev-kit/ndk';
import { useMemo } from 'react';
import { useNDKStore } from '../stores/ndk';

/**
 * Interface for the useAvailableSessions hook return value
 */
interface UseAvailableSessionsResult {
    /**
     * An array of hex pubkeys for which signers are available in the store.
     * Represents the available user sessions.
     */
    availablePubkeys: Hexpubkey[];
}

/**
 * Hook to get a list of available session pubkeys.
 *
 * This hook retrieves the list of signers from the NDK store
 * and returns an array of their corresponding public keys.
 * This represents the sessions that the user can potentially switch to.
 *
 * @returns {UseAvailableSessionsResult} Object containing an array of available pubkeys.
 */
export const useAvailableSessions = (): UseAvailableSessionsResult => {
    const signers = useNDKStore((state) => state.signers);

    const availablePubkeys = useMemo(() => Array.from(signers.keys()), [signers]);

    return useMemo(() => ({ availablePubkeys }), [availablePubkeys]);
};
