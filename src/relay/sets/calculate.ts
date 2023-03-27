import NDK from '../../';
import {Relay} from '../';
import Event from '../../events/';
import {RelaySet} from './';
import {Filter} from '../../subscription/';

/**
 * Creates a RelaySet for the specified event.
 * TODO: account for relays where tagged pubkeys or hashtags
 * tend to write to.
 * @param ndk {NDK}
 * @param event {Event}
 * @returns Promise<RelaySet>
 */
export function calculateRelaySetFromEvent(ndk: NDK, event: Event): RelaySet {
    const relays: Set<Relay> = new Set();

    ndk.relayPool?.relays.forEach(relay => relays.add(relay));

    return new RelaySet(relays);
}

/**
 * Creates a RelaySet for the specified filter
 * @param ndk
 * @param filter
 * @returns Promise<RelaySet>
 */
export function calculateRelaySetFromFilter(
    ndk: NDK,
    filter: Filter
): RelaySet {
    const relays: Set<Relay> = new Set();

    ndk.relayPool?.relays.forEach(relay => relays.add(relay));

    return new RelaySet(relays);
}

/**
 * Calculates a number of RelaySets for each filter.
 * @param ndk
 * @param filters
 */
export function calculateRelaySetsFromFilters(
    ndk: NDK,
    filters: Filter[]
): Map<Filter, RelaySet> {
    const sets: Map<Filter, RelaySet> = new Map();

    filters.forEach(filter => {
        const set = calculateRelaySetFromFilter(ndk, filter);
        sets.set(filter, set);
    });

    return sets;
}
