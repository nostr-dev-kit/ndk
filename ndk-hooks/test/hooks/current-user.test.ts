import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react-hooks';
import { useNDKCurrentUser } from '../../src/hooks/current-user';
import { useNDKStore } from '../../src/stores/ndk';
import type { NDKUser } from '@nostr-dev-kit/ndk';

// Create mocks
let mockCurrentUser: NDKUser | null = null;

// Mock dependencies
vi.mock('../../src/stores/ndk', () => {
  return {
    useNDKStore: vi.fn((selector) => {
      if (typeof selector === 'function') {
        return selector({
          currentUser: mockCurrentUser,
          // No longer mocking setCurrentUser here
        });
      }
      
      // When called directly with no selector, return the store
      if (selector === undefined) {
        return { currentUser: mockCurrentUser };
      }
      
      return { currentUser: mockCurrentUser };
    }),
  };
});

describe('useNDKCurrentUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset the mocks
    mockCurrentUser = null;
    // mockSetCurrentUser removed
    
    // Update the store mock implementation
    (useNDKStore as any).mockImplementation((selector) => {
      if (typeof selector === 'function') {
        return selector({
          currentUser: mockCurrentUser,
          // No longer mocking setCurrentUser here
        });
      }
      
      // When called directly with no selector, return the store
      if (selector === undefined) {
        return { currentUser: mockCurrentUser };
      }
      
      return { currentUser: mockCurrentUser };
    });
  });
  
  it('should return only currentUser from the store', () => { // Updated test description
    const { result } = renderHook(() => useNDKCurrentUser());
    
    // Expect only currentUser
    expect(result.current).toEqual({
      currentUser: null,
    });
  });
  
  it('should return updated currentUser when store changes', () => {
    // Initial render with null currentUser
    const { result, rerender } = renderHook(() => useNDKCurrentUser());
    expect(result.current.currentUser).toBeNull();
    
    // Update the mock currentUser and rerender
    const newMockUser = { pubkey: 'test-pubkey' } as NDKUser;
    mockCurrentUser = newMockUser;
    
    rerender();
    
    expect(result.current.currentUser).toBe(newMockUser);
  });
  
  it('should maintain reference stability between rerenders', () => {
    const { result, rerender } = renderHook(() => useNDKCurrentUser());
    
    const firstRenderResult = result.current;
    
    rerender();
    
    expect(result.current).toBe(firstRenderResult);
  });
});