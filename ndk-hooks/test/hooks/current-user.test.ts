import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react-hooks';
import { useNDKCurrentUser } from '../../src/hooks/current-user';
import { useNDKStore } from '../../src/stores/ndk';
import type { NDKUser } from '@nostr-dev-kit/ndk';

// Create mocks
const mockSetCurrentUser = vi.fn();
let mockCurrentUser: NDKUser | null = null;

// Mock dependencies
vi.mock('../../src/stores/ndk', () => {
  return {
    useNDKStore: vi.fn((selector) => {
      if (typeof selector === 'function') {
        return selector({
          currentUser: mockCurrentUser,
          setCurrentUser: mockSetCurrentUser,
        });
      }
      
      // When called directly with no selector, return the store
      if (selector === undefined) {
        return { currentUser: mockCurrentUser, setCurrentUser: mockSetCurrentUser };
      }
      
      return { currentUser: mockCurrentUser, setCurrentUser: mockSetCurrentUser };
    }),
  };
});

describe('useNDKCurrentUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset the mocks
    mockCurrentUser = null;
    mockSetCurrentUser.mockReset();
    
    // Update the store mock implementation
    (useNDKStore as any).mockImplementation((selector) => {
      if (typeof selector === 'function') {
        return selector({
          currentUser: mockCurrentUser,
          setCurrentUser: mockSetCurrentUser,
        });
      }
      
      // When called directly with no selector, return the store
      if (selector === undefined) {
        return { currentUser: mockCurrentUser, setCurrentUser: mockSetCurrentUser };
      }
      
      return { currentUser: mockCurrentUser, setCurrentUser: mockSetCurrentUser };
    });
  });
  
  it('should return currentUser and setCurrentUser from the store', () => {
    const { result } = renderHook(() => useNDKCurrentUser());
    
    expect(result.current).toEqual({
      currentUser: null,
      setCurrentUser: mockSetCurrentUser,
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