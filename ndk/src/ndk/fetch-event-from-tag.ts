import { NDK } from ".";
import { NDKEvent, NDKTag } from "../events";
import type { NDKRelaySet } from "../relay/sets";
import { NDKSubscriptionOptions } from "../subscription";

/**
 * Options on how to handle when a relay hint doesn't respond
 * with the requested event.
 *
 * When a tag includes a relay hint, and the relay hint doesn't come back
 * with the event, the fallback options are used to try to fetch the event
 * from somewhere else.
 */
export type NDKFetchFallbackOptions = {
    /**
     * Relay set to use as a fallback when the hint relay doesn't respond.
     * If not provided, the normal NDK calculation is used (whether explicit relays or outbox calculation)
     * Default is `undefined`.
     */
    relaySet?: NDKRelaySet;

    /**
     * Type of fallback to use when the hint relay doesn't respond.
     * - "timeout" will wait for a timeout before falling back
     * - "eose" will wait for the EOSE before falling back
     * - "none" will not fall back
     * Default is "timeout".
     */
    type: "timeout" | "eose" | "none";

    /**
     * Timeout in milliseconds for the fallback relay.
     * Default is 1500ms.
     */
    timeout?: number;
};

export async function fetchEventFromTag(
    this: NDK,
    tag: NDKTag,
    subOpts?: NDKSubscriptionOptions,
    fallback: NDKFetchFallbackOptions = {
        type: "timeout",
    }
) {
    const d = this.debug.extend("fetch-event-from-tag");
    const [tagType, id, hint] = tag;

    let result: NDKEvent | null | undefined = undefined;

    let relay =
        hint && hint !== "" ? this.pool.getRelay(hint, true, true, [{ ids: [id] }]) : undefined;

    /**
     * Fetch with (maybe) a relay hint.
     */
    const fetchMaybeWithRelayHint = new Promise<NDKEvent | null>((resolve) => {
        this.fetchEvent(id, subOpts, relay).then(resolve);
    });

    // if we don't have a relay hint we don't need to setup a fallback
    if (hint === "" || !hint || fallback.type === "none") {
        return fetchMaybeWithRelayHint;
    }

    /**
     * Fallback fetch promise.
     */
    let fallbackFetchPromise = new Promise<NDKEvent | null>(async (resolve) => {
        let fallbackRelaySet = fallback.relaySet;

        let timeout = fallback.timeout ?? 1500;
        let timeoutPromise = new Promise<void>((resolve) => setTimeout(resolve, timeout));

        // if this is a timeout fallback, we need to wait for the timeout to resolve
        if (fallback.type === "timeout") await timeoutPromise;

        if (result) {
            resolve(result);
        } else {
            d("fallback fetch triggered");
            let fallbackEvent = await this.fetchEvent(id, subOpts, fallbackRelaySet);
            resolve(fallbackEvent);
        }
    });

    switch (fallback.type) {
        case "timeout":
            return Promise.race([fetchMaybeWithRelayHint, fallbackFetchPromise]);
        case "eose":
            result = await fetchMaybeWithRelayHint;
            if (result) return result;
            return fallbackFetchPromise;
    }
}
