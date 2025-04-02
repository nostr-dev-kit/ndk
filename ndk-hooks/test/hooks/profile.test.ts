import { act, renderHook } from '@testing-library/react';
import { MockedFunction, beforeEach, describe, expect, it, vi } from 'vitest';
import { useProfile } from '../../src/hooks/profile';
import { UserProfilesStore, useUserProfilesStore } from '../../src/stores/profiles';

// Create mocks
const mockFetchProfile = vi.fn();
const mockProfiles = new Map();
const mockInitialize = vi.fn();
const mockSetProfile = vi.fn();

// Mock dependencies
vi.mock('../../src/stores/profiles', () => {
    return {
        useUserProfilesStore: vi.fn((selector) => {
            if (typeof selector === 'function') {
                return selector({
                    profiles: mockProfiles,
                    fetchProfile: mockFetchProfile,
                });
            }

            // When called directly with no selector, return the fetchProfile function
            if (selector === undefined) {
                return { fetchProfile: mockFetchProfile };
            }

            return mockFetchProfile;
        }),
    };
});

describe('useProfile', () => {
    const testPubkey =
        '000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f';
    const mockProfile = {
        name: 'Test User',
        picture: 'https://example.com/pic.jpg',
    };

    beforeEach(() => {
        vi.clearAllMocks();

        // Reset the mocks
        mockProfiles.clear();
        mockFetchProfile.mockReset();

        // Update the store mock implementation
        (useUserProfilesStore as unknown as MockedFunction<typeof useUserProfilesStore>).mockImplementation((selector?: (state: UserProfilesStore) => unknown) => {
            const mockState: UserProfilesStore = {
                ndk: undefined, // Add mock value
                profiles: mockProfiles,
                lastFetchedAt: new Map(), // Add mock value
                initialize: mockInitialize, // Add mock function
                setProfile: mockSetProfile, // Add mock function
                fetchProfile: mockFetchProfile,
            };

            if (typeof selector === 'function') {
                return selector(mockState);
            }

            // When called directly with no selector, return the store
            if (selector === undefined) {
                return mockState;
            }

            return mockState;
        });
    });

    it('should return undefined if no pubkey is provided', () => {
        const { result } = renderHook(() => useProfile(undefined));
        expect(result.current).toBeUndefined();
    });

    it('should call fetchProfile with the provided pubkey', () => {
        renderHook(() => useProfile(testPubkey));

        expect(mockFetchProfile).toHaveBeenCalledWith(testPubkey, undefined);
    });

    it('should call fetchProfile with forceRefresh when provided', () => {
        renderHook(() => useProfile(testPubkey, true));

        expect(mockFetchProfile).toHaveBeenCalledWith(testPubkey, true);
    });

    it('should return profile when available in the store', () => {
        // Add the profile to the mock profiles map
        mockProfiles.set(testPubkey, mockProfile);

        const { result } = renderHook(() => useProfile(testPubkey));

        expect(result.current).toEqual(mockProfile);
    });
});
