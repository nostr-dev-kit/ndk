import type { NDKEvent } from "../../events/index.js";
import type { NDK } from "../../ndk/index.js";
import { chooseRelayCombinationForPubkeys } from "../../outbox/index.js";
import { getRelaysForFilterWithAuthors } from "../../outbox/read/with-authors.js";
import { getWriteRelaysFor } from "../../outbox/write.js";
import type { NDKFilter } from "../../subscription/index.js";
import type { Hexpubkey } from "../../user/index.js";
import { normalizeRelayUrl } from "../../utils/normalize-url.js";
import type { NDKRelay } from "../index.js";
import type { NDKPool } from "../pool/index.js";
import { NDKRelaySet } from "./index.js";
import createDebug from "debug";

const d = createDebug("ndk:outbox:calculate");

/**
 * Creates a NDKRelaySet for the specified event.
 * TODO: account for relays where tagged pubkeys or hashtags
 * tend to write to.
 * @param ndk {NDK}
 * @param event {Event}
 * @returns Promise<NDKRelaySet>
 */
export async function calculateRelaySetFromEvent(ndk: NDK, event: NDKEvent): Promise<NDKRelaySet> {
    const relays: Set<NDKRelay> = new Set();

    // get the author's write relays
    const authorWriteRelays = await getWriteRelaysFor(ndk, event.pubkey);
    if (authorWriteRelays) {
        authorWriteRelays.forEach((relayUrl) => {
            const relay = ndk.pool?.getRelay(relayUrl);
            if (relay) relays.add(relay);
        });
    }

    // get all the hinted relays
    let relayHints = event.tags
        .filter((tag) => ["a", "e"].includes(tag[0]))
        .map((tag) => tag[2])
        // verify it's a valid URL
        .filter((url: string | undefined) => url && url.startsWith("wss://"))
        .filter((url: string) => {
            try {
                new URL(url);
                return true;
            } catch {
                return false;
            }
        })
        .map((url: string) => normalizeRelayUrl(url));

    // make unique
    relayHints = Array.from(new Set(relayHints)).slice(0, 5);
    relayHints.forEach((relayUrl) => {
        const relay = ndk.pool?.getRelay(relayUrl, true, true);
        if (relay) {
            d("Adding relay hint %s", relayUrl);
            relays.add(relay);
        }
    });

    const pTags = event.getMatchingTags("p").map((tag) => tag[1]);

    if (pTags.length < 5) {
        const pTaggedRelays = Array.from(
            chooseRelayCombinationForPubkeys(ndk, pTags, "read", {
                preferredRelays: new Set(authorWriteRelays),
            }).keys()
        );
        pTaggedRelays.forEach((relayUrl) => {
            const relay = ndk.pool?.getRelay(relayUrl, false, true);
            if (relay) {
                d("Adding p-tagged relay %s", relayUrl);
                relays.add(relay);
            }
        });
    } else {
        d("Too many p-tags to consider %d", pTags.length);
    }

    ndk.pool?.permanentAndConnectedRelays().forEach((relay: NDKRelay) => relays.add(relay));

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
        const authorToRelaysMap = getRelaysForFilterWithAuthors(ndk, Array.from(authors));

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
        if (ndk.explicitRelayUrls) {
            ndk.explicitRelayUrls.forEach((relayUrl) => {
                result.set(relayUrl, filters);
            });
        }
    }

    if (result.size === 0) {
        // If we don't have any relays, add all the permanent relays
        pool.permanentAndConnectedRelays()
            .slice(0, 5)
            .forEach((relay) => {
                result.set(relay.url, filters);
            });
    }

    if (result.size === 0) {
        console.warn("No relays found for filter", filters);
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
    const a = calculateRelaySetsFromFilter(ndk, filters, pool);

    return a;
}
