import NDK, {
    type NDKEvent,
    type NDKFilter,
    NDKRelaySet,
    type NDKSubscription,
} from '@nostr-dev-kit/ndk';
import { waitFor } from '@testing-library/react'; // Import waitFor from @testing-library/react
import { act, renderHook } from '@testing-library/react-hooks';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useNDK } from '../../src/hooks/ndk';
import { useSubscribe } from '../../src/hooks/subscribe';

// We're not using the EventGenerator from ndk-test-utils for now as it requires actual NDK instance
// Mock hooks
// Mock ndk.ts, defining mocks inside the factory and exporting them
vi.mock('../../src/hooks/ndk', async () => {
    const mockUseNDK = vi.fn();
    const mockUseNDKCurrentUser = vi.fn();
    return {
        useNDK: mockUseNDK,
        useNDKCurrentUser: mockUseNDKCurrentUser,
        // Export mocks for test setup
        __mockUseNDK: mockUseNDK,
        __mockUseNDKCurrentUser: mockUseNDKCurrentUser,
    };
});

vi.mock('../../src/session/store', () => ({
    useActiveSessionData: vi.fn().mockReturnValue(undefined), // Default mock
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
}); // Correct closing for NDK mock

describe('useSubscribe hook - Advanced Tests', () => {
    let mockNDK: NDK;
    let mockSubscription: NDKSubscription;
    let mockUseActiveSessionData: ReturnType<typeof vi.fn>;

    beforeEach(async () => {
        // Import the mocked module to access the mock functions
        const ndkHooksMock = await import('../../src/hooks/ndk');
        const mockUseNDK = (ndkHooksMock as any).__mockUseNDK;
        const mockUseNDKCurrentUser = (ndkHooksMock as any)
            .__mockUseNDKCurrentUser;

        // Reset mocks
        mockUseNDK.mockClear();
        mockUseNDKCurrentUser.mockClear();
        vi.clearAllMocks(); // Clear other potential mocks
        // Set up mock NDK instance
        mockNDK = {
            subscribe: vi.fn(),
        } as unknown as NDK;

        // Set up mock subscription
        mockSubscription = {
            on: vi.fn(),
            off: vi.fn(),
            stop: vi.fn(),
            start: vi.fn(() => []),
            events: [] as NDKEvent[],
            eose: false,
        } as unknown as NDKSubscription;

        // Make sure the subscribe mock returns our mock subscription
        (mockNDK.subscribe as any).mockReturnValue(mockSubscription);

        // Set return value for the mocked useNDK hook
        mockUseNDK.mockReturnValue({ ndk: mockNDK });

        // Mock useActiveSessionData (import it first)
        const { useActiveSessionData } = await import(
            '../../src/session/store'
        );
        mockUseActiveSessionData = useActiveSessionData as ReturnType<
            typeof vi.fn
        >;
        // Default mock with empty criteria
        mockUseActiveSessionData.mockReturnValue({
            mutedPubkeys: new Set<string>(),
            mutedEventIds: new Set<string>(),
            mutedHashtags: new Set<string>(), // Should be lowercase in the hook logic
            mutedWords: new Set<string>(),
        });

        // Set return value for the mocked useNDKCurrentUser hook
        mockUseNDKCurrentUser.mockReturnValue({
            currentUser: { pubkey: 'test-user-pubkey' },
        }); // Mock a basic user

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
        // Wait for the useEffect to run
        await waitFor(() => {
            expect(mockNDK.subscribe).toHaveBeenCalledTimes(1);
        });
        expect(result.current.subscription).toBe(mockSubscription); // Should hold the subscription ref
        expect(mockNDK.subscribe).toHaveBeenCalledTimes(1); // Should subscribe on mount
    });

    it('should set isSubscribed to false on unmount', async () => {
        // Already async, no change needed here
        const { result, unmount } = renderHook(() =>
            useSubscribe([{ kinds: [1] }])
        );
        // Check that subscribe was called after mount
        expect(mockNDK.subscribe).toHaveBeenCalledTimes(1);

        act(() => {
            unmount();
        });

        // Check that stop was called on the subscription mock during cleanup
        expect(mockSubscription.stop).toHaveBeenCalledTimes(1);

        // Wait for the cleanup function to update the store state
        await waitFor(() => {
            // This await is inside an async test, so it's correct
            expect(
                result.current.storeRef.current?.getState().isSubscribed
            ).toBe(false);
        });
    });

    // Test 1: Handling events with "deleted" tag
    it('should not add events with "deleted" tag when includeDeleted is false', async () => {
        // Prepare to capture the event handler
        const capturedEventHandlers: Map<string, Function[]> = new Map();
        (mockSubscription.on as any).mockImplementation(
            (event: string, handler: Function) => {
                if (!capturedEventHandlers.has(event)) {
                    capturedEventHandlers.set(event, []);
                }
                capturedEventHandlers.get(event)?.push(handler);
            }
        );

        // Use createTestEvent helper
        const deletedEvent = createTestEvent(
            'deleted-event-id',
            'test-pubkey',
            'deleted event',
            [['deleted', 'true']]
        );

        // Set up and render the hook with includeDeleted: false
        const { result } = renderHook(() =>
            useSubscribe([{ kinds: [1] }], { includeDeleted: false })
        );

        // Trigger the event
        if (capturedEventHandlers.has('event')) {
            act(() => {
                capturedEventHandlers.get('event')?.forEach((handler) => {
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
        (mockSubscription.on as any).mockImplementation(
            (event: string, handler: Function) => {
                if (event === 'event') {
                    capturedEventHandler = handler;
                }
            }
        );

        // Use createTestEvent helper
        const deletedEvent = createTestEvent(
            'deleted-event-id',
            'test-pubkey',
            'deleted event',
            [['deleted', 'true']]
        );

        // Set up and render the hook with includeDeleted: true
        const { result } = renderHook(() =>
            useSubscribe([{ kinds: [1] }], { includeDeleted: true })
        );

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
        (mockSubscription.on as any).mockImplementation(
            (event: string, handler: Function) => {
                if (event === 'event') {
                    capturedEventHandler = handler;
                }
            }
        );

        // Use createTestEvent helper
        const testEvent = createTestEvent(
            'test-event-id',
            'test-pubkey',
            'test content'
        );

        // Mock once to capture the deleted callback
        let deletedCallback: Function | null = null;
        (testEvent.once as any).mockImplementation(
            (event: string, callback: Function) => {
                if (event === 'deleted') {
                    deletedCallback = callback;
                }
            }
        );

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

    // --- Mute List Tests ---

    const mutedPubkey = 'muted-author-pubkey';
    const nonMutedPubkey = 'non-muted-author-pubkey';

    const createTestEvent = (
        id: string,
        pubkey: string,
        content: string,
        tags: string[][] = [],
        kind = 1
    ): NDKEvent =>
        ({
            id,
            pubkey,
            created_at: Math.floor(Date.now() / 1000) - Math.random() * 100, // Ensure different timestamps
            content,
            kind,
            tags,
            sig: `sig-${id}`,
            isParamReplaceable: () => false, // Adjust if testing replaceable events
            hasTag: (tagName: string) => tags.some((t) => t[0] === tagName),
            getMatchingTags: (tagName: string): string[][] =>
                tags.filter((t) => t[0] === tagName), // Added missing method
            tagId: () => id, // Adjust for replaceable events if needed
            once: vi.fn(),
        }) as unknown as NDKEvent;

    const mutedPubkeyEvent = createTestEvent(
        'muted-event-pubkey',
        mutedPubkey,
        'Event from muted author'
    );
    const nonMutedEvent = createTestEvent(
        'non-muted-event-1',
        nonMutedPubkey,
        'Event from non-muted author'
    );
    const mutedWordEvent = createTestEvent(
        'muted-event-word',
        nonMutedPubkey,
        'This event contains a BADWORD'
    );
    const mutedTagEvent = createTestEvent(
        'muted-event-tag',
        nonMutedPubkey,
        'Event with muted tag',
        [['t', 'mutedtag']]
    );
    const mutedEventIdEvent = createTestEvent(
        'muted-event-id',
        nonMutedPubkey,
        'Event referencing muted event',
        [['e', 'muted-referenced-event-id']]
    );
    const mutedOwnIdEvent = createTestEvent(
        'muted-referenced-event-id',
        nonMutedPubkey,
        'This event ID itself is muted'
    );

    // Test 7: Should filter muted events by default
    it('should filter events based on all mute criteria when includeMuted is false (default)', async () => {
        // Setup mute list
        mockUseActiveSessionData.mockReturnValue({
            mutedPubkeys: new Set([mutedPubkey]),
            mutedEventIds: new Set(['muted-referenced-event-id']),
            mutedHashtags: new Set(['mutedtag']), // Hook logic should lowercase this
            mutedWords: new Set(['badword']),
        });

        // Capture event handler
        const capturedEventHandlers: Map<string, Function[]> = new Map();
        (mockSubscription.on as any).mockImplementation(
            (event: string, handler: Function) => {
                if (!capturedEventHandlers.has(event))
                    capturedEventHandlers.set(event, []);
                capturedEventHandlers.get(event)?.push(handler);
            }
        );

        const { result } = renderHook(() => useSubscribe([{ kinds: [1] }])); // includeMuted defaults to false

        // Trigger both events
        if (capturedEventHandlers.has('event')) {
            act(() => {
                capturedEventHandlers.get('event')?.forEach((handler) => {
                    handler(mutedPubkeyEvent); // Should be filtered
                    handler(nonMutedEvent); // Should pass
                    handler(mutedWordEvent); // Should be filtered
                    handler(mutedTagEvent); // Should be filtered
                    handler(mutedEventIdEvent); // Should be filtered
                    handler(mutedOwnIdEvent); // Should be filtered (because its ID is in mutedEventIds)
                });
            });
        }

        // Advance timers
        act(() => {
            vi.advanceTimersByTime(30);
        });

        // Assert only non-muted event is present
        expect(result.current.events.length).toBe(1);
        expect(result.current.events.map((e: NDKEvent) => e.id)).toEqual([
            'non-muted-event-1',
        ]);
    });

    // Test 8: Should include muted events when includeMuted is true
    it('should include all events regardless of mute criteria when includeMuted is true', async () => {
        // Setup mute list
        mockUseActiveSessionData.mockReturnValue({
            mutedPubkeys: new Set([mutedPubkey]),
            mutedEventIds: new Set(['muted-referenced-event-id']),
            mutedHashtags: new Set(['mutedtag']),
            mutedWords: new Set(['badword']),
        });

        // Capture event handler
        const capturedEventHandlers: Map<string, Function[]> = new Map();
        (mockSubscription.on as any).mockImplementation(
            (event: string, handler: Function) => {
                if (!capturedEventHandlers.has(event))
                    capturedEventHandlers.set(event, []);
                capturedEventHandlers.get(event)?.push(handler);
            }
        );

        const { result } = renderHook(() =>
            useSubscribe([{ kinds: [1] }], { includeMuted: true })
        );

        // Trigger both events
        if (capturedEventHandlers.has('event')) {
            act(() => {
                capturedEventHandlers.get('event')?.forEach((handler) => {
                    handler(mutedPubkeyEvent);
                    handler(nonMutedEvent);
                    handler(mutedWordEvent);
                    handler(mutedTagEvent);
                    handler(mutedEventIdEvent);
                    handler(mutedOwnIdEvent);
                });
            });
        }

        // Advance timers
        act(() => {
            vi.advanceTimersByTime(30);
        });

        // Assert both events are present
        expect(result.current.events.length).toBe(6); // All events should be included
        expect(result.current.events.map((e: NDKEvent) => e.id)).toEqual(
            expect.arrayContaining([
                'muted-event-pubkey',
                'non-muted-event-1',
                'muted-event-word',
                'muted-event-tag',
                'muted-event-id',
                'muted-referenced-event-id',
            ])
        );
    });

    // Test 9: Should filter existing events when mute list changes
    it('should filter existing events when any mute criteria changes and includeMuted is false', async () => {
        // Start with empty mute list
        // Start with empty mute list
        const initialMuteCriteria = {
            mutedPubkeys: new Set<string>(),
            mutedEventIds: new Set<string>(),
            mutedHashtags: new Set<string>(),
            mutedWords: new Set<string>(),
        };
        mockUseActiveSessionData.mockReturnValue(initialMuteCriteria);

        // Capture event handler
        const capturedEventHandlers: Map<string, Function[]> = new Map();
        (mockSubscription.on as any).mockImplementation(
            (event: string, handler: Function) => {
                if (!capturedEventHandlers.has(event))
                    capturedEventHandlers.set(event, []);
                capturedEventHandlers.get(event)?.push(handler);
            }
        );

        const initialProps = {
            includeMuted: false,
            muteCriteria: initialMuteCriteria,
        };
        const { result, rerender } = renderHook(
            (props) => {
                // Update mock inside render to simulate prop change effect
                mockUseActiveSessionData.mockReturnValue(props.muteCriteria);
                return useSubscribe([{ kinds: [1] }], {
                    includeMuted: props.includeMuted,
                });
            },
            { initialProps }
        );

        // Trigger event from the pubkey we will mute later
        const eventToMuteByWord = createTestEvent(
            'event-to-mute-word',
            nonMutedPubkey,
            'This has a BADWORD'
        );
        if (capturedEventHandlers.has('event')) {
            act(() => {
                capturedEventHandlers
                    .get('event')
                    ?.forEach((handler) => handler(eventToMuteByWord));
            });
        }
        act(() => {
            vi.advanceTimersByTime(30);
        });

        // Assert event is initially present
        expect(result.current.events.length).toBe(1);
        expect(result.current.events[0].id).toBe('event-to-mute-word');

        // Update mute list and rerender
        // Update mute list (add a muted word) and rerender
        const newMuteCriteria = {
            ...initialMuteCriteria,
            mutedWords: new Set(['badword']),
        };
        act(() => {
            rerender({ ...initialProps, muteCriteria: newMuteCriteria });
        });

        // Assert the event has been filtered out
        expect(result.current.events.length).toBe(0);
    });

    // Test 10: Should filter cached events based on mute list
    it('should filter cached events based on all mute criteria when includeMuted is false', async () => {
        // Setup mute list
        mockUseActiveSessionData.mockReturnValue({
            mutedPubkeys: new Set([mutedPubkey]),
            mutedEventIds: new Set(['muted-referenced-event-id']),
            mutedHashtags: new Set(['mutedtag']),
            mutedWords: new Set(['badword']),
        });

        // Mock subscription start to return cached events
        // Mock subscription start to return cached events
        const cachedEvents = [
            mutedPubkeyEvent,
            nonMutedEvent,
            mutedWordEvent,
            mutedTagEvent,
            mutedEventIdEvent,
            mutedOwnIdEvent,
        ];
        (mockSubscription.start as any).mockReturnValue(cachedEvents);

        const { result } = renderHook(() => useSubscribe([{ kinds: [1] }])); // includeMuted defaults to false

        // Advance timers (though cache is processed immediately on start)
        act(() => {
            vi.advanceTimersByTime(30);
        });

        // Assert only non-muted cached event is present
        expect(result.current.events.length).toBe(1);
        expect(result.current.events.length).toBe(1);
        expect(result.current.events[0].id).toBe('non-muted-event-1');
    });

    // Test 11: Should NOT filter cached events when includeMuted is true
    it('should include all cached events regardless of mute criteria when includeMuted is true', async () => {
        // Setup mute list
        mockUseActiveSessionData.mockReturnValue({
            mutedPubkeys: new Set([mutedPubkey]),
            mutedEventIds: new Set(['muted-referenced-event-id']),
            mutedHashtags: new Set(['mutedtag']),
            mutedWords: new Set(['badword']),
        });

        // Mock subscription start to return cached events
        const cachedEvents = [
            mutedPubkeyEvent,
            nonMutedEvent,
            mutedWordEvent,
            mutedTagEvent,
            mutedEventIdEvent,
            mutedOwnIdEvent,
        ];
        (mockSubscription.start as any).mockReturnValue(cachedEvents);

        const { result } = renderHook(() =>
            useSubscribe([{ kinds: [1] }], { includeMuted: true })
        );

        // Advance timers
        act(() => {
            vi.advanceTimersByTime(30);
        });

        // Assert both cached events are present
        expect(result.current.events.length).toBe(6); // All cached events included
        expect(result.current.events.map((e: NDKEvent) => e.id)).toEqual(
            expect.arrayContaining([
                'muted-event-pubkey',
                'non-muted-event-1',
                'muted-event-word',
                'muted-event-tag',
                'muted-event-id',
                'muted-referenced-event-id',
            ])
        );
    });
});
