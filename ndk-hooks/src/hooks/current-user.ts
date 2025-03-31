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
  
  /**
   * Function to set the current user
   */
  setCurrentUser: (user: NDKUser | null) => void;
}

/**
 * Hook to access the current user and setCurrentUser function
 * 
 * @returns {UseNDKCurrentUserResult} Object containing the current user and setCurrentUser function
 */
export const useNDKCurrentUser = (): UseNDKCurrentUserResult => {
  const currentUser = useNDKStore((state) => state.currentUser);
  const setCurrentUser = useNDKStore((state) => state.setCurrentUser);

  // Memoize the result to ensure reference stability between renders
  return useMemo(() => ({ currentUser, setCurrentUser }), [currentUser, setCurrentUser]);
};