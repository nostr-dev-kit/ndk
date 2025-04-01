import { useMemo } from 'react';
import { useNDKStore, type NDKStoreState } from '../stores/ndk';
import type { NDKUser } from '@nostr-dev-kit/ndk';

/**
 * Interface for the useNDKCurrentUser hook return value
 */
interface UseNDKCurrentUserResult {
  /**
   * The current user (if logged in)
   */
  currentUser: NDKUser | null;
}

/**
 * Hook to access the current user state from the NDK store.
 *
 * Note: Setting the current user is handled via the `switchToUser` action in the `useNDKStore`.
 *
 * @returns {UseNDKCurrentUserResult} Object containing the current user.
 */
export const useNDKCurrentUser = (): UseNDKCurrentUserResult => {
  const currentUser = useNDKStore((state) => state.currentUser);

  // Memoize the result to ensure reference stability between renders
  return useMemo(() => ({ currentUser }), [currentUser]);
};