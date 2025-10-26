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
 * A reactive thread view that maintains parent chain, focused event, and replies
 */
export interface ThreadView {
    /** Parent chain from root to the focused event (oldest first) */
    readonly parents: ThreadNode[];

    /** The currently focused event */
    readonly main: NDKEvent;

    /** Direct replies to the focused event */
    readonly replies: NDKEvent[];

    /**
     * Re-center the thread view on a different event
     * @param event - The event to focus on (or its ID)
     */
    focusOn(event: NDKEvent | string): Promise<void>;

    /**
     * Clean up subscriptions and resources
     */
    cleanup(): void;
}

/**
 * Internal state for the thread builder
 */
export interface ThreadState {
    subscription?: NDKSubscription;
    rootId?: string;
    parentChainBuilt: boolean;
}