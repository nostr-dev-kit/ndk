import { useMemo } from 'react';
import { useNDKStore, type NDKStoreState } from '../stores/ndk';
import type NDK from '@nostr-dev-kit/ndk';

/**
 * Interface for the useNDK hook return value
 */
interface UseNDKResult {
  /**
   * The NDK instance
   */
  ndk: NDK | null;
  
  /**
   * Function to set the NDK instance
   */
  setNDK: (ndk: NDK) => void;
}

/**
 * Hook to access the NDK instance and setNDK function
 * 
 * @returns {UseNDKResult} Object containing the NDK instance and setNDK function
 */
export const useNDK = (): UseNDKResult => {
  const ndk = useNDKStore((state) => state.ndk);
  const setNDK = useNDKStore((state) => state.setNDK);

  // Memoize the result to ensure reference stability between renders
  return useMemo(() => ({ ndk, setNDK }), [ndk, setNDK]);
};