import { describe, it, expect, vi, beforeEach } from 'vitest';
import NDK from '@nostr-dev-kit/ndk';
import { act } from '@testing-library/react-hooks';
import { useNDKStore } from '../../src/stores/ndk';

describe('NDK Store', () => {
  beforeEach(() => {
    // Reset store before each test
    useNDKStore.setState({
      ndk: null,
      currentUser: null,
      setNDK: useNDKStore.getState().setNDK,
      setCurrentUser: useNDKStore.getState().setCurrentUser,
    });
    
    vi.clearAllMocks();
  });

  it('should initialize with null values', () => {
    const { ndk, currentUser } = useNDKStore.getState();
    expect(ndk).toBeNull();
    expect(currentUser).toBeNull();
  });

  it('should set NDK instance via setNDK', () => {
    const { setNDK } = useNDKStore.getState();
    const mockNDK = new NDK({ explicitRelayUrls: [] });
    
    act(() => {
      setNDK(mockNDK);
    });
    
    const { ndk } = useNDKStore.getState();
    expect(ndk).toBe(mockNDK);
  });

  it('should set up event listener for signer:ready', () => {
    const { setNDK } = useNDKStore.getState();
    const mockNDK = new NDK({ explicitRelayUrls: [] });
    mockNDK.on = vi.fn();
    
    act(() => {
      setNDK(mockNDK);
    });
    
    expect(mockNDK.on).toHaveBeenCalledWith('signer:ready', expect.any(Function));
  });

  it('should update currentUser when signer is ready', () => {
    const { setNDK } = useNDKStore.getState();
    const mockNDK = new NDK({ explicitRelayUrls: [] });
    const mockUser = { pubkey: 'test-pubkey', ndk: mockNDK };
    
    // Mock the on method to capture the callback
    let signerReadyCallback;
    mockNDK.on = vi.fn((event: string, callback: any) => {
      if (event === 'signer:ready') {
        signerReadyCallback = callback;
      }
    }) as any;
    
    // Mock activeUser to return our test user
    mockNDK.activeUser = mockUser as any;
    
    act(() => {
      setNDK(mockNDK);
    });
    
    // Trigger the signer:ready event
    act(() => {
      signerReadyCallback();
    });
    
    const { currentUser } = useNDKStore.getState();
    expect(currentUser).toBe(mockUser);
    // expect(mockNDK.getUser).toHaveBeenCalledTimes(1);
  });

  it('should manually set currentUser', () => {
    const { setCurrentUser } = useNDKStore.getState();
    const mockUser = { pubkey: 'test-pubkey' };
    
    act(() => {
      setCurrentUser(mockUser as any);
    });
    
    const { currentUser } = useNDKStore.getState();
    expect(currentUser).toBe(mockUser);
  });

  it('should clean up event listeners when setting a new NDK instance', () => {
    const { setNDK } = useNDKStore.getState();
    const mockNDK1 = new NDK({ explicitRelayUrls: [] });
    const mockNDK2 = new NDK({ explicitRelayUrls: [] });
    
    mockNDK1.on = vi.fn();
    mockNDK1.off = vi.fn();
    mockNDK2.on = vi.fn();
    
    // Set the first NDK instance
    act(() => {
      setNDK(mockNDK1);
    });
    
    // Now set a second NDK instance
    act(() => {
      setNDK(mockNDK2);
    });
    
    // Verify cleanup was done on the first instance
    expect(mockNDK1.off).toHaveBeenCalledWith('signer:ready', expect.any(Function));
    // And the new instance has listeners set up
    expect(mockNDK2.on).toHaveBeenCalledWith('signer:ready', expect.any(Function));
  });
});