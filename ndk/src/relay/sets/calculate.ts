import { NDKEvent } from "../../events/index.js";
import { NDK } from "../../ndk/index.js";
import { NDKFilter } from "../../subscription/index.js";
import { NDKRelay, NDKRelayUrl } from "../index.js";
import { NDKRelaySet } from "./index.js";
import { Hexpubkey } from "../../user/index.js";
import { Relay } from "nostr-tools";
import { NDKRelayFilters } from "../filter.js";
import debug from "debug";

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
    event: NDKEvent
): NDKRelaySet {
    const relays: Set<NDKRelay> = new Set();

    // try to fetch all tagged events from the cache

    ndk.pool?.relays.forEach((relay: NDKRelay) => relays.add(relay));

    return new NDKRelaySet(relays, ndk);
}

export function getWriteRelaysFor(
    ndk: NDK,
    author: Hexpubkey
): Set<NDKRelayUrl> | undefined {
    return ndk.outboxTracker!.data.get(author)?.writeRelays;

    // if the first character is between 'a' and 'f', return a set with 'relay1'
    if (author === 'fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52') {
        return new Set(["wss://relay.damus.com"]);
    } else if (author === 'ee11a5dff40c19a555f41fe42b48f00e618c91225622ae37b6c2bb67b76c4e49') {
        return new Set(["wss://relay.snort.social"]);
    } else {
        return undefined;
    }
}

/**
 * Creates a map of relay URLs that should receive a subset of the filter.
 *
 * The filter is broken up into the filter that each relay should receive.
 * @param ndk
 * @param filter
 * @returns Promise<NDKRelaySet>
 */
export function calculateRelaySetsFromFilter(
    ndk: NDK,
    filters: NDKFilter[]
): Map<NDKRelayUrl, NDKRelayFilters> {
    const result = new Map<NDKRelayUrl, NDKRelayFilters>();
    const authors = new Set<Hexpubkey>();

    filters.forEach((filter) => {
        if (filter.authors) {
            filter.authors.forEach((author) => authors.add(author));
        }
    });

    // if this filter has authors, get write relays for each
    // one of them and add them to the map
    if (authors.size > 0) {
        const authorToRelaysMap = new Map<NDKRelayUrl, Hexpubkey[]>();

        // Go through each pubkey in `authors`
        for (const author of authors) {
            // Get that pubkey's relays
            const userWriteRelays = getWriteRelaysFor(ndk, author);

            // If we have relays for this user, add them to the map
            if (userWriteRelays && userWriteRelays.size > 0) {
                ndk.debug(`Adding ${userWriteRelays.size} relays for ${author}`);
                userWriteRelays.forEach((relay) => {
                    const authorsInRelay = authorToRelaysMap.get(relay) || [];
                    authorsInRelay.push(author);
                    authorToRelaysMap.set(relay, authorsInRelay);
                });
            } else {
                // If we don't, add the explicit relays
                ndk.explicitRelayUrls?.forEach((relay: NDKRelayUrl) => {
                    const authorsInRelay = authorToRelaysMap.get(relay) || [];
                    authorsInRelay.push(author);
                    authorToRelaysMap.set(relay, authorsInRelay);
                });
            }
        }

        // initialize all result with all the relayUrls we are going to return
        for (const relayUrl of authorToRelaysMap.keys()) {
            result.set(relayUrl, []);
        }

        // go through all the authorToRelaysMap and replace the authors of each filter with
        // the resulting author set
        for (const filter of filters) {
            if (filter.authors) {
                // replace authors with the authors for each relay
                for (const [relayUrl, authors] of authorToRelaysMap.entries()) {
                    result.set(relayUrl, [...result.get(relayUrl)!, {...filter, authors}]);
                }
            } else {
                // if the filter doesn't have authors, add it to all relays
                for (const relayUrl of authorToRelaysMap.keys()) {
                    result.set(relayUrl, [...result.get(relayUrl)!, filter]);
                }
            }
        }
    } else {
        // If we don't, add the explicit relays
        ndk.explicitRelayUrls?.forEach((relay: NDKRelayUrl) => {
            result.set(relay, filters);
        });
    }

    return result;
}

/**
 * Calculates a number of RelaySets for each filter.
 * @param ndk
 * @param filters
 */
export function calculateRelaySetsFromFilters(
    ndk: NDK,
    filters: NDKFilter[]
): Map<NDKRelayUrl, NDKRelayFilters> {
    return calculateRelaySetsFromFilter(ndk, filters);
}
