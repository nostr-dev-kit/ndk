import { NDKEvent, type NDKSubscription } from "@nostr-dev-kit/ndk";
import { NDKKind } from "@nostr-dev-kit/ndk";
import type { CreateThreadViewOptions, ThreadView, ThreadNode } from "./types.js";
import {
    findRootId,
    buildParentChain,
    buildContinuationChain,
    buildLinearChain,
    splitRepliesByTarget,
    buildThreadFilters,
    collectDescendantIds
} from "./utils.js";

/**
 * Create a reactive thread view for a Nostr event
 *
 * Automatically handles:
 * - Parent chain discovery (with missing event tracking)
 * - Thread continuation detection (same-author linear chains)
 * - Reply filtering (focused event vs other thread events)
 * - Multiple tag convention support (NIP-10 markers and legacy)
 * - Reactive updates as new events stream in
 * - Missing event fetching with relay hints
 * - Automatic cleanup on component unmount
 *
 * @example
 * ```typescript
 * const thread = createThreadView({
 *   ndk,
 *   focusedEvent: mainEvent
 * });
 *
 * // Access reactive data
 * {#each thread.events as node}
 *   {#if node.event}
 *     {#if node.event.id === thread.focusedEventId}
 *       <NoteCard event={node.event} variant="focused" />
 *     {:else}
 *       <NoteCard event={node.event} />
 *     {/if}
 *   {:else}
 *     <MissingEventCard id={node.id} relayHint={node.relayHint} />
 *   {/if}
 * {/each}
 *
 * {#each thread.replies as reply}
 *   <NoteCard event={reply} />
 * {/each}
 *
 * // Navigate to different event
 * await thread.focusOn(replyEvent);
 *
 * // Cleanup is automatic when component unmounts
 * ```
 */
