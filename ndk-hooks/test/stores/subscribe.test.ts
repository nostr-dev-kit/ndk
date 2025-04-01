import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createSubscribeStore, type SubscribeStore, type MuteCriteria } from '../../src/stores/subscribe';
import { act } from '@testing-library/react-hooks';
import type { NDKEvent, NDKSubscription } from '@nostr-dev-kit/ndk';

// Create a proper Mock for NDKEvent - using a similar pattern to test/subscribe.test.ts
class MockEvent {
  id: string;
  pubkey: string;
  created_at: number;
  content: string;
  kind: number;
  tags: string[][];
  sig: string;

  _deletedCallback?: () => void;

  constructor(data: Partial<MockEvent> = {}) {
    this.id = data.id || `id-${Math.random().toString(36).substring(7)}`;
    this.pubkey = data.pubkey || 'test-pubkey';
    this.created_at = data.created_at !== undefined
      ? data.created_at
      : Math.floor(Date.now() / 1000);
    this.content = data.content || 'test content';
    this.kind = data.kind || 1;
    this.tags = data.tags || [];
    this.sig = data.sig || 'test-sig';
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

  getMatchingTags(tagName: string): string[][] {
    return this.tags.filter(tag => tag[0] === tagName);
  }

  once(event: string, callback: () => void) {
    // Mock implementation
    if (event === 'deleted') {
      this._deletedCallback = callback;
    }
  }

  // Helper to trigger 'deleted' event in tests
  triggerDeleted() {
    if (this._deletedCallback) {
      this._deletedCallback();
    }
  }
}

// Create mock subscription
const createMockSubscription = (): NDKSubscription => {
  return {
    on: vi.fn(),
    off: vi.fn(),
    stop: vi.fn(),
    start: vi.fn(() => []),
    events: [] as NDKEvent[],
    eose: false
  } as unknown as NDKSubscription;
};

describe('Subscribe Store - Advanced Tests', () => {
  let store: ReturnType<typeof createSubscribeStore<NDKEvent>>;

  beforeEach(() => {
    vi.useFakeTimers();
    // Create a fresh store for each test
    store = createSubscribeStore<NDKEvent>();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('buffer behavior after EOSE', () => {
    it('should reduce buffer time to 16ms after EOSE', () => {
      const { addEvent, setEose } = store.getState();

      // Add an event but don't advance timer yet
      const event1 = new MockEvent({ id: 'event1' }) as unknown as NDKEvent;

      act(() => {
        addEvent(event1);
      });

      // Should still be buffered
      expect(store.getState().events.length).toBe(0);

      // Trigger EOSE which should flush buffer immediately
      act(() => {
        setEose();
      });

      // Buffer should have flushed; 'event1' should be in events now
      expect(store.getState().events.length).toBe(1);

      // Now add a second event
      const event2 = new MockEvent({ id: 'event2' }) as unknown as NDKEvent;

      act(() => {
        addEvent(event2);
      });

      // Buffer time should now be 16ms (instead of 30ms)
      // No flush yet -> we should still see only 1 event
      expect(store.getState().events.length).toBe(1);

      // Advance timer by 15ms (less than 16ms)
      act(() => {
        vi.advanceTimersByTime(15);
      });

      // Still not flushed
      expect(store.getState().events.length).toBe(1);

      // Advance 1 more ms to hit 16ms exactly
      act(() => {
        vi.advanceTimersByTime(1);
      });

      // Should flush now
      expect(store.getState().events.length).toBe(2);
      expect(store.getState().events[1].id).toBe('event2');
    });
  });

  describe('events with undefined created_at', () => {
    it('should handle events with undefined created_at gracefully', () => {
      // Create a store with no buffering (immediate updates)
      const noBufferStore = createSubscribeStore<NDKEvent>(false);
      const { addEvent } = noBufferStore.getState();

      // Create event with 0 created_at
      const eventUndefinedTimestamp = new MockEvent({
        id: 'event-undefined',
        created_at: 0
      }) as unknown as NDKEvent;

      // Add event
      act(() => {
        addEvent(eventUndefinedTimestamp);
      });

      // Event should be added
      expect(noBufferStore.getState().events.length).toBe(1);
      expect(noBufferStore.getState().events[0].id).toBe('event-undefined');

      // Add a second event with the same ID but with a timestamp
      const eventWithTimestamp = new MockEvent({
        id: 'event-undefined',
        created_at: 1000
      }) as unknown as NDKEvent;

      act(() => {
        addEvent(eventWithTimestamp);
      });

      // The second event should replace the first one
      expect(noBufferStore.getState().events.length).toBe(1);
      expect(noBufferStore.getState().events[0].created_at).toBe(1000);
    });
  });

  describe('addEvents batch processing', () => {
    it('should efficiently process multiple events with buffering disabled', () => {
      // Create a store with no buffering (immediate updates)
      const noBufferStore = createSubscribeStore<NDKEvent>(false);
      const { addEvents } = noBufferStore.getState();

      // Create a batch of events
      const batch = [
        new MockEvent({ id: 'event1', created_at: 1000 }) as unknown as NDKEvent,
        new MockEvent({ id: 'event2', created_at: 2000 }) as unknown as NDKEvent,
        new MockEvent({ id: 'event3', created_at: 3000 }) as unknown as NDKEvent
      ];

      // Add batch
      act(() => {
        addEvents(batch);
      });

      // All events should be added immediately
      expect(noBufferStore.getState().events.length).toBe(3);
      expect(noBufferStore.getState().eventMap.size).toBe(3);

      // Add a new batch with one duplicate (newer) + one older + one new
      const batch2 = [
        new MockEvent({ id: 'event2', created_at: 5000 }) as unknown as NDKEvent,
        new MockEvent({ id: 'event3', created_at: 1500 }) as unknown as NDKEvent,
        new MockEvent({ id: 'event4', created_at: 4000 }) as unknown as NDKEvent
      ];

      act(() => {
        addEvents(batch2);
      });

      // We should now have 4 distinct events total
      expect(noBufferStore.getState().events.length).toBe(4);
      expect(noBufferStore.getState().eventMap.size).toBe(4);

      // event2 should be updated to the newer version
      const event2 = noBufferStore.getState().eventMap.get('event2');
      expect(event2?.created_at).toBe(5000);

      // event3 should remain the original (newer) timestamp
      const event3 = noBufferStore.getState().eventMap.get('event3');
      expect(event3?.created_at).toBe(3000);
    });

    it('should efficiently process multiple events with buffering enabled', () => {
      // Create a store with an explicit buffer time
      const bufferedStore = createSubscribeStore<NDKEvent>(30);
      const { addEvents } = bufferedStore.getState();

      // Create a batch of events
      const batch = [
        new MockEvent({ id: 'event1', created_at: 1000 }) as unknown as NDKEvent,
        new MockEvent({ id: 'event2', created_at: 2000 }) as unknown as NDKEvent,
        new MockEvent({ id: 'event3', created_at: 3000 }) as unknown as NDKEvent
      ];

      // Add batch
      act(() => {
        addEvents(batch);
      });

      // Should still be buffered
      expect(bufferedStore.getState().events.length).toBe(0);

      // Advance timer to flush buffer
      act(() => {
        vi.advanceTimersByTime(30);
      });

      // Now events should be added
      expect(bufferedStore.getState().events.length).toBe(3);
      expect(bufferedStore.getState().eventMap.size).toBe(3);
    });

    it('should handle empty arrays in addEvents', () => {
      const { addEvents } = store.getState();

      // Call addEvents with empty array
      act(() => {
        addEvents([]);
      });

      // Nothing should be added
      expect(store.getState().events.length).toBe(0);

      // Call addEvents with null/undefined values
      act(() => {
        addEvents([null as any, undefined as any]);
      });

      // Nothing should happen
      expect(store.getState().events.length).toBe(0);
    });
  });


  describe('filterMutedEvents', () => {
    const mutedPubkey = 'muted-pubkey';
    const nonMutedPubkey = 'non-muted-pubkey';
    const mutedEventId = 'muted-event-id';
    const mutedHashtag = 'mutedtag'; // Lowercase
    const mutedWord = 'badword';

    const eventMutedPubkey = new MockEvent({ id: 'ev-pubkey', pubkey: mutedPubkey }) as unknown as NDKEvent;
    const eventMutedWord = new MockEvent({ id: 'ev-word', pubkey: nonMutedPubkey, content: `Contains ${mutedWord}` }) as unknown as NDKEvent;
    const eventMutedTag = new MockEvent({ id: 'ev-tag', pubkey: nonMutedPubkey, tags: [['t', mutedHashtag]] }) as unknown as NDKEvent;
    const eventMutedRef = new MockEvent({ id: 'ev-ref', pubkey: nonMutedPubkey, tags: [['e', mutedEventId]] }) as unknown as NDKEvent;
    const eventMutedOwnId = new MockEvent({ id: mutedEventId, pubkey: nonMutedPubkey }) as unknown as NDKEvent;
    const eventNonMuted = new MockEvent({ id: 'ev-ok', pubkey: nonMutedPubkey, content: 'This is fine', tags: [['t', 'goodtag']] }) as unknown as NDKEvent;

    const allEvents = [
        eventMutedPubkey,
        eventMutedWord,
        eventMutedTag,
        eventMutedRef,
        eventMutedOwnId,
        eventNonMuted
    ];

    beforeEach(() => {
        // Use no buffer for easier testing of filterMutedEvents
        store = createSubscribeStore<NDKEvent>(false);
        // Pre-populate store
        act(() => {
            store.getState().addEvents(allEvents);
        });
        expect(store.getState().events.length).toBe(6); // Ensure all added initially
    });

    it('should not filter anything if criteria are empty', () => {
        const criteria: MuteCriteria = {
            mutedPubkeys: new Set(),
            mutedEventIds: new Set(),
            mutedHashtags: new Set(),
            mutedWordsRegex: null,
        };

        act(() => {
            store.getState().filterMutedEvents(criteria);
        });

        expect(store.getState().events.length).toBe(6);
    });

    it('should filter based on mutedPubkeys', () => {
        const criteria: MuteCriteria = {
            mutedPubkeys: new Set([mutedPubkey]),
            mutedEventIds: new Set(),
            mutedHashtags: new Set(),
            mutedWordsRegex: null,
        };

        act(() => {
            store.getState().filterMutedEvents(criteria);
        });

        expect(store.getState().events.length).toBe(5);
        expect(store.getState().eventMap.has('ev-pubkey')).toBe(false);
    });

    it('should filter based on mutedWordsRegex', () => {
        const criteria: MuteCriteria = {
            mutedPubkeys: new Set(),
            mutedEventIds: new Set(),
            mutedHashtags: new Set(),
            mutedWordsRegex: new RegExp(mutedWord, 'i'),
        };

        act(() => {
            store.getState().filterMutedEvents(criteria);
        });

        expect(store.getState().events.length).toBe(5);
        expect(store.getState().eventMap.has('ev-word')).toBe(false);
    });

    it('should filter based on mutedHashtags', () => { // Removed (case-insensitive) as hook handles lowercasing
        const criteria: MuteCriteria = {
            mutedPubkeys: new Set(),
            mutedEventIds: new Set(),
            mutedHashtags: new Set([mutedHashtag]), // Provide lowercase tag
            mutedWordsRegex: null,
        };

        // Ensure the mock event provides the tag correctly
        eventMutedTag.getMatchingTags = (tagName: string) => tagName === 't' ? [['t', mutedHashtag]] : [];

        act(() => {
            store.getState().filterMutedEvents(criteria);
        });

        expect(store.getState().events.length).toBe(5);
        expect(store.getState().eventMap.has('ev-tag')).toBe(false);
    });

    it('should filter based on mutedEventIds (referenced)', () => {
        const criteria: MuteCriteria = {
            mutedPubkeys: new Set(),
            mutedEventIds: new Set([mutedEventId]),
            mutedHashtags: new Set(),
            mutedWordsRegex: null,
        };

        act(() => {
            store.getState().filterMutedEvents(criteria);
        });

        // Should remove the event referencing the muted ID AND the event whose own ID is muted
        expect(store.getState().events.length).toBe(4);
        expect(store.getState().eventMap.has('ev-ref')).toBe(false);
        expect(store.getState().eventMap.has(mutedEventId)).toBe(false);
    });

    it('should filter based on multiple criteria', () => {
        const criteria: MuteCriteria = {
            mutedPubkeys: new Set([mutedPubkey]),
            mutedEventIds: new Set(),
            mutedHashtags: new Set(),
            mutedWordsRegex: new RegExp(mutedWord, 'i'),
        };

        act(() => {
            store.getState().filterMutedEvents(criteria);
        });

        expect(store.getState().events.length).toBe(4);
        expect(store.getState().eventMap.has('ev-pubkey')).toBe(false);
        expect(store.getState().eventMap.has('ev-word')).toBe(false);
        expect(store.getState().eventMap.has('ev-ok')).toBe(true);
    });
  });
});
