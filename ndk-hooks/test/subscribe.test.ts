import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react-hooks';
import { createSubscribeStore, type SubscribeStore } from '../src/stores/subscribe';
import { useSubscribe } from '../src/hooks/subscribe';
import { useNDK } from '../src/hooks/ndk';
import NDK, { 
  NDKEvent, 
  NDKSubscription, 
  NDKFilter,
  NDKRelaySet 
} from '@nostr-dev-kit/ndk';

// Create a proper Mock for NDKEvent
class MockEvent {
  id: string;
  pubkey: string;
  created_at: number;
  content: string;
  kind: number;
  tags: string[][];
  sig: string;
  _author: any;
  relay: any;
  onRelays: any[];
  rawEvent: any;

  constructor(data: Partial<MockEvent> = {}) {
    this.id = data.id || `id-${Math.random().toString(36).substring(7)}`;
    this.pubkey = data.pubkey || 'test-pubkey';
    this.created_at = data.created_at || Math.floor(Date.now() / 1000);
    this.content = data.content || 'test content';
    this.kind = data.kind || 1;
    this.tags = data.tags || [];
    this.sig = data.sig || 'test-sig';
    this._author = null;
    this.relay = null;
    this.onRelays = [];
    this.rawEvent = { id: this.id, pubkey: this.pubkey, created_at: this.created_at, content: this.content, kind: this.kind, tags: this.tags, sig: this.sig };
  }

  tagId() {
    return this.id;
  }

  isParamReplaceable() {
    return false;
  }

  hasTag(tagName: string) {
    return this.tags.some(tag => tag[0] === tagName);
  }

  once(event: string, callback: () => void) {
    // Mock implementation
  }
}

// Setup the mocks
vi.mock('@nostr-dev-kit/ndk', () => {
  return {
    default: vi.fn(),
    NDKRelaySet: {
      fromRelayUrls: vi.fn(() => ({
        relays: [],
        add: vi.fn()
      }))
    },
    NDKEvent: vi.fn().mockImplementation((data) => new MockEvent(data))
  };
});

vi.mock('../src/hooks/ndk', () => ({
  useNDK: vi.fn()
}));

// Helper to create mock subscription
const createMockSubscription = () => {
  const mockSub = {
    on: vi.fn(),
    off: vi.fn(),
    stop: vi.fn(),
    start: vi.fn(() => []),
    events: [] as NDKEvent[],
    eose: false
  };
  return mockSub as unknown as NDKSubscription;
};

