import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useUserProfilesStore } from '../../src/stores/profiles';
import { act } from '@testing-library/react-hooks';

// Mock NDK dependencies
const mockFetchProfile = vi.fn();
const mockUser = {
    fetchProfile: vi.fn(() => Promise.resolve({ name: 'Test User' })),
};

const mockNDK = {
    cacheAdapter: {
        getAllProfilesSync: vi.fn(() => {
            const profiles = new Map();
            profiles.set('cachedPubkey', { 
                name: 'Cached User',
                cachedAt: 1000,
            });
            return profiles;
        }),
    },
    getUser: vi.fn(() => mockUser),
};

describe('Profiles Store', () => {
    const testPubkey = '000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f';
    const testProfile = { name: 'Test User', picture: 'https://example.com/pic.jpg' };
    
    beforeEach(() => {
        // Reset store by getting the current state and setting it back with empty collections
        useUserProfilesStore.setState({
            ndk: undefined,
            profiles: new Map(),
            lastFetchedAt: new Map(),
            initialize: useUserProfilesStore.getState().initialize,
            setProfile: useUserProfilesStore.getState().setProfile,
            fetchProfile: useUserProfilesStore.getState().fetchProfile,
        });
        
        vi.clearAllMocks();
    });
    
    describe('initialize', () => {
        it('should initialize the store with cached profiles', () => {
            const store = useUserProfilesStore.getState();
            
            act(() => {
                store.initialize(mockNDK as any);
            });
            
            const state = useUserProfilesStore.getState();
            expect(state.ndk).toBe(mockNDK);
            expect(state.profiles.size).toBe(1);
            expect(state.profiles.get('cachedPubkey')).toEqual({ name: 'Cached User', cachedAt: 1000 });
            expect(state.lastFetchedAt.get('cachedPubkey')).toBe(1000);
        });
        
        it('should not populate state if no cache adapter is available', () => {
            const store = useUserProfilesStore.getState();
            const mockEmptyNDK = { cacheAdapter: null };
            
            act(() => {
                store.initialize(mockEmptyNDK as any);
            });
            
            const state = useUserProfilesStore.getState();
            expect(state.profiles.size).toBe(0);
        });
    });
    
    describe('setProfile', () => {
        it('should add a profile to the store', () => {
            const store = useUserProfilesStore.getState();
            
            act(() => {
                store.setProfile(testPubkey, testProfile);
            });
            
            const state = useUserProfilesStore.getState();
            expect(state.profiles.get(testPubkey)).toEqual(testProfile);
            expect(state.lastFetchedAt.has(testPubkey)).toBe(true);
        });
        
        it('should use provided cachedAt timestamp', () => {
            const store = useUserProfilesStore.getState();
            const timestamp = 12345;
            
            act(() => {
                store.setProfile(testPubkey, testProfile, timestamp);
            });
            
            const state = useUserProfilesStore.getState();
            expect(state.lastFetchedAt.get(testPubkey)).toBe(timestamp);
        });
    });
    
    describe('fetchProfile', () => {
        it('should not fetch if pubkey is undefined', async () => {
            const store = useUserProfilesStore.getState();
            
            act(() => {
                store.fetchProfile(undefined);
            });
            
            expect(mockNDK.getUser).not.toHaveBeenCalled();
        });
        
        it('should not fetch if NDK is not initialized', async () => {
            const store = useUserProfilesStore.getState();
            
            act(() => {
                store.fetchProfile(testPubkey);
            });
            
            expect(mockNDK.getUser).not.toHaveBeenCalled();
        });
        
        it('should fetch and store profile when NDK is initialized', async () => {
            const store = useUserProfilesStore.getState();
            
            act(() => {
                store.initialize(mockNDK as any);
            });
            
            await act(async () => {
                store.fetchProfile(testPubkey);
            });
            
            expect(mockNDK.getUser).toHaveBeenCalledWith({ pubkey: testPubkey });
            expect(mockUser.fetchProfile).toHaveBeenCalled();
            
            // Wait for async operation to complete
            await vi.waitFor(() => {
                const state = useUserProfilesStore.getState();
                expect(state.profiles.has(testPubkey)).toBe(true);
            });
        });
        
        it('should update lastFetchedAt even if profile fetch fails', async () => {
            const store = useUserProfilesStore.getState();
            
            // Make the fetch fail
            mockUser.fetchProfile.mockRejectedValueOnce(new Error('Fetch failed'));
            
            act(() => {
                store.initialize(mockNDK as any);
            });
            
            await act(async () => {
                store.fetchProfile(testPubkey);
            });
            
            expect(mockNDK.getUser).toHaveBeenCalledWith({ pubkey: testPubkey });
            
            // Wait for async operation to complete
            await vi.waitFor(() => {
                const state = useUserProfilesStore.getState();
                expect(state.lastFetchedAt.has(testPubkey)).toBe(true);
                expect(state.profiles.has(testPubkey)).toBe(false);
            });
        });
    });
});