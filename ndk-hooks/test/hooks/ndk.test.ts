import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react-hooks';
import { useNDK } from '../../src/hooks/ndk';
import { useNDKStore } from '../../src/stores/ndk';
import NDK from '@nostr-dev-kit/ndk';

// Create mocks
const mockSetNDK = vi.fn();
let mockNDK: NDK | null = null;

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
    (useNDKStore as any).mockImplementation((selector) => {
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
    });
  });
  
  it('should return ndk and setNDK from the store', () => {
    const { result } = renderHook(() => useNDK());
    
    expect(result.current).toEqual({
      ndk: null,
      setNDK: mockSetNDK,
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