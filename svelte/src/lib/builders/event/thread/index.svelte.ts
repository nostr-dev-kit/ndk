import { NDKEvent, type NDKSubscription } from "@nostr-dev-kit/ndk";
import { NDKKind } from "@nostr-dev-kit/ndk";
import type { CreateThreadViewOptions, ThreadView, ThreadNode } from "./types.js";
import {
    findRootId,
    buildParentChain,
    filterDirectReplies,
    buildThreadFilters
} from "./utils.js";

/**
 * Create a reactive thread view for a Nostr event
 *
 * Automatically handles:
 * - Parent chain discovery (with missing event tracking)
 * - Direct reply filtering
 * - Multiple tag convention support (NIP-10 markers and legacy)
 * - Reactive updates as new events stream in
 * - Missing event fetching with relay hints
 *
 * @example
 * ```typescript
 * const thread = createThreadView({
 *   ndk,
 *   focusedEvent: mainEvent
 * });
 *
 * // Access reactive data
 * {#each thread.parents as node}
 *   {#if node.event}
 *     <NoteCard event={node.event} />
 *   {:else}
 *     <MissingEventCard id={node.id} relayHint={node.relayHint} />
 *   {/if}
 * {/each}
 *
 * <NoteCard event={thread.main} variant="focused" />
 *
 * {#each thread.replies as reply}
 *   <NoteCard event={reply} />
 * {/each}
 *
 * // Navigate to different event
 * await thread.focusOn(replyEvent);
 *
 * // Cleanup when done
 * onDestroy(() => thread.cleanup());
 * ```
 */
export function createThreadView({
    ndk,
    focusedEvent,
    maxDepth = 20,
    kinds = [NDKKind.Text, 9802]
}: CreateThreadViewOptions): ThreadView {
    // Internal reactive state
    let _parents = $state<ThreadNode[]>([]);
    let _main = $state<NDKEvent | null>(null);
    let _replies = $state<NDKEvent[]>([]);

    // Subscription management
    let subscription: NDKSubscription | undefined;
    let missingEventSubscriptions = new Map<string, NDKSubscription>();

    // Event cache for the current thread
    let eventMap = new Map<string, NDKEvent>();

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
        const newParents = buildParentChain(_main, eventMap, maxDepth);

        // Update parents (reactive)
        _parents = newParents;

        // Filter direct replies
        const allEvents = Array.from(eventMap.values());
        const newReplies = filterDirectReplies(_main, allEvents);

        // Update replies (reactive)
        _replies = newReplies;

        // Fetch missing events in the parent chain
        fetchMissingEvents();
    }

    function fetchMissingEvents() {
        // Find missing events in parent chain
        const missingNodes = _parents.filter(node => !node.event);

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

    async function focusOn(event: NDKEvent | string) {
        // Clean up existing subscriptions
        cleanup();

        // Reset state
        eventMap.clear();
        _parents = [];
        _replies = [];

        // Set new main event
        if (typeof event === 'string') {
            const fetchedEvent = await ndk.fetchEvent(event);
            if (fetchedEvent) {
                _main = fetchedEvent;
            }
        } else {
            _main = event;
        }

        // Restart subscription with new focus
        if (_main) {
            startThreadSubscription();
        }
    }

    function cleanup() {
        // Stop main subscription
        subscription?.stop();
        subscription = undefined;

        // Stop all missing event subscriptions
        for (const sub of missingEventSubscriptions.values()) {
            sub.stop();
        }
        missingEventSubscriptions.clear();
    }

    // Return public API
    return {
        // Reactive getters
        get parents() { return _parents; },
        get main() { return _main!; },
        get replies() { return _replies; },

        // Methods
        focusOn,
        cleanup
    };
}

// Re-export types
export type { ThreadView, ThreadNode, CreateThreadViewOptions } from "./types.js";