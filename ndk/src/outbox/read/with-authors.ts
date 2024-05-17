import { NDK } from "../../ndk";
import { NDKRelay } from "../../relay";
import { NDKPool } from "../../relay/pool";
import { Hexpubkey } from "../../user";
import { getTopRelaysForAuthors } from "../relay-ranking";

export function getWriteRelaysFor(ndk: NDK, author: Hexpubkey): Set<WebSocket["url"]> | undefined {
    if (!ndk.outboxTracker) return undefined;

    return ndk.outboxTracker.data.get(author)?.writeRelays;
}

type PubkeyToRelaysMap = Map<Hexpubkey, Set<WebSocket["url"]>>;

export function getAllRelaysForAllPubkeys(
    ndk: NDK,
    pubkeys: Hexpubkey[]
): {
    pubkeysToRelays: PubkeyToRelaysMap;
    authorsMissingRelays: Set<Hexpubkey>;
} {
    const pubkeysToRelays = new Map<Hexpubkey, Set<WebSocket["url"]>>();
    const authorsMissingRelays = new Set<Hexpubkey>();

    pubkeys.forEach((author) => {
        const writeRelays = getWriteRelaysFor(ndk, author);
        if (writeRelays && writeRelays.size > 0) {
            writeRelays.forEach((relay) => {
                const pubkeysInRelay = pubkeysToRelays.get(relay) || new Set();
                pubkeysInRelay.add(author);
                pubkeysToRelays.set(relay, pubkeysInRelay);
            });

            pubkeysToRelays.set(author, writeRelays);
        } else {
            authorsMissingRelays.add(author);
        }
    });

    return { pubkeysToRelays, authorsMissingRelays };
}

/**
 * Calculate the relays for a filter with authors
 *
 * @param ndk
 * @param authors
 * @param pool
 * @param relayGoalPerAuthor
 * @returns Map<WebSocket["url"], Hexpubkey[]>
 */
export function getRelaysForFilterWithAuthors(
    ndk: NDK,
    authors: Hexpubkey[],
    pool: NDKPool,
    relayGoalPerAuthor: number = 2
): Map<WebSocket["url"], Hexpubkey[]> {
    const relayToAuthorsMap = new Map<WebSocket["url"], Hexpubkey[]>();

    const { pubkeysToRelays, authorsMissingRelays } = getAllRelaysForAllPubkeys(ndk, authors);

    const sortedRelays = getTopRelaysForAuthors(ndk, authors);

    const addAuthorToRelay = (author: Hexpubkey, relay: WebSocket["url"]) => {
        const authorsInRelay = relayToAuthorsMap.get(relay) || [];
        authorsInRelay.push(author);
        relayToAuthorsMap.set(relay, authorsInRelay);
    };

    // Go through the pubkeys that have relays
    for (const [author, authorRelays] of pubkeysToRelays.entries()) {
        let missingRelaysForThisAuthor = relayGoalPerAuthor;

        // Go through the relays for this author and add them to the relayToAuthorsMap until we have enough (relayGoalPerAuthor)
        // If we are already connected to some of this user's relays, add those first
        const connectedRelays = pool.connectedRelays();
        for (const relay of connectedRelays) {
            if (authorRelays.has(relay.url)) {
                addAuthorToRelay(author, relay.url);
                missingRelaysForThisAuthor--;
            }
        }

        for (const authorRelay of authorRelays) {
            if (relayToAuthorsMap.has(authorRelay)) {
                addAuthorToRelay(author, authorRelay);
                missingRelaysForThisAuthor--;
            }
        }

        // We've satisfied the relay goal for this author
        if (missingRelaysForThisAuthor <= 0) continue;

        // If we still need more relays for this author, add the relays we are missing in order of relay ranking
        for (const relay of sortedRelays) {
            if (missingRelaysForThisAuthor <= 0) break;

            if (authorRelays.has(relay)) {
                addAuthorToRelay(author, relay);
                missingRelaysForThisAuthor--;
            }
        }
    }

    // For the authors that are missing relays, pool's relays
    for (const author of authorsMissingRelays) {
        pool.permanentAndConnectedRelays().forEach((relay: NDKRelay) => {
            const authorsInRelay = relayToAuthorsMap.get(relay.url) || [];
            authorsInRelay.push(author);
            relayToAuthorsMap.set(relay.url, authorsInRelay);
        });
    }

    return relayToAuthorsMap;
}
