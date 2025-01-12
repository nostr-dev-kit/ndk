import type { NDK } from "../ndk";
import type { NDKRelay } from "../relay";
import type { Hexpubkey } from "../user";
import { getTopRelaysForAuthors } from "./relay-ranking";
import { getRelaysForSync } from "./write";

type PubkeyToRelaysMap = Map<Hexpubkey, Set<WebSocket["url"]>>;

/**
 * Gets all the relays for all the given pubkeys
 */
export function getAllRelaysForAllPubkeys(
    ndk: NDK,
    pubkeys: Hexpubkey[],
    type: "write" | "read" = "read"
): {
    pubkeysToRelays: PubkeyToRelaysMap;
    authorsMissingRelays: Set<Hexpubkey>;
} {
    const pubkeysToRelays = new Map<Hexpubkey, Set<WebSocket["url"]>>();
    const authorsMissingRelays = new Set<Hexpubkey>();

    pubkeys.forEach((pubkey) => {
        const relays = getRelaysForSync(ndk, pubkey, type);
        if (relays && relays.size > 0) {
            relays.forEach((relay) => {
                const pubkeysInRelay = pubkeysToRelays.get(relay) || new Set();
                pubkeysInRelay.add(pubkey);
                // pubkeysToRelays.set(relay, pubkeysInRelay);
            });

            pubkeysToRelays.set(pubkey, relays);
        } else {
            authorsMissingRelays.add(pubkey);
        }
    });

    return { pubkeysToRelays, authorsMissingRelays };
}

/**
 * Choose a combination of relay that makes sense to read or write to the given pubkeys
 * @param preferredRelays Relays that have preference to be chosen
 */
export function chooseRelayCombinationForPubkeys(
    ndk: NDK,
    pubkeys: Hexpubkey[],
    type: "write" | "read",
    { count, preferredRelays }: { count?: number; preferredRelays?: Set<WebSocket["url"]> } = {}
): Map<WebSocket["url"], Hexpubkey[]> {
    count ??= 2;
    preferredRelays ??= new Set<WebSocket["url"]>();

    const pool = ndk.pool;
    const connectedRelays = pool.connectedRelays();

    // add connected relays to the preferred relays
    connectedRelays.forEach((relay) => {
        preferredRelays!.add(relay.url);
    });

    const relayToAuthorsMap = new Map<WebSocket["url"], Hexpubkey[]>();

    const { pubkeysToRelays, authorsMissingRelays } = getAllRelaysForAllPubkeys(ndk, pubkeys, type);

    const sortedRelays = getTopRelaysForAuthors(ndk, pubkeys);

    const addAuthorToRelay = (author: Hexpubkey, relay: WebSocket["url"]) => {
        const authorsInRelay = relayToAuthorsMap.get(relay) || [];
        authorsInRelay.push(author);
        relayToAuthorsMap.set(relay, authorsInRelay);
    };

    // Go through the pubkeys that have relays
    for (const [author, authorRelays] of pubkeysToRelays.entries()) {
        let missingRelayCount = count;

        // Go through the relays for this author and add them to the relayToAuthorsMap until we have enough (relayGoalPerAuthor)
        // If we are already connected to some of this user's relays, add those first
        for (const relay of connectedRelays) {
            if (authorRelays.has(relay.url)) {
                addAuthorToRelay(author, relay.url);
                missingRelayCount--;
            }
        }

        for (const authorRelay of authorRelays) {
            if (relayToAuthorsMap.has(authorRelay)) {
                addAuthorToRelay(author, authorRelay);
                missingRelayCount--;
            }
        }

        // We've satisfied the relay goal for this author
        if (missingRelayCount <= 0) continue;

        // If we still need more relays for this author, add the relays we are missing in order of relay ranking
        for (const relay of sortedRelays) {
            if (missingRelayCount <= 0) break;

            if (authorRelays.has(relay)) {
                addAuthorToRelay(author, relay);
                missingRelayCount--;
            }
        }
    }

    // For the pubkey that are missing relays, pool's relays
    for (const author of authorsMissingRelays) {
        pool.permanentAndConnectedRelays().forEach((relay: NDKRelay) => {
            const authorsInRelay = relayToAuthorsMap.get(relay.url) || [];
            authorsInRelay.push(author);
            relayToAuthorsMap.set(relay.url, authorsInRelay);
        });
    }

    return relayToAuthorsMap;
}
