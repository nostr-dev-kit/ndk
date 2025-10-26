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

    // Add threading metadata
    return addThreadingMetadata(parents, mainEvent);
}

/**
 * Add threading metadata to nodes for UI rendering
 * @param nodes - The parent chain nodes
 * @param mainEvent - The focused event
 * @returns Nodes with threading metadata
 */
function addThreadingMetadata(nodes: ThreadNode[], mainEvent: NDKEvent): ThreadNode[] {
    const mainPubkey = mainEvent.pubkey;

    return nodes.map((node, index) => {
        const nextNode = index < nodes.length - 1 ? nodes[index + 1] : null;
        const prevNode = index > 0 ? nodes[index - 1] : null;

        // Calculate if this is a self-thread (same author as next node)
        const isSelfThread = nextNode?.event
            ? node.event?.pubkey === nextNode.event.pubkey
            : false;

        // Show line to next if:
        // 1. There is a next node AND
        // 2. Either it's a self-thread OR it's a direct reply chain
        const showLineToNext = nextNode !== null;

        // All parent chain nodes are main chain by definition
        const isMainChain = true;

        // Depth increases as we go down the chain
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
 * Filter events to find direct replies to a specific event
 * @param targetEvent - The event to find replies for
 * @param allEvents - All events in the thread
 * @returns Direct replies sorted by creation time (oldest first)
 */
export function filterDirectReplies(
    targetEvent: NDKEvent,
    allEvents: NDKEvent[]
): NDKEvent[] {
    if (!targetEvent?.id) return [];

    const directReplies = allEvents.filter(reply => {
        // Don't include the target event itself
        if (reply.id === targetEvent.id) return false;

        // Check for explicit reply marker (NIP-10)
        const replyTag = reply.tags.find(tag =>
            tag[0] === 'e' && tag[3] === 'reply'
        );
        if (replyTag) {
            return replyTag[1] === targetEvent.id;
        }

        // Legacy format: check if our event is the last 'e' tag
        const eTags = reply.tags.filter(tag => tag[0] === 'e');
        return eTags.length > 0 && eTags[eTags.length - 1][1] === targetEvent.id;
    });

    // Sort by creation time (oldest first for consistent reading order)
    return directReplies.sort((a, b) => (a.created_at || 0) - (b.created_at || 0));
}

/**
 * Build filters for fetching thread events
 * @param rootId - The root event ID (if known)
 * @param mainEventId - The focused event ID
 * @param kinds - Event kinds to include
 */
export function buildThreadFilters(
    rootId: string | null,
    mainEventId: string,
    kinds: number[]
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

    // Also fetch the main event itself if we only have an ID
    filters.push({ ids: [mainEventId] });

    return filters;
}