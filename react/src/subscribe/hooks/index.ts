import type { NDKEvent, NDKSubscriptionOptions } from "@nostr-dev-kit/ndk";

/**
 * Extends NDKEvent with a 'from' method to wrap events with a kind-specific handler
 */
export type NDKEventWithFrom<T extends NDKEvent> = T & {
    from: (event: NDKEvent) => T;
};
export type NDKEventWithAsyncFrom<T extends NDKEvent> = T & {
    from: (event: NDKEvent) => Promise<T>;
};

export type UseSubscribeOptions = NDKSubscriptionOptions & {
    /**
     * Whether to include deleted events
     */
    includeDeleted?: boolean;

    /**
     * Buffer time in ms, false to disable buffering
     */
    bufferMs?: number | false;

    /**
     * Whether to include events from muted authors (default: false)
     */
    includeMuted?: boolean;
};
