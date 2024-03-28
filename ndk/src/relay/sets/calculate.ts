import type { NDKEvent } from "../../events/index.js";
import type { NDK } from "../../ndk/index.js";
import { getRelaysForFilterWithAuthors } from "../../outbox/read/with-authors.js";
import type { NDKFilter } from "../../subscription/index.js";
import type { Hexpubkey } from "../../user/index.js";
import type { NDKRelay } from "../index.js";
import { NDKPool } from "../pool/index.js";
import { NDKRelaySet } from "./index.js";

/**
 * Creates a NDKRelaySet for the specified event.
 * TODO: account for relays where tagged pubkeys or hashtags
 * tend to write to.
 * @param ndk {NDK}
 * @param event {Event}
 * @returns Promise<NDKRelaySet>
 */
export function calculateRelaySetFromEvent(ndk: NDK, event: NDKEvent): NDKRelaySet {
    const relays: Set<NDKRelay> = new Set();

    // try to fetch all tagged events from the cache

    ndk.pool?.relays.forEach((relay: NDKRelay) => relays.add(relay));

    return new NDKRelaySet(relays, ndk);
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
    filters: NDKFilter[],
    pool: NDKPool
): Map<WebSocket["url"], NDKFilter[]> {
    const result = new Map<WebSocket["url"], NDKFilter[]>();
    const authors = new Set<Hexpubkey>();

    filters.forEach((filter) => {
        if (filter.authors) {
            filter.authors.forEach((author) => authors.add(author));
        }
    });

    // if this filter has authors, get write relays for each
    // one of them and add them to the map
    if (authors.size > 0) {
        const authorToRelaysMap = getRelaysForFilterWithAuthors(ndk, Array.from(authors), pool);

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
                    const authorFilterAndRelayPubkeyIntersection = filter.authors.filter((author) =>
                        authors.includes(author)
                    );
                    result.set(relayUrl, [
                        ...result.get(relayUrl)!,
                        {
                            ...filter,

                            // Overwrite authors sent to this relay with the authors that were
                            // present in the filter and are also present in the relay
                            authors: authorFilterAndRelayPubkeyIntersection,
                        },
                    ]);
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
        Array.from(pool.relays.keys()).forEach((relay: WebSocket["url"]) => {
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
    filters: NDKFilter[],
    pool: NDKPool
): Map<WebSocket["url"], NDKFilter[]> {
    return calculateRelaySetsFromFilter(ndk, filters, pool);
}
