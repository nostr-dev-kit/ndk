import Event from "../../events/index.js";
import NDK from "../../index.js";
import { NDKFilter } from "../../subscription/index.js";
import { NDKRelay } from "../index.js";
import { NDKRelaySet } from "./index.js";

/**
 * Creates a NDKRelaySet for the specified event.
 * TODO: account for relays where tagged pubkeys or hashtags
 * tend to write to.
 * @param ndk {NDK}
 * @param event {Event}
 * @returns Promise<NDKRelaySet>
 */
export function calculateRelaySetFromEvent(
    ndk: NDK,
    event: Event
): NDKRelaySet {
    const relays: Set<NDKRelay> = new Set();

    ndk.pool?.relays.forEach((relay) => relays.add(relay));

    return new NDKRelaySet(relays, ndk);
}

/**
 * Creates a NDKRelaySet for the specified filter
 * @param ndk
 * @param filter
 * @returns Promise<NDKRelaySet>
 */
export function calculateRelaySetFromFilter(
    ndk: NDK,
    filter: NDKFilter
): NDKRelaySet {
    const relays: Set<NDKRelay> = new Set();

    ndk.pool?.relays.forEach((relay) => {
        if (!relay.complaining) {
            relays.add(relay);
        } else {
            ndk.debug(`Relay ${relay.url} is complaining, not adding to set`);
        }
    });

    return new NDKRelaySet(relays, ndk);
}

/**
 * Calculates a number of RelaySets for each filter.
 * @param ndk
 * @param filters
 */
export function calculateRelaySetsFromFilters(
    ndk: NDK,
    filters: NDKFilter[]
): Map<NDKFilter, NDKRelaySet> {
    const sets: Map<NDKFilter, NDKRelaySet> = new Map();

    filters.forEach((filter) => {
        const set = calculateRelaySetFromFilter(ndk, filter);
        sets.set(filter, set);
    });

    return sets;
}
