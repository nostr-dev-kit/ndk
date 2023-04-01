import NDK from '../../';
import {NDKRelay} from '../';
import Event from '../../events/';
import {NDKRelaySet} from './';
import {NDKFilter} from '../../subscription/';

/**
 * Creates a NDKRelaySet for the specified event.
 * TODO: account for relays where tagged pubkeys or hashtags
 * tend to write to.
 * @param ndk {NDK}
 * @param event {Event}
 * @returns Promise<NDKRelaySet>
 */
export function calculateRelaySetFromEvent(ndk: NDK, event: Event): NDKRelaySet {
    const relays: Set<NDKRelay> = new Set();

    ndk.relayPool?.relays.forEach(relay => relays.add(relay));

    return new NDKRelaySet(relays);
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

    ndk.relayPool?.relays.forEach(relay => relays.add(relay));

    return new NDKRelaySet(relays);
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

    filters.forEach(filter => {
        const set = calculateRelaySetFromFilter(ndk, filter);
        sets.set(filter, set);
    });

    return sets;
}
