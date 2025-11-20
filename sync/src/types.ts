import type { NDKEvent, NDKEventId, NDKRelaySet } from "@nostr-dev-kit/ndk";

/**
 * Phase of the negentropy sync negotiation process
 */
export type NegotiationPhase = "initiating" | "reconciling" | "closing" | "fetching";

/**
 * Progress information during negentropy sync negotiation.
 * Provides real-time visibility into the sync process with a relay.
 */
export interface NegotiationProgress {
    /**
     * Current phase of the sync negotiation
     */
    phase: NegotiationPhase;

    /**
     * Current round number (number of message exchanges so far)
     */
    round: number;

    /**
     * Cumulative count of event IDs we need from the relay
     */
    needCount: number;

    /**
     * Cumulative count of event IDs we have that the relay doesn't
     */
    haveCount: number;

    /**
     * Size of the current/last message in bytes
     */
    messageSize: number;

    /**
     * Timestamp when this progress update was created
     */
    timestamp: number;
}

/**
 * Options for the NDK sync operation
 */
export interface NDKSyncOptions {
    /**
     * Explicit relay set to use for this sync instead of calculating it.
     * If both relaySet and relayUrls are provided, relaySet takes precedence.
     */
    relaySet?: NDKRelaySet;

    /**
     * Explicit relay URLs to use for this sync instead of calculating the relay set.
     * An NDKRelaySet will be created internally from these URLs.
     * If relaySet is also provided, relaySet takes precedence.
     */
    relayUrls?: string[];

    /**
     * Automatically fetch needed events after sync completes.
     * When true, events are fetched and cached, and returned in the result.
     * When false, only the IDs are returned, and the developer must fetch manually.
     * @default true
     */
    autoFetch?: boolean;

    /**
     * Frame size limit for negentropy protocol messages.
     * Limits the size of individual sync messages to prevent relay issues.
     * @default 50000 (50KB)
     */
    frameSizeLimit?: number;

    /**
     * Timeout for sync session in milliseconds.
     * @default 30000 (30 seconds)
     */
    timeout?: number;

    /**
     * Callback for relay errors during sync.
     * Useful for debugging and monitoring.
     * Can be async to perform operations like cache updates.
     */
    onRelayError?: (relay: import("@nostr-dev-kit/ndk").NDKRelay, error: Error) => void | Promise<void>;

    /**
     * Callback for negotiation progress updates during sync.
     * Called multiple times during the sync process with each relay to provide
     * real-time visibility into the negotiation rounds and event discovery.
     *
     * @param relay - The relay currently being synced
     * @param progress - Current negotiation progress information
     *
     * @example
     * ```typescript
     * const sync = new NDKSync(ndk);
     * await sync.sync(filters, {
     *   onNegotiationProgress: (relay, progress) => {
     *     console.log(`${relay.url}: Round ${progress.round}, Phase: ${progress.phase}`);
     *     console.log(`  Need: ${progress.needCount}, Have: ${progress.haveCount}`);
     *   }
     * });
     * ```
     */
    onNegotiationProgress?: (
        relay: import("@nostr-dev-kit/ndk").NDKRelay,
        progress: NegotiationProgress,
    ) => void | Promise<void>;
}

/**
 * Result of a sync operation
 */
export interface NDKSyncResult {
    /**
     * Events that were fetched and cached (if autoFetch: true).
     * Empty if autoFetch: false.
     */
    events: NDKEvent[];

    /**
     * Event IDs we needed from the relay(s) during sync.
     * These are events the relay has that we don't.
     */
    need: Set<NDKEventId>;

    /**
     * Event IDs we have that the relay(s) don't.
     * Informational only - upload not yet implemented.
     */
    have: Set<NDKEventId>;
}

/**
 * Bound for a negentropy range.
 * Consists of a timestamp and optional ID prefix.
 */
export interface Bound {
    timestamp: number;
    id: Uint8Array;
}

/**
 * Item stored in negentropy storage.
 */
export interface StorageItem {
    timestamp: number;
    id: Uint8Array;
}

/**
 * Negentropy protocol modes
 */
export enum NegentropyMode {
    Skip = 0,
    Fingerprint = 1,
    IdList = 2,
}