export function createThreadView({
    ndk,
    focusedEvent,
    maxDepth = 20,
    kinds = [NDKKind.Text, 9802]
}: CreateThreadViewOptions): ThreadView {
    // Internal reactive state
    let _events = $state<ThreadNode[]>([]);
    let _replies = $state<NDKEvent[]>([]);
    let _otherReplies = $state<NDKEvent[]>([]);
    let _main = $state<NDKEvent | null>(null);

    // Subscription management
    let subscription: NDKSubscription | undefined;
    let missingEventSubscriptions = new Map<string, NDKSubscription>();

    // Event cache for the current thread
    let eventMap = new Map<string, NDKEvent>();

    // Track which events we've already requested descendants for
    let requestedDescendantIds = new Set<string>();

    // Initialize main event
    $effect(() => {
        initializeMainEvent();
    });

    async function initializeMainEvent() {
        if (typeof focusedEvent === 'string') {
            // Fetch the event if we only have an ID
            const event = await ndk.fetchEvent(focusedEvent);
            if (event) {
                _main = event;
                startThreadSubscription();
            }
        } else {
            _main = focusedEvent;
            startThreadSubscription();
        }
    }

    function startThreadSubscription() {
        if (!_main || subscription) return;

        // Find or guess the root ID
        const rootId = findRootId(_main);

        // Build filters for thread events
        const filters = buildThreadFilters(rootId, _main.id, kinds);

        // Create subscription
        subscription = ndk.subscribe(
            filters,
            {
                closeOnEose: false,
                groupable: false // Important for real-time updates
            }
        );

        subscription.on('event', (event: NDKEvent) => {
            // Add to our event map
            eventMap.set(event.id, event);

            // Rebuild the thread structure
            rebuildThreadStructure();
        });

        // Initial rebuild
        rebuildThreadStructure();
    }

    function rebuildThreadStructure() {
        if (!_main) return;

        // Build parent chain
        const parents = buildParentChain(_main, eventMap, maxDepth);

        // Build continuation chain (same-author linear thread after focused event)
        const continuation = buildContinuationChain(_main, eventMap, maxDepth);

        // Merge into complete linear chain
        const newEvents = buildLinearChain(parents, _main, continuation);

        // Update events (reactive)
        _events = newEvents;

        // Build set of all event IDs in the linear thread
        const threadEventIds = new Set(newEvents.map(node => node.id));

        // Split replies by target event
        const allEvents = Array.from(eventMap.values());
        const { replies, otherReplies } = splitRepliesByTarget(
            _main.id,
            allEvents,
            threadEventIds
        );

        // Update replies (reactive)
        _replies = replies;
        _otherReplies = otherReplies;

        // Fetch missing events in the linear chain
        fetchMissingEvents();

        // Recursively fetch descendants for thread expansion
        expandThreadDescendants();
    }

    function fetchMissingEvents() {
        // Find missing events in the linear chain
        const missingNodes = _events.filter(node => !node.event);

        for (const node of missingNodes) {
            // Skip if we're already fetching this event
            if (missingEventSubscriptions.has(node.id)) continue;

            // Create a targeted subscription for the missing event
            const filters = [{ ids: [node.id] }];

            // Add relay hint if available
            const relayUrls = node.relayHint ? [node.relayHint] : undefined;

            const sub = ndk.subscribe(
                filters,
                {
                    closeOnEose: true,
                    groupable: false,
                    // TODO: Add relay hint support when NDK supports it
                    // relays: relayUrls
                }
            );

            sub.on('event', (event: NDKEvent) => {
                if (event.id === node.id) {
                    // Add to event map
                    eventMap.set(event.id, event);

                    // Rebuild thread structure
                    rebuildThreadStructure();

                    // Clean up this subscription
                    sub.stop();
                    missingEventSubscriptions.delete(node.id);
                }
            });

            missingEventSubscriptions.set(node.id, sub);
        }
    }

    function expandThreadDescendants() {
        // Get all current event IDs
        const currentEventIds = collectDescendantIds(eventMap);

        // Find new events we haven't requested descendants for yet
        const newEventIds = currentEventIds.filter(id => !requestedDescendantIds.has(id));

        if (newEventIds.length === 0) return;

        // Mark these as requested
        newEventIds.forEach(id => requestedDescendantIds.add(id));

        // Build filters to fetch events replying to these new events
        const descendantFilters = newEventIds.map(id => ({ kinds, '#e': [id] }));

        if (descendantFilters.length === 0) return;

        // Subscribe to descendants
        const descendantSub = ndk.subscribe(
            descendantFilters,
            {
                closeOnEose: true,
                groupable: false
            }
        );

        descendantSub.on('event', (event: NDKEvent) => {
            // Add to event map if new
            if (!eventMap.has(event.id)) {
                eventMap.set(event.id, event);
                // Rebuild will be triggered when subscription closes
            }
        });

        descendantSub.on('eose', () => {
            // After fetching, rebuild the thread structure
            rebuildThreadStructure();
            descendantSub.stop();
        });
    }

    async function focusOn(event: NDKEvent | string) {
        let newMainEvent: NDKEvent | null = null;

        // Resolve the event
        if (typeof event === 'string') {
            // Check if we already have it in our cache
            newMainEvent = eventMap.get(event) || null;
            if (!newMainEvent) {
                const fetchedEvent = await ndk.fetchEvent(event);
                if (fetchedEvent) {
                    newMainEvent = fetchedEvent;
                    eventMap.set(fetchedEvent.id, fetchedEvent);
                }
            }
        } else {
            newMainEvent = event;
            // Ensure it's in our event map
            if (!eventMap.has(event.id)) {
                eventMap.set(event.id, event);
            }
        }

        if (!newMainEvent) return;

        // Check if this is in the same thread (share a root)
        const currentRootId = _main ? findRootId(_main) : null;
        const newRootId = findRootId(newMainEvent);
        const sameThread = currentRootId === newRootId;

        if (sameThread) {
            // Just update the main event and rebuild from existing data
            _main = newMainEvent;
            rebuildThreadStructure();
        } else {
            // Different thread - need to reset everything
            stopAllSubscriptions();
            eventMap.clear();
            requestedDescendantIds.clear();
            _events = [];
            _replies = [];
            _otherReplies = [];
            _main = newMainEvent;
            eventMap.set(newMainEvent.id, newMainEvent);
            startThreadSubscription();
        }
    }

    function stopAllSubscriptions() {
        // Stop main subscription
        subscription?.stop();
        subscription = undefined;

        // Stop all missing event subscriptions
        for (const sub of missingEventSubscriptions.values()) {
            sub.stop();
        }
        missingEventSubscriptions.clear();
    }

    // Automatic cleanup on component unmount
    $effect(() => {
        return () => {
            stopAllSubscriptions();
        };
    });

    // Return public API
    return {
        // Reactive getters
        get events() { return _events; },
        get replies() { return _replies; },
        get otherReplies() { return _otherReplies; },
        get allReplies() { return [..._replies, ..._otherReplies]; },
        get focusedEventId() { return _main?.id ?? null; },

        // Methods
        focusOn
    };
}

// Re-export types
export type { ThreadView, ThreadNode, CreateThreadViewOptions, ThreadingMetadata } from "./types.js";