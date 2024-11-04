import { chooseRelayCombinationForPubkeys, getAllRelaysForAllPubkeys } from "..";
import type { NDK } from "../../ndk";
import { NDKRelay } from "../../relay";
import { NDKPool } from "../../relay/pool";
import type { Hexpubkey } from "../../user";
import { getTopRelaysForAuthors } from "../relay-ranking";
import { getWriteRelaysFor, getRelaysForSync } from "../write";

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
    relayGoalPerAuthor: number = 2
): Map<WebSocket["url"], Hexpubkey[]> {
    return chooseRelayCombinationForPubkeys(ndk, authors, "write", { count: relayGoalPerAuthor });
}
