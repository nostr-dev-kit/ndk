import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import NDK, { NDKSigner, NDKUser, Hexpubkey } from '@nostr-dev-kit/ndk';
import { act } from '@testing-library/react-hooks'; // Revert back
import { useNDKStore } from '../../src/stores/ndk';

describe('NDK Store', () => {
  // Mock NDK, Users, and Signers
  const mockNDK = new NDK({ explicitRelayUrls: [] });
  const mockUser1 = { pubkey: 'pubkey1', profile: { name: 'User 1' } } as unknown as NDKUser;
  const mockUser2 = { pubkey: 'pubkey2', profile: { name: 'User 2' } } as unknown as NDKUser;
  const readOnlyUserPubkey: Hexpubkey = 'pubkey3';
  const mockUser3 = { pubkey: readOnlyUserPubkey, profile: { name: 'User 3' } } as unknown as NDKUser;

  const mockSigner1: NDKSigner = {
    user: vi.fn(),
    sign: vi.fn(),
    encrypt: vi.fn(),
    decrypt: vi.fn(),
    pubkey: 'pubkey1',
    blockUntilReady: vi.fn(() => Promise.resolve(mockUser1)),
    userSync: mockUser1,
  };
  const mockSigner2: NDKSigner = {
    user: vi.fn(),
    sign: vi.fn(),
    encrypt: vi.fn(),
    decrypt: vi.fn(),
    pubkey: 'pubkey2',
    blockUntilReady: vi.fn(() => Promise.resolve(mockUser2)),
    userSync: mockUser2,
  };

  beforeEach(() => {
    // Reset store state before each test
    useNDKStore.setState({
      ndk: null,
      currentUser: null,
      signers: new Map<Hexpubkey, NDKSigner>(),
      // Keep function references
      setNDK: useNDKStore.getState().setNDK,
      addSigner: useNDKStore.getState().addSigner,
      switchToUser: useNDKStore.getState().switchToUser,
    }, true); // Replace the state entirely

    // Mock NDK methods
    mockNDK.getUser = vi.fn((opts) => {
        if (opts.pubkey === 'pubkey1') return mockUser1;
        if (opts.pubkey === 'pubkey2') return mockUser2;
        if (opts.pubkey === readOnlyUserPubkey) return mockUser3;
        return { pubkey: opts.pubkey } as NDKUser;
    });
    mockNDK.signer = undefined; // Reset signer

    // Mock signer methods (remove problematic casts)
    vi.mocked(mockSigner1.user).mockResolvedValue(mockUser1);
    vi.mocked(mockSigner2.user).mockResolvedValue(mockUser2);

    // Mock console
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks(); // Restore original console methods etc.
  });

  it('should initialize with null ndk, null currentUser, and empty signers map', () => {
    const { ndk, currentUser, signers } = useNDKStore.getState();
    expect(ndk).toBeNull();
    expect(currentUser).toBeNull();
    expect(signers).toBeInstanceOf(Map);
    expect(signers.size).toBe(0);
  });

  it('should set NDK instance via setNDK', () => {
    const { setNDK } = useNDKStore.getState();
    act(() => {
      setNDK(mockNDK);
    });
    const { ndk } = useNDKStore.getState();
    expect(ndk).toBe(mockNDK);
  });

  describe('addSigner', () => {
    it('should add a signer to the signers map', async () => {
      const { addSigner } = useNDKStore.getState();
      await act(async () => {
        await addSigner(mockSigner1);
      });
      const { signers } = useNDKStore.getState();
      expect(signers.size).toBe(1);
      expect(signers.get('pubkey1')).toBe(mockSigner1);
      expect(mockSigner1.user).toHaveBeenCalledTimes(1);
      expect(console.log).toHaveBeenCalledWith('Signer added for pubkey: pubkey1');
    });

    it('should handle errors when adding a signer', async () => {
      const { addSigner } = useNDKStore.getState();
      const error = new Error('Signer error');
      vi.mocked(mockSigner1.user).mockRejectedValueOnce(error); // remove problematic cast
      await act(async () => {
        await addSigner(mockSigner1);
      });
      const { signers } = useNDKStore.getState();
      expect(signers.size).toBe(0);
      expect(console.error).toHaveBeenCalledWith('Failed to add signer:', error);
    });
  });

  describe('switchToUser', () => {
    beforeEach(() => {
      // Ensure NDK is set for these tests
      act(() => {
        useNDKStore.getState().setNDK(mockNDK);
      });
    });

    it('should switch to a user with an available signer', async () => {
      const { addSigner, switchToUser } = useNDKStore.getState();
      await act(async () => {
        await addSigner(mockSigner1);
        await switchToUser('pubkey1');
      });

      const { currentUser, signers } = useNDKStore.getState();
      expect(mockNDK.signer).toBe(mockSigner1);
      expect(currentUser).toBe(mockUser1);
      expect(mockNDK.getUser).toHaveBeenCalledWith({ pubkey: 'pubkey1' });
      expect(console.log).toHaveBeenCalledWith('Switched to user pubkey1 with active signer.');
    });

    it('should switch to a user without a signer (read-only)', async () => {
      const { switchToUser } = useNDKStore.getState();
      await act(async () => {
        await switchToUser(readOnlyUserPubkey);
      });

      const { currentUser } = useNDKStore.getState();
      expect(mockNDK.signer).toBeUndefined();
      expect(currentUser).toBe(mockUser3);
      expect(mockNDK.getUser).toHaveBeenCalledWith({ pubkey: readOnlyUserPubkey });
      expect(console.log).toHaveBeenCalledWith(`Switched to user ${readOnlyUserPubkey} in read-only mode.`);
    });

     it('should switch between users with signers', async () => {
      const { addSigner, switchToUser } = useNDKStore.getState();
      await act(async () => {
        await addSigner(mockSigner1);
        await addSigner(mockSigner2);
        await switchToUser('pubkey1'); // Switch to user 1
      });

      expect(mockNDK.signer).toBe(mockSigner1);
      expect(useNDKStore.getState().currentUser).toBe(mockUser1);

      await act(async () => {
        await switchToUser('pubkey2'); // Switch to user 2
      });

      expect(mockNDK.signer).toBe(mockSigner2);
      expect(useNDKStore.getState().currentUser).toBe(mockUser2);
      expect(console.log).toHaveBeenCalledWith('Switched to user pubkey2 with active signer.');
    });

    it('should switch from a signed-in user to read-only', async () => {
        const { addSigner, switchToUser } = useNDKStore.getState();
        await act(async () => {
            await addSigner(mockSigner1);
            await switchToUser('pubkey1'); // Switch to user 1
        });

        expect(mockNDK.signer).toBe(mockSigner1);
        expect(useNDKStore.getState().currentUser).toBe(mockUser1);

        await act(async () => {
            await switchToUser(readOnlyUserPubkey); // Switch to read-only user
        });

        expect(mockNDK.signer).toBeUndefined();
        expect(useNDKStore.getState().currentUser).toBe(mockUser3);
        expect(console.log).toHaveBeenCalledWith(`Switched to user ${readOnlyUserPubkey} in read-only mode.`);
    });


    it('should log an error if NDK instance is not initialized', async () => {
      // Reset NDK to null using setState with replace: true requires the full state
      useNDKStore.setState({
        ndk: null,
        currentUser: null,
        signers: new Map(),
        // Keep function references from the actual store state
        setNDK: useNDKStore.getState().setNDK,
        addSigner: useNDKStore.getState().addSigner,
        switchToUser: useNDKStore.getState().switchToUser,
      }, true);

      const { switchToUser } = useNDKStore.getState();
      await act(async () => {
        await switchToUser('pubkey1');
      });

      expect(console.error).toHaveBeenCalledWith('Cannot switch user: NDK instance not initialized.');
      expect(useNDKStore.getState().currentUser).toBeNull();
      expect(mockNDK.signer).toBeUndefined(); // Should remain undefined
    });
  });
});