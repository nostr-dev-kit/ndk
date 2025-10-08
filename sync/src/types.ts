import type { NDKEvent, NDKEventId, NDKRelaySet } from "@nostr-dev-kit/ndk";

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
     * Skip saving synced events to cache.
     * @default false
     */
    skipCache?: boolean;

    /**
     * Callback for relay errors during sync.
     * Useful for debugging and monitoring.
     * Can be async to perform operations like cache updates.
     */
    onRelayError?: (relay: import("@nostr-dev-kit/ndk").NDKRelay, error: Error) => void | Promise<void>;
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
