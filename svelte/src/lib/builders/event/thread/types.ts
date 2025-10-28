import type { NDKEvent, NDKSubscription } from "@nostr-dev-kit/ndk";
import type { NDKSvelte } from "../../../ndk-svelte.svelte.js";

/**
 * Threading metadata for UI rendering decisions
 */
export interface ThreadingMetadata {
    /** Whether this node continues a thread from the same author */
    isSelfThread: boolean;

    /** Whether to show a vertical line connecting to the next node */
    showLineToNext: boolean;

    /** Depth level in the thread (for indentation) */
    depth: number;

    /** Whether this is part of the main reply chain vs a branch */
    isMainChain: boolean;
}

/**
 * A node in the thread tree, which may or may not have a loaded event
 */
export interface ThreadNode {
    /** The event ID */
    id: string;

    /** The event if loaded, null if missing */
    event: NDKEvent | null;

    /** Relay hint from the e tag, if available */
    relayHint?: string;

    /** Threading metadata for UI rendering */
    threading?: ThreadingMetadata;
}

/**
 * Options for creating a thread view
 */
export interface CreateThreadViewOptions {
    /** NDK instance with reactive capabilities */
    ndk: NDKSvelte;

    /** The event to focus on (center of the thread view) */
    focusedEvent: NDKEvent | string;

    /** Maximum depth to traverse when building parent chain (default: 20) */
    maxDepth?: number;

    /** Event kinds to include in the thread (default: [1, 9802]) */
    kinds?: number[];
}

/**
 * A reactive thread view that maintains a linear event chain and branch replies
 * Cleanup is automatic via $effect when the component unmounts
 */
export interface ThreadView {
    /**
     * Complete linear thread from root through focused event to continuation
     * UI can determine which is focused by comparing event.id to focusedEventId
     */
    readonly events: ThreadNode[];

    /** Replies to the focused event only */
    readonly replies: NDKEvent[];

    /** Replies to other events in the thread (not the focused event) */
    readonly otherReplies: NDKEvent[];

    /** All replies to any event in the thread (replies + otherReplies) */
    readonly allReplies: NDKEvent[];

    /** ID of the currently focused event */
    readonly focusedEventId: string | null;

    /**
     * Re-center the thread view on a different event
     * @param event - The event to focus on (or its ID)
     */
    focusOn(event: NDKEvent | string): Promise<void>;
}

/**
 * Internal state for the thread builder
 */
export interface ThreadState {
    subscription?: NDKSubscription;
    rootId?: string;
    parentChainBuilt: boolean;
}