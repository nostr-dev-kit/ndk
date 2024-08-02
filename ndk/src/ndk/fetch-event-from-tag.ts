import type { NDK } from ".";
import type { NDKEvent, NDKTag } from "../events";
import { getRelaysForSync } from "../outbox/write";
import { NDKRelaySet } from "../relay/sets";
import { calculateRelaySetsFromFilters } from "../relay/sets/calculate";
import type { NDKSubscriptionOptions } from "../subscription";

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

function isValidHint(hint: string | undefined) {
    if (!hint || hint === "") return false;

    // Check if the hint is a valid URL
    try {
        new URL(hint);
        return true;
    } catch (e) {
        return false;
    }
}

function isRelayHintConnected(ndk: NDK, hint: string | undefined) {
    if (!isValidHint(hint)) return false;

    return ndk.pool.isRelayConnected(hint!);
}

/**
 * @ignore
 */
export async function fetchEventFromTag(
    this: NDK,
    tag: NDKTag,
    originalEvent: NDKEvent,
    subOpts?: NDKSubscriptionOptions,
    fallback: NDKFetchFallbackOptions = {
        type: "timeout",
    }
) {
    const d = this.debug.extend("fetch-event-from-tag");
    const [_, id, hint] = tag;

    // If we are supposed to stick to the cache, just go with that
    // if (subOpts?.cacheUsage === NDKSubscriptionCacheUsage.ONLY_CACHE) {
    //     return this.fetchEvent(id, subOpts);
    // }

    // XXXXX
    subOpts = {};

    d("fetching event from tag", tag, subOpts, fallback);

    // If we are connected to the relay hint, try exclusively from that relay
    // if (isRelayHintConnected(this, hint)) {
    //     d("fetching event from connected relay hint (%s)", normalizeRelayUrl(hint));
    //     let event = await this.fetchEvent(id, subOpts, this.pool.getRelay(hint));
    //     if (event) return event;
    // }

    // Check if we have a relay list for the author of the original event
    // and prefer to use those relays
    const authorRelays = getRelaysForSync(this, originalEvent.pubkey);
    if (authorRelays && authorRelays.size > 0) {
        d("fetching event from author relays %o", Array.from(authorRelays));
        const relaySet = NDKRelaySet.fromRelayUrls(Array.from(authorRelays), this);
        const event = await this.fetchEvent(id, subOpts, relaySet);
        if (event) return event;
    } else {
        d("no author relays found for %s", originalEvent.pubkey, originalEvent);
    }

    // Attempt without relay hint on whatever NDK calculates
    const relaySet = calculateRelaySetsFromFilters(this, [{ ids: [id] }], this.pool);
    d("fetching event without relay hint", relaySet);
    const event = await this.fetchEvent(id, subOpts);
    if (event) return event;

    // If we didn't get the event, try to fetch in the relay hint
    if (hint && hint !== "") {
        const event = await this.fetchEvent(
            id,
            subOpts,
            this.pool.getRelay(hint, true, true, [{ ids: [id] }])
        );
        if (event) return event;
    }

    let result: NDKEvent | null | undefined = undefined;

    const relay = isValidHint(hint)
        ? this.pool.getRelay(hint, false, true, [{ ids: [id] }])
        : undefined;

    const fetchMaybeWithRelayHint = new Promise<NDKEvent | null>((resolve) => {
        this.fetchEvent(id, subOpts, relay).then(resolve);
    });

    // if we don't have a relay hint we don't need to setup a fallback
    if (!isValidHint(hint) || fallback.type === "none") {
        return fetchMaybeWithRelayHint;
    }

    /**
     * Fallback fetch promise.
     */
    const fallbackFetchPromise = new Promise<NDKEvent | null>(async (resolve) => {
        const fallbackRelaySet = fallback.relaySet;

        const timeout = fallback.timeout ?? 1500;
        const timeoutPromise = new Promise<void>((resolve) => setTimeout(resolve, timeout));

        // if this is a timeout fallback, we need to wait for the timeout to resolve
        if (fallback.type === "timeout") await timeoutPromise;

        if (result) {
            resolve(result);
        } else {
            d("fallback fetch triggered");
            const fallbackEvent = await this.fetchEvent(id, subOpts, fallbackRelaySet);
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
