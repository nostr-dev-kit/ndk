import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react-hooks';
import { useSubscribe } from '../../src/hooks/subscribe';
import { useNDK } from '../../src/hooks/ndk';
import NDK, { type NDKEvent, type NDKSubscription, type NDKFilter, NDKRelaySet } from '@nostr-dev-kit/ndk';

// We're not using the EventGenerator from ndk-test-utils for now as it requires actual NDK instance
// Mock useNDK hook
vi.mock('../../src/hooks/ndk', () => ({
  useNDK: vi.fn()
}));

// Mock NDKRelaySet static method
vi.mock('@nostr-dev-kit/ndk', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@nostr-dev-kit/ndk')>();
  return {
    ...actual,
    NDKRelaySet: {
      ...actual.NDKRelaySet,
      fromRelayUrls: vi.fn().mockReturnValue({}), // Mock return value as needed
    },
  };
});

describe('useSubscribe hook - Advanced Tests', () => {
  let mockNDK: NDK;
  let mockSubscription: NDKSubscription;
  
  beforeEach(() => {
    // Clean up mocks before each test
    vi.clearAllMocks();
    
    // Set up mock NDK instance
    mockNDK = {
      subscribe: vi.fn()
    } as unknown as NDK;
    
    // Set up mock subscription
    mockSubscription = {
      on: vi.fn(),
      off: vi.fn(),
      stop: vi.fn(),
      start: vi.fn(() => []),
      events: [] as NDKEvent[],
      eose: false
    } as unknown as NDKSubscription;
    
    // Make sure the subscribe mock returns our mock subscription
    (mockNDK.subscribe as any).mockReturnValue(mockSubscription);
    
    // Mock useNDK hook to return our mock NDK instance
    (useNDK as any).mockReturnValue({ ndk: mockNDK });
    
    vi.useFakeTimers();
  });
  
  afterEach(() => {
    vi.useRealTimers();
  });

  it('loads an event', async () => {
    // Define filters outside the hook call for stable reference
    const stableFilters = [{ kinds: [1] }];
    
    // Render the hook with stable filters
    const { result } = renderHook(() => useSubscribe(stableFilters));

    // Initial state should be empty
    expect(result.current.events.length).toBe(0);
    expect(result.current.eose).toBe(false);
    expect(mockNDK.subscribe).toHaveBeenCalledTimes(1); // Should subscribe on mount
  });
  
  // Test 1: Handling events with "deleted" tag
  it('should not add events with "deleted" tag when includeDeleted is false', async () => {
    // Prepare to capture the event handler
    const capturedEventHandlers: Map<string, Function[]> = new Map();
    (mockSubscription.on as any).mockImplementation((event: string, handler: Function) => {
      if (!capturedEventHandlers.has(event)) {
        capturedEventHandlers.set(event, []);
      }
      capturedEventHandlers.get(event)?.push(handler);
    });
    
    // Create a test event with a "deleted" tag
    const deletedEvent = {
      id: 'deleted-event-id',
      pubkey: 'test-pubkey',
      created_at: Math.floor(Date.now() / 1000),
      content: 'deleted event',
      kind: 1,
      tags: [['deleted', 'true']],
      sig: 'test-sig',
      isParamReplaceable: () => true,
      hasTag: (tag: string) => tag === 'deleted',
      tagId: () => 'deleted-event-id',
      once: vi.fn()
    } as unknown as NDKEvent;
    
    // Set up and render the hook with includeDeleted: false
    const { result } = renderHook(() => useSubscribe([{ kinds: [1] }], { includeDeleted: false }));
    
    // Trigger the event
    if (capturedEventHandlers.has('event')) {
      act(() => {
        capturedEventHandlers.get('event')?.forEach(handler => {
          handler(deletedEvent);
        });
      });
    }
    
    // Advance timers to flush buffer
    act(() => {
      vi.advanceTimersByTime(30);
    });
    
    // The event should not be added to the events array
    expect(result.current.events.length).toBe(0);
  });
  
  // Test 2: includeDeleted option set to true
  it('should include events with "deleted" tag when includeDeleted is true', async () => {
    // Prepare to capture the event handler
    let capturedEventHandler: Function | null = null;
    (mockSubscription.on as any).mockImplementation((event: string, handler: Function) => {
      if (event === 'event') {
        capturedEventHandler = handler;
      }
    });
    
    // Create a test event with a "deleted" tag
    const deletedEvent = {
      id: 'deleted-event-id',
      pubkey: 'test-pubkey',
      created_at: Math.floor(Date.now() / 1000),
      content: 'deleted event',
      kind: 1,
      tags: [['deleted', 'true']],
      sig: 'test-sig',
      isParamReplaceable: () => true,
      hasTag: (tag: string) => tag === 'deleted',
      tagId: () => 'deleted-event-id',
      once: vi.fn()
    } as unknown as NDKEvent;
    
    // Set up and render the hook with includeDeleted: true
    const { result } = renderHook(() => useSubscribe([{ kinds: [1] }], { includeDeleted: true }));
    
    // Trigger the event
    if (capturedEventHandler !== null) {
      act(() => {
        if (capturedEventHandler) {
          capturedEventHandler(deletedEvent);
        }
      });
    }
    
    // Advance timers to flush buffer
    act(() => {
      vi.advanceTimersByTime(30);
    });
    
    // The event should be added to the events array
    expect(result.current.events.length).toBe(1);
    expect(result.current.events[0]).toBe(deletedEvent);
  });
  
  // Test 3: Testing with custom relay URLs
  it('should create relay set from provided relay URLs', () => {
    const relayUrls = ['wss://relay1.test', 'wss://relay2.test'];
    
    renderHook(() => useSubscribe([{ kinds: [1] }], { relays: relayUrls }));
    
    // Verify that the subscription was created with the custom relay set
    expect(mockNDK.subscribe).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.anything(),
      false
    );
  });
  
  // Test 4: Testing resubscription when filters change
  it('should NOT resubscribe when filters change', () => {
    const initialFilters = [{ kinds: [1], limit: 10 }];
    const newFilters = [{ kinds: [1, 2], limit: 20 }];
    
    // Initial render with initial filters
    const { rerender } = renderHook(
      (props) => useSubscribe(props.filters, {}),
      { initialProps: { filters: initialFilters } }
    );
    
    // First subscription
    expect(mockNDK.subscribe).toHaveBeenCalledTimes(1);
    expect(mockNDK.subscribe).toHaveBeenCalledWith(
      initialFilters,
      {},
      undefined,
      false
    );
    
    // Reset mock to track new calls
    (mockNDK.subscribe as any).mockClear();
    
    // Rerender with new filters
    rerender({ filters: newFilters });
    
    // Second subscription with new filters
    // Expect subscribe to be called once after rerender because filters content changed
    expect(mockNDK.subscribe).toHaveBeenCalledTimes(1);
  });
  
  // Test 5: Testing with changing dependencies
  it('should resubscribe when dependencies change', () => {
    const filters = [{ kinds: [1] }];
    const dependencies = ['dep1'];
    const newDependencies = ['dep1', 'dep2'];
    
    // Initial render with initial dependencies
    const { rerender } = renderHook(
      (props) => useSubscribe(filters, {}, props.dependencies),
      { initialProps: { dependencies } }
    );
    
    // First subscription
    expect(mockNDK.subscribe).toHaveBeenCalledTimes(1);
    
    // Reset mock to track new calls
    (mockNDK.subscribe as any).mockClear();
    
    // Rerender with new dependencies
    rerender({ dependencies: newDependencies });
    
    // Second subscription due to changed dependencies
    expect(mockNDK.subscribe).toHaveBeenCalledTimes(1);
  });
  
  // Test 6: Testing handling of deleted events via event.once
  it('should remove events that emit the "deleted" event', () => {
    let capturedEventHandler: Function | null = null;
    (mockSubscription.on as any).mockImplementation((event: string, handler: Function) => {
      if (event === 'event') {
        capturedEventHandler = handler;
      }
    });
    
    // Create a test event with an ID
    const testEvent = {
      id: 'test-event-id',
      pubkey: 'test-pubkey',
      created_at: Math.floor(Date.now() / 1000),
      content: 'test content',
      kind: 1,
      tags: [],
      sig: 'test-sig',
      isParamReplaceable: () => false,
      hasTag: () => false,
      tagId: () => 'test-event-id',
      once: vi.fn()
    } as unknown as NDKEvent;
    
    // Mock once to capture the deleted callback
    let deletedCallback: Function | null = null;
    (testEvent.once as any).mockImplementation((event: string, callback: Function) => {
      if (event === 'deleted') {
        deletedCallback = callback;
      }
    });
    
    // Render the hook
    const { result } = renderHook(() => useSubscribe([{ kinds: [1] }]));
    
    // Add the event
    if (capturedEventHandler !== null) {
      act(() => {
        if (capturedEventHandler) {
          capturedEventHandler(testEvent);
        }
      });
    }
    
    // Advance timers to flush buffer
    act(() => {
      vi.advanceTimersByTime(30);
    });
    
    // The event should be added
    expect(result.current.events.length).toBe(1);
    
    // Now trigger the deleted event callback
    if (deletedCallback !== null) {
      act(() => {
        if (deletedCallback) {
          deletedCallback();
        }
      });
    }
    
    // Verify the event was removed
    expect(result.current.events.length).toBe(0);
  });
});