describe('Subscribe Store', () => {
  let store: ReturnType<typeof createSubscribeStore<NDKEvent>>;
  
  beforeEach(() => {
    vi.useFakeTimers();
    store = createSubscribeStore<NDKEvent>();
  });

  afterEach(() => {
    vi.useRealTimers();
  });
  
  describe('event buffering', () => {
    it.only('should buffer events and not update state immediately with default buffer time', () => {
      const event = new MockEvent() as unknown as NDKEvent;
      const state = store.getState();
      
      // Add event to the store
      act(() => {
        state.addEvent(event);
      });
      
      // Events should not be updated yet because of buffering
      expect(store.getState().events.length).toBe(0);
      
      // Advance timer to trigger the buffer flush
      act(() => {
        vi.advanceTimersByTime(30);
      });
      
      // After buffer time, events should be updated
      expect(state.events.length).toBe(1);
      expect(state.events[0]).toBe(event);
    });
    
    it('should update events immediately when buffering is disabled', () => {
      const storeWithoutBuffer = createSubscribeStore<NDKEvent>(false);
      const state = storeWithoutBuffer.getState();
      const event = new MockEvent() as unknown as NDKEvent;
      
      act(() => {
        state.addEvent(event);
      });
      
      // Events should be updated immediately without buffering
      expect(state.events.length).toBe(1);
      expect(state.events[0]).toBe(event);
    });
    
    it('should not add older events of the same ID when buffering is enabled', () => {
      const state = store.getState();
      const event1 = new MockEvent({ id: 'test-id', created_at: 1000 }) as unknown as NDKEvent;
      const event2 = new MockEvent({ id: 'test-id', created_at: 500 }) as unknown as NDKEvent; // Older event
      
      act(() => {
        state.addEvent(event1);
      });
      
      act(() => {
        vi.advanceTimersByTime(30);
      });
      
      expect(state.events.length).toBe(1);
      expect(state.events[0]).toBe(event1);
      
      act(() => {
        state.addEvent(event2);
      });
      
      act(() => {
        vi.advanceTimersByTime(30);
      });
      
      // Should still have only event1 (newer event)
      expect(state.events.length).toBe(1);
      expect(state.events[0]).toBe(event1);
    });
  });
  
  describe('event mapping and sorting', () => {
    it('should map events by their ID', () => {
      const state = store.getState();
      const event = new MockEvent({ id: 'test-id' }) as unknown as NDKEvent;
      
      act(() => {
        state.addEvent(event);
      });
      
      act(() => {
        vi.advanceTimersByTime(30);
      });
      
      expect(state.eventMap.size).toBe(1);
      expect(state.eventMap.get('test-id')).toBe(event);
    });
    
    it('should replace events with newer versions when using the same ID', () => {
      const state = store.getState();
      const olderEvent = new MockEvent({ id: 'test-id', created_at: 1000, content: 'old content' }) as unknown as NDKEvent;
      const newerEvent = new MockEvent({ id: 'test-id', created_at: 2000, content: 'new content' }) as unknown as NDKEvent;
      
      act(() => {
        state.addEvent(olderEvent);
      });
      
      act(() => {
        vi.advanceTimersByTime(30);
      });
      
      expect(state.events[0].content).toBe('old content');
      
      act(() => {
        state.addEvent(newerEvent);
      });
      
      act(() => {
        vi.advanceTimersByTime(30);
      });
      
      expect(state.events.length).toBe(1);
      expect(state.events[0].content).toBe('new content');
    });
    
    it('should keep older events when newer events with same ID are added', () => {
      const state = store.getState();
      const newerEvent = new MockEvent({ id: 'test-id', created_at: 2000, content: 'new content' }) as unknown as NDKEvent;
      const olderEvent = new MockEvent({ id: 'test-id', created_at: 1000, content: 'old content' }) as unknown as NDKEvent;
      
      act(() => {
        state.addEvent(newerEvent);
      });
      
      act(() => {
        vi.advanceTimersByTime(30);
      });
      
      expect(state.events[0].content).toBe('new content');
      
      act(() => {
        state.addEvent(olderEvent);
      });
      
      act(() => {
        vi.advanceTimersByTime(30);
      });
      
      expect(state.events.length).toBe(1);
      expect(state.events[0].content).toBe('new content');
    });
  });
  
  describe('EOSE handling', () => {
    it('should set eose flag when setEose is called', () => {
      const state = store.getState();
      
      expect(state.eose).toBe(false);
      
      act(() => {
        state.setEose();
      });
      
      expect(state.eose).toBe(true);
    });
    
    it('should flush buffer immediately when setEose is called', () => {
      const state = store.getState();
      const event = new MockEvent() as unknown as NDKEvent;
      
      act(() => {
        state.addEvent(event);
      });
      
      // Buffer not flushed yet
      expect(state.events.length).toBe(0);
      
      act(() => {
        state.setEose();
      });
      
      // Buffer should be flushed immediately on EOSE
      expect(state.events.length).toBe(1);
      expect(state.eose).toBe(true);
    });
  });
  
  describe('reset functionality', () => {
    it('should clear all events and reset flags when reset is called', () => {
      const state = store.getState();
      const event = new MockEvent() as unknown as NDKEvent;
      
      // Add an event and set EOSE
      act(() => {
        state.addEvent(event);
      });
      
      act(() => {
        vi.advanceTimersByTime(30);
      });
      
      act(() => {
        state.setEose();
      });
      
      expect(state.events.length).toBe(1);
      expect(state.eose).toBe(true);
      
      // Reset the store
      act(() => {
        state.reset();
      });
      
      // Store should be empty after reset
      expect(state.events.length).toBe(0);
      expect(state.eventMap.size).toBe(0);
      expect(state.eose).toBe(false);
      expect(state.isSubscribed).toBe(false);
      expect(state.subscriptionRef).toBeUndefined();
    });
    
    it('should set subscriptionRef and update isSubscribed flag', () => {
      const state = store.getState();
      const mockSub = createMockSubscription();
      
      expect(state.isSubscribed).toBe(false);
      expect(state.subscriptionRef).toBeUndefined();
      
      act(() => {
        state.setSubscription(mockSub);
      });
      
      expect(state.isSubscribed).toBe(true);
      expect(state.subscriptionRef).toBe(mockSub);
      
      act(() => {
        state.setSubscription(undefined);
      });
      
      expect(state.isSubscribed).toBe(false);
      expect(state.subscriptionRef).toBeUndefined();
    });
  });
  
  describe('removeEventId', () => {
    it('should remove an event by ID', () => {
      const state = store.getState();
      const event1 = new MockEvent({ id: 'test-id-1' }) as unknown as NDKEvent;
      const event2 = new MockEvent({ id: 'test-id-2' }) as unknown as NDKEvent;
      
      act(() => {
        state.addEvent(event1);
        state.addEvent(event2);
      });
      
      act(() => {
        vi.advanceTimersByTime(30);
      });
      
      expect(state.events.length).toBe(2);
      
      act(() => {
        state.removeEventId('test-id-1');
      });
      
      expect(state.events.length).toBe(1);
      expect(state.eventMap.has('test-id-1')).toBe(false);
      expect(state.eventMap.has('test-id-2')).toBe(true);
    });
  });
});

describe('Subscribe Hook', () => {
  let mockNDK: NDK;
  let mockFilters: NDKFilter[];
  let mockSubscription: NDKSubscription;
  
  beforeEach(() => {
    // Setup mocks
    mockNDK = {
      subscribe: vi.fn(),
    } as unknown as NDK;
    
    mockFilters = [{ kinds: [1], limit: 10 }];
    
    mockSubscription = {
      on: vi.fn(),
      off: vi.fn(),
      stop: vi.fn(),
      start: vi.fn(() => []),
      events: [] as NDKEvent[],
      eose: false
    } as unknown as NDKSubscription;
    
    (mockNDK.subscribe as any).mockReturnValue(mockSubscription);
    
    // Mock useNDK hook
    (useNDK as any).mockReturnValue({ ndk: mockNDK });
    
    vi.useFakeTimers();
  });
  
  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });
  
  describe('basic subscription functionality', () => {
    it('should not subscribe if filters are empty', () => {
      const { result } = renderHook(() => useSubscribe([]));
      
      expect(mockNDK.subscribe).not.toHaveBeenCalled();
      expect(result.current.isSubscribed).toBe(false);
    });
    
    it('should not subscribe if NDK is not initialized', () => {
      (useNDK as any).mockReturnValue({ ndk: undefined });
      
      const { result } = renderHook(() => useSubscribe(mockFilters));
      
      expect(result.current.isSubscribed).toBe(false);
    });
    
    it('should subscribe with the provided filters when NDK is initialized', () => {
      const { result } = renderHook(() => useSubscribe(mockFilters));
      
      expect(mockNDK.subscribe).toHaveBeenCalledWith(mockFilters, {}, undefined, false);
      expect(mockSubscription.start).toHaveBeenCalledWith(false);
      expect(result.current.isSubscribed).toBe(true);
    });
    
    it('should clean up subscription when component unmounts', () => {
      const { unmount } = renderHook(() => useSubscribe(mockFilters));
      
      unmount();
      
      expect(mockSubscription.stop).toHaveBeenCalled();
    });
  });
  
  describe('event handling', () => {
    it('should register event handlers on subscription', () => {
      renderHook(() => useSubscribe(mockFilters));
      
      expect(mockSubscription.on).toHaveBeenCalledWith('event', expect.any(Function));
      expect(mockSubscription.on).toHaveBeenCalledWith('eose', expect.any(Function));
      expect(mockSubscription.on).toHaveBeenCalledWith('closed', expect.any(Function));
    });
    
    it('should handle incoming events and update state', () => {
      // Prepare to capture the event handler
      let capturedEventHandler: Function | null = null;
      (mockSubscription.on as any).mockImplementation((event: string, handler: Function) => {
        if (event === 'event') {
          capturedEventHandler = handler;
        }
      });
      
      const { result } = renderHook(() => useSubscribe(mockFilters));
      
      // Now trigger an event
      const testEvent = new MockEvent() as unknown as NDKEvent;
      if (capturedEventHandler !== null) {
        act(() => {
          capturedEventHandler!(testEvent);
        });
      }
      
      // Advance timers to flush buffer
      act(() => {
        vi.advanceTimersByTime(30);
      });
      
      expect(result.current.events.length).toBe(1);
      expect(result.current.events[0]).toBe(testEvent);
    });
    
    it('should handle EOSE event', () => {
      // Prepare to capture the EOSE handler
      let capturedEoseHandler: Function | null = null;
      (mockSubscription.on as any).mockImplementation((event: string, handler: Function) => {
        if (event === 'eose') {
          capturedEoseHandler = handler;
        }
      });
      
      const { result } = renderHook(() => useSubscribe(mockFilters));
      
      expect(result.current.eose).toBe(false);
      
      // Trigger EOSE
      if (capturedEoseHandler !== null) {
        act(() => {
          capturedEoseHandler!();
        });
      }
      
      expect(result.current.eose).toBe(true);
    });
    
    it('should handle closed event', () => {
      // Prepare to capture the closed handler
      let capturedClosedHandler: Function | null = null;
      (mockSubscription.on as any).mockImplementation((event: string, handler: Function) => {
        if (event === 'closed') {
          capturedClosedHandler = handler;
        }
      });
      
      const { result } = renderHook(() => useSubscribe(mockFilters));
      
      expect(result.current.isSubscribed).toBe(true);
      
      // Trigger closed
      if (capturedClosedHandler !== null) {
        act(() => {
          capturedClosedHandler!();
        });
      }
      
      expect(result.current.isSubscribed).toBe(false);
    });
  });
  
  describe('handling of cached events', () => {
    it('should process cached events from subscription.start', () => {
      // Setup mock cached events
      const cachedEvent1 = new MockEvent() as unknown as NDKEvent;
      const cachedEvent2 = new MockEvent() as unknown as NDKEvent;
      const cachedEvents = [cachedEvent1, cachedEvent2];
      
      (mockSubscription.start as any).mockReturnValue(cachedEvents);
      
      const { result } = renderHook(() => useSubscribe(mockFilters));
      
      // Advance timers to flush buffer
      act(() => {
        vi.advanceTimersByTime(30);
      });
      
      expect(result.current.events.length).toBe(2);
      expect(result.current.events).toContain(cachedEvent1);
      expect(result.current.events).toContain(cachedEvent2);
    });
  });
  
  describe('relay set creation', () => {
    it('should create relay set from provided relay URLs', () => {
      const relayUrls = ['wss://relay1.example.com', 'wss://relay2.example.com'];
      
      renderHook(() => useSubscribe(mockFilters, { relays: relayUrls }));
      
      expect(NDKRelaySet.fromRelayUrls).toHaveBeenCalledWith(relayUrls, mockNDK);
      expect(mockNDK.subscribe).toHaveBeenCalledWith(
        mockFilters,
        { relays: relayUrls },
        expect.anything(),
        false
      );
    });
    
    it('should not create relay set if no relay URLs provided', () => {
      renderHook(() => useSubscribe(mockFilters));
      
      expect(NDKRelaySet.fromRelayUrls).not.toHaveBeenCalled();
      expect(mockNDK.subscribe).toHaveBeenCalledWith(
        mockFilters,
        {},
        undefined,
        false
      );
    });
  });
  
  describe('dependency handling', () => {
    it('should resubscribe when dependencies change', () => {
      const { rerender } = renderHook(
        ({ deps }) => useSubscribe(mockFilters, {}, deps),
        { initialProps: { deps: ['initial'] } }
      );
      
      // Initial subscription
      expect(mockNDK.subscribe).toHaveBeenCalledTimes(1);
      
      // Change dependencies and rerender
      rerender({ deps: ['changed'] });
      
      // Should stop old subscription and create a new one
      expect(mockSubscription.stop).toHaveBeenCalledTimes(1);
      expect(mockNDK.subscribe).toHaveBeenCalledTimes(2);
    });
    
    it('should not resubscribe if filters change to false', () => {
      // Start with valid filters
      const { rerender } = renderHook(
        ({ useFilters }) => useSubscribe(useFilters ? mockFilters : false),
        { initialProps: { useFilters: true } }
      );
      
      // Initial subscription
      expect(mockNDK.subscribe).toHaveBeenCalledTimes(1);
      
      // Change filters to false
      rerender({ useFilters: false });
      
      // Should stop old subscription but not create a new one
      expect(mockSubscription.stop).toHaveBeenCalled();
      expect(mockNDK.subscribe).toHaveBeenCalledTimes(1);
    });
  });
});