import type { NDKEvent } from "@nostr-dev-kit/ndk";
import type { ThreadNode } from "./types.js";

/**
 * Find the root event ID from an event's tags
 * Tries multiple strategies in order:
 * 1. NIP-10 marker=root
 * 2. NIP-10 marker=reply (might indicate parent)
 * 3. First 'e' tag (legacy convention for root)
 */
export function findRootId(event: NDKEvent): string | null {
    if (!event) return null;

    // Strategy 1: Find explicit root tag (NIP-10)
    const rootTag = event.tags.find(tag => tag[0] === 'e' && tag[3] === 'root');
    if (rootTag) {
        return rootTag[1];
    }

    // Strategy 2: Find reply tag - if present, it points to the parent
    // The root would need to be discovered by walking up the chain
    const replyTag = event.tags.find(tag => tag[0] === 'e' && tag[3] === 'reply');
    if (replyTag) {
        // For now, we'll need to walk up to find the actual root
        // This will be handled by the parent chain builder
        return null;
    }

    // Strategy 3: Legacy format - first 'e' tag is often the root
    const eTags = event.tags.filter(tag => tag[0] === 'e');
    if (eTags.length > 0) {
        return eTags[0][1];
    }

    return null;
}

/**
 * Find the immediate parent of an event
 * Tries multiple strategies:
 * 1. NIP-10 marker=reply
 * 2. Last 'e' tag (legacy convention for immediate parent)
 * 3. NIP-10 marker=root (if no reply tag exists, root is the parent)
 */
export function findParentId(event: NDKEvent): { id: string; relayHint?: string } | null {
    if (!event) return null;

    // Strategy 1: Find explicit reply tag (NIP-10)
    const replyTag = event.tags.find(tag => tag[0] === 'e' && tag[3] === 'reply');
    if (replyTag) {
        return {
            id: replyTag[1],
            relayHint: replyTag[2] || undefined
        };
    }

    // Strategy 2: Check for root tag - if present without reply, root is the parent
    const rootTag = event.tags.find(tag => tag[0] === 'e' && tag[3] === 'root');
    if (rootTag && rootTag[1] !== event.id) {
        return {
            id: rootTag[1],
            relayHint: rootTag[2] || undefined
        };
    }

    // Strategy 3: Legacy format - last 'e' tag is the immediate parent
    const eTags = event.tags.filter(tag => tag[0] === 'e');
    if (eTags.length > 0) {
        const lastTag = eTags[eTags.length - 1];
        return {
            id: lastTag[1],
            relayHint: lastTag[2] || undefined
        };
    }

    return null;
}

/**
 * Build the parent chain from the focused event up to the root
 * @param mainEvent - The event to start from
 * @param eventMap - Map of all fetched events by ID
 * @param maxDepth - Maximum depth to traverse (prevents infinite loops)
 * @returns Array of thread nodes from root to parent of mainEvent
 */
export function buildParentChain(
    mainEvent: NDKEvent,
    eventMap: Map<string, NDKEvent>,
    maxDepth: number = 20
): ThreadNode[] {
    const parents: ThreadNode[] = [];
    let currentEvent = mainEvent;
    let iteration = 0;
    const visitedIds = new Set<string>();

    while (currentEvent && iteration < maxDepth) {
        iteration++;

        // Prevent infinite loops
        if (visitedIds.has(currentEvent.id)) {
            console.warn('Circular reference detected in thread', currentEvent.id);
            break;
        }
        visitedIds.add(currentEvent.id);

        // Find the parent of the current event
        const parentInfo = findParentId(currentEvent);

        if (parentInfo?.id) {
            // Check if we have the parent event
            if (eventMap.has(parentInfo.id)) {
                const parentEvent = eventMap.get(parentInfo.id)!;
                parents.unshift({
                    id: parentInfo.id,
                    event: parentEvent,
                    relayHint: parentInfo.relayHint
                });
                currentEvent = parentEvent;
            } else {
                // Parent event not found - add a missing placeholder
                parents.unshift({
                    id: parentInfo.id,
                    event: null,
                    relayHint: parentInfo.relayHint
                });
                break; // Stop here since we can't continue the chain
            }
        } else {
            // No parent found, we've reached the root
            break;
        }
    }

    if (iteration >= maxDepth) {
        console.warn(`Thread depth limit reached (${maxDepth})`);
    }

    return parents;
}

/**
 * Filter events to find direct replies to a specific event or its continuation
 * Excludes events that are part of the continuation chain
 * @param targetEvent - The event to find replies for
 * @param allEvents - All events in the thread
 * @param continuationIds - IDs of events in the continuation chain to exclude
 * @returns Direct replies sorted by creation time (oldest first)
 */
export function filterDirectReplies(
    targetEvent: NDKEvent,
    allEvents: NDKEvent[],
    continuationIds: Set<string> = new Set()
): NDKEvent[] {
    if (!targetEvent?.id) return [];

    // Build set of all events we're looking for replies to (target + continuation)
    const targetIds = new Set([targetEvent.id, ...continuationIds]);

    const directReplies = allEvents.filter(reply => {
        // Don't include the target event itself
        if (reply.id === targetEvent.id) return false;

        // Don't include events in the continuation chain
        if (continuationIds.has(reply.id)) return false;

        // Check for explicit reply marker (NIP-10)
        const replyTag = reply.tags.find(tag =>
            tag[0] === 'e' && tag[3] === 'reply'
        );
        if (replyTag) {
            return targetIds.has(replyTag[1]);
        }

        // Legacy format: check if any target is the last 'e' tag
        const eTags = reply.tags.filter(tag => tag[0] === 'e');
        if (eTags.length > 0) {
            return targetIds.has(eTags[eTags.length - 1][1]);
        }

        return false;
    });

    // Sort by creation time (oldest first for consistent reading order)
    return directReplies.sort((a, b) => (a.created_at || 0) - (b.created_at || 0));
}

/**
 * Build filters for fetching thread events
 * This now includes filters to fetch descendants recursively
 * @param rootId - The root event ID (if known)
 * @param mainEventId - The focused event ID
 * @param kinds - Event kinds to include
 * @param descendantIds - Additional event IDs to fetch descendants for
 */
export function buildThreadFilters(
    rootId: string | null,
    mainEventId: string,
    kinds: number[],
    descendantIds: string[] = []
) {
    const filters = [];

    // If we know the root, fetch it and all events in the thread
    if (rootId && rootId !== mainEventId) {
        filters.push(
            { ids: [rootId] },
            { kinds, '#e': [rootId] }
        );
    }

    // Always fetch events replying to the main event
    filters.push({ kinds, '#e': [mainEventId] });

    // Fetch events replying to any known descendants (for recursive expansion)
    for (const descId of descendantIds) {
        if (descId !== mainEventId && descId !== rootId) {
            filters.push({ kinds, '#e': [descId] });
        }
    }

    // Also fetch the main event itself if we only have an ID
    filters.push({ ids: [mainEventId] });

    return filters;
}

/**
 * Build the continuation chain - same-author linear thread after the focused event
 * @param mainEvent - The focused event
 * @param eventMap - Map of all fetched events by ID
 * @param maxDepth - Maximum depth to traverse
 * @returns Array of thread nodes forming the continuation chain
 */
export function buildContinuationChain(
    mainEvent: NDKEvent,
    eventMap: Map<string, NDKEvent>,
    maxDepth: number = 20
): ThreadNode[] {
    const continuation: ThreadNode[] = [];
    const mainPubkey = mainEvent.pubkey;
    const allEvents = Array.from(eventMap.values());

    let currentEvent = mainEvent;
    let iteration = 0;
    const visitedIds = new Set<string>([mainEvent.id]);

    while (iteration < maxDepth) {
        iteration++;

        // Find same-author replies to current event
        const sameAuthorReplies = allEvents.filter(event => {
            if (visitedIds.has(event.id)) return false;
            if (event.pubkey !== mainPubkey) return false;

            // Check if it replies to currentEvent
            const replyTag = event.tags.find(tag =>
                tag[0] === 'e' && tag[3] === 'reply'
            );
            if (replyTag) {
                return replyTag[1] === currentEvent.id;
            }

            // Legacy: last e-tag
            const eTags = event.tags.filter(tag => tag[0] === 'e');
            return eTags.length > 0 && eTags[eTags.length - 1][1] === currentEvent.id;
        });

        // Sort by creation time and take the first (oldest)
        sameAuthorReplies.sort((a, b) => (a.created_at || 0) - (b.created_at || 0));

        if (sameAuthorReplies.length === 0) {
            break; // No more continuation
        }

        // Take the first same-author reply as the continuation
        const nextEvent = sameAuthorReplies[0];
        visitedIds.add(nextEvent.id);

        const parentInfo = findParentId(nextEvent);
        continuation.push({
            id: nextEvent.id,
            event: nextEvent,
            relayHint: parentInfo?.relayHint
        });

        currentEvent = nextEvent;
    }

    return continuation;
}

/**
 * Get all descendant event IDs from the event map
 * Used to build filters for recursive fetching
 */
export function collectDescendantIds(
    eventMap: Map<string, NDKEvent>
): string[] {
    return Array.from(eventMap.keys());
}

/**
 * Build the complete linear thread chain by merging parents + main + continuation
 * @param parents - Parent chain nodes
 * @param mainEvent - The focused event
 * @param continuation - Continuation chain nodes
 * @returns Complete linear thread chain
 */
export function buildLinearChain(
    parents: ThreadNode[],
    mainEvent: NDKEvent,
    continuation: ThreadNode[]
): ThreadNode[] {
    const parentInfo = findParentId(mainEvent);

    // Create main event node (without threading metadata yet)
    const mainNode: ThreadNode = {
        id: mainEvent.id,
        event: mainEvent,
        relayHint: parentInfo?.relayHint
    };

    // Merge all three parts into one linear chain
    const completeChain = [...parents, mainNode, ...continuation];

    // Recalculate threading metadata for the complete chain
    return completeChain.map((node, index) => {
        const nextNode = index < completeChain.length - 1 ? completeChain[index + 1] : null;

        // Check if this is a self-thread (same author as next node)
        const isSelfThread = nextNode?.event && node.event
            ? node.event.pubkey === nextNode.event.pubkey
            : false;

        // Show line to next if there's a next node
        const showLineToNext = nextNode !== null;

        // All nodes in the linear chain are main chain by definition
        const isMainChain = true;

        // Depth is the index in the chain
        const depth = index;

        return {
            ...node,
            threading: {
                isSelfThread,
                showLineToNext,
                depth,
                isMainChain
            }
        };
    });
}

/**
 * Split replies into those targeting the focused event vs other events in the thread
 * @param focusedEventId - ID of the focused event
 * @param allEvents - All events in the thread
 * @param threadEventIds - IDs of all events in the linear thread (to exclude)
 * @returns Object with replies to focused event and replies to other events
 */
export function splitRepliesByTarget(
    focusedEventId: string,
    allEvents: NDKEvent[],
    threadEventIds: Set<string>
): { replies: NDKEvent[]; otherReplies: NDKEvent[] } {
    const replies: NDKEvent[] = [];
    const otherReplies: NDKEvent[] = [];

    for (const event of allEvents) {
        // Skip if this event is part of the linear thread
        if (threadEventIds.has(event.id)) continue;

        // Find what this event is replying to
        const replyTag = event.tags.find(tag => tag[0] === 'e' && tag[3] === 'reply');
        let targetId: string | null = null;

        if (replyTag) {
            targetId = replyTag[1];
        } else {
            // Legacy: last e-tag is the target
            const eTags = event.tags.filter(tag => tag[0] === 'e');
            if (eTags.length > 0) {
                targetId = eTags[eTags.length - 1][1];
            }
        }

        if (!targetId) continue;

        // Check if it's replying to an event in our thread
        if (!threadEventIds.has(targetId)) continue;

        // Split by whether it's replying to focused event or other events
        if (targetId === focusedEventId) {
            replies.push(event);
        } else {
            otherReplies.push(event);
        }
    }

    // Sort both arrays by creation time
    const sortByTime = (a: NDKEvent, b: NDKEvent) => (a.created_at || 0) - (b.created_at || 0);
    replies.sort(sortByTime);
    otherReplies.sort(sortByTime);

    return { replies, otherReplies };
}