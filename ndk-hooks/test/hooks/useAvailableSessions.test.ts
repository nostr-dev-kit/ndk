// test/hooks/useAvailableSessions.test.ts

import type { NDKSigner } from '@nostr-dev-kit/ndk';
import { renderHook } from '@testing-library/react-hooks'; // Correct import
import { vi } from 'vitest';
import { useAvailableSessions } from '../../src/hooks/useAvailableSessions';
import { useNDKStore } from '../../src/stores/ndk';

// Mock useNDKStore
vi.mock('../../src/stores/ndk', () => ({
    useNDKStore: vi.fn(),
}));

// Helper to set the mock return value for useNDKStore selector
const mockUseNDKStoreSelector = (signers: Map<string, NDKSigner>) => {
    (useNDKStore as any).mockImplementation((selector: (state: any) => any) => {
        return selector({ signers });
    });
};

describe('useAvailableSessions', () => {
    beforeEach(() => {
        // Reset mocks before each test
        vi.clearAllMocks();
    });

    it('should return an empty array when no signers are available', () => {
        const mockSigners = new Map<string, NDKSigner>();
        mockUseNDKStoreSelector(mockSigners);

        const { result } = renderHook(() => useAvailableSessions());
        expect(result.current.availablePubkeys).toEqual([]);
    });

    it('should return an array of pubkeys when signers are available', () => {
        const mockSigners = new Map<string, NDKSigner>([
            ['pubkey1', {} as NDKSigner], // Cast to NDKSigner for type safety
            ['pubkey2', {} as NDKSigner],
        ]);
        mockUseNDKStoreSelector(mockSigners);

        const { result } = renderHook(() => useAvailableSessions());
        // Sort the result to ensure consistent order for comparison
        expect(result.current.availablePubkeys.sort()).toEqual(
            ['pubkey1', 'pubkey2'].sort()
        );
    });

    it('should return the same array reference if signers map reference does not change', () => {
        const mockSigners = new Map<string, NDKSigner>([
            ['pubkey1', {} as NDKSigner],
        ]);
        mockUseNDKStoreSelector(mockSigners);

        const { result, rerender } = renderHook(() => useAvailableSessions());
        const firstResult = result.current.availablePubkeys;

        // Rerender without changing the underlying store state
        rerender();

        const secondResult = result.current.availablePubkeys;
        expect(secondResult).toBe(firstResult); // Check for reference equality
    });

    it('should return a new array reference if signers map reference changes', () => {
        const initialSigners = new Map<string, NDKSigner>([
            ['pubkey1', {} as NDKSigner],
        ]);
        mockUseNDKStoreSelector(initialSigners);

        const { result, rerender } = renderHook(() => useAvailableSessions());
        const firstResult = result.current.availablePubkeys;
        expect(firstResult).toEqual(['pubkey1']);

        // Simulate store update with a new map instance
        const updatedSigners = new Map<string, NDKSigner>([
            ['pubkey1', {} as NDKSigner],
            ['pubkey2', {} as NDKSigner],
        ]);
        mockUseNDKStoreSelector(updatedSigners);

        rerender(); // Rerender after store state change simulation

        const secondResult = result.current.availablePubkeys;
        expect(secondResult).toEqual(['pubkey1', 'pubkey2']);
        expect(secondResult).not.toBe(firstResult); // Check that the reference is different
    });
});
