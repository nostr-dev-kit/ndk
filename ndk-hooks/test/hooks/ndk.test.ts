import NDK from '@nostr-dev-kit/ndk';
import { renderHook } from '@testing-library/react';
import { MockedFunction, beforeEach, describe, expect, it, vi } from 'vitest';
import { useNDK } from '../../src/hooks/ndk';
import { NDKStoreState, useNDKStore } from '../../src/stores/ndk';

// Create mocks
const mockSetNDK = vi.fn();
let mockNDK: NDK | null = null;
const mockAddSigner = vi.fn();
const mockSwitchToUser = vi.fn();

// Mock dependencies
vi.mock('../../src/stores/ndk', () => {
    return {
        useNDKStore: vi.fn((selector) => {
            if (typeof selector === 'function') {
                return selector({
                    ndk: mockNDK,
                    setNDK: mockSetNDK,
                });
            }

            // When called directly with no selector, return the store
            if (selector === undefined) {
                return { ndk: mockNDK, setNDK: mockSetNDK };
            }

            return { ndk: mockNDK, setNDK: mockSetNDK };
        }),
    };
});

describe('useNDK', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Reset the mocks
        mockNDK = null;
        mockSetNDK.mockReset();

        // Update the store mock implementation
        (useNDKStore as unknown as MockedFunction<typeof useNDKStore>).mockImplementation((selector?: (state: NDKStoreState) => unknown) => {
            const mockState: NDKStoreState = {
                ndk: mockNDK,
                setNDK: mockSetNDK,
                currentUser: null, // Add mock value
                signers: new Map(), // Add mock value (Map expected)
                addSigner: mockAddSigner, // Add mock function
                switchToUser: mockSwitchToUser, // Add mock function
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

    it('should return ndk and setNDK from the store', () => {
        const { result } = renderHook(() => useNDK());

        // Expect the full object returned by the hook/store
        expect(result.current).toEqual({
            ndk: null,
            setNDK: mockSetNDK,
            addSigner: mockAddSigner,
            switchToUser: mockSwitchToUser,
        });
    });

    it('should return updated ndk when store changes', () => {
        // Initial render with null ndk
        const { result, rerender } = renderHook(() => useNDK());
        expect(result.current.ndk).toBeNull();

        // Update the mock NDK and rerender
        const newMockNDK = new NDK({ explicitRelayUrls: [] });
        mockNDK = newMockNDK;

        rerender();

        expect(result.current.ndk).toBe(newMockNDK);
    });

    it('should maintain reference stability between rerenders', () => {
        const { result, rerender } = renderHook(() => useNDK());

        const firstRenderResult = result.current;

        rerender();

        expect(result.current).toBe(firstRenderResult);
    });
});
