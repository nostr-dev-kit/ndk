import type { NDKEvent } from "../events/index.js";
import { NDKKind } from "../events/kinds/index.js";
import { NDKRelayList, relayListFromKind3 } from "../events/kinds/NDKRelayList.js";
import type { NDK } from "../ndk/index.js";
import type { NDKRelay } from "../relay/index.js";
import { NDKRelaySet } from "../relay/sets/index.js";
import { NDKSubscriptionCacheUsage } from "../subscription/index.js";
import type { Hexpubkey } from "../user/index.js";

export async function getRelayListForUser(pubkey: Hexpubkey, ndk: NDK): Promise<NDKRelayList> {
    const list = await getRelayListForUsers([pubkey], ndk);
    return list.get(pubkey)!;
}

/**
 * Fetches a map of relay lists for a number of users
 * @param pubkeys
 * @param ndk
 * @returns
 */
export async function getRelayListForUsers(
    pubkeys: Hexpubkey[],
    ndk: NDK,
    skipCache = false
): Promise<Map<Hexpubkey, NDKRelayList>> {
    const pool = ndk.outboxPool || ndk.pool;
    const set = new Set<NDKRelay>();

    for (const relay of pool.relays.values()) set.add(relay);

    const relayLists = new Map<Hexpubkey, NDKRelayList>();
    const fromContactList = new Map<Hexpubkey, NDKEvent>();

    const relaySet = new NDKRelaySet(set, ndk);

    // get all kind 10002 events from cache if we have an adapter and is locking
    if (ndk.cacheAdapter?.locking && !skipCache) {
        const cachedList = await ndk.fetchEvents(
            { kinds: [3, 10002], authors: pubkeys },
            { cacheUsage: NDKSubscriptionCacheUsage.ONLY_CACHE }
        );

        // get list of relay lists from cache
        for (const relayList of cachedList) {
            if (relayList.kind === 10002)
                relayLists.set(relayList.pubkey, NDKRelayList.from(relayList));
        }

        for (const relayList of cachedList) {
            if (relayList.kind === 3) {
                // skip if we already have a relay list for this pubkey
                if (relayLists.has(relayList.pubkey)) continue;
                const list = relayListFromKind3(ndk, relayList);
                if (list) fromContactList.set(relayList.pubkey, list);
            }
        }

        // remove the pubkeys we found from the list
        pubkeys = pubkeys.filter(
            (pubkey) => !relayLists.has(pubkey) && !fromContactList.has(pubkey)
        );
    }

    // if we have no pubkeys left, return the results
    if (pubkeys.length === 0) return relayLists;

    const relayListEvents = new Map<Hexpubkey, NDKEvent>();
    const contactListEvents = new Map<Hexpubkey, NDKEvent>();

    return new Promise<Map<Hexpubkey, NDKRelayList>>(async (resolve) => {
        // Get from relays the missing pubkeys
        const sub = ndk.subscribe(
            { kinds: [3, 10002], authors: pubkeys },
            {
                closeOnEose: true,
                pool,
                groupable: true,
                cacheUsage: NDKSubscriptionCacheUsage.ONLY_RELAY,
                subId: "ndk-relay-list-fetch",
            },
            relaySet,
            false
        );

        /* Collect most recent version of events */
        sub.on("event", (event) => {
            if (event.kind === NDKKind.RelayList) {
                const existingEvent = relayListEvents.get(event.pubkey);
                if (existingEvent && existingEvent.created_at! > event.created_at!) return;
                relayListEvents.set(event.pubkey, event);
            } else if (event.kind === NDKKind.Contacts) {
                const existingEvent = contactListEvents.get(event.pubkey);
                if (existingEvent && existingEvent.created_at! > event.created_at!) return;
                contactListEvents.set(event.pubkey, event);
            }
        });

        sub.on("eose", () => {
            // Get all kind 10002 events
            for (const event of relayListEvents.values()) {
                relayLists.set(event.pubkey, NDKRelayList.from(event));
            }

            // Go through the pubkeys we don't have results for and get the from kind 3 events
            for (const pubkey of pubkeys) {
                if (relayLists.has(pubkey)) continue;
                const contactList = contactListEvents.get(pubkey);
                if (!contactList) continue;
                const list = relayListFromKind3(ndk, contactList);

                if (list) relayLists.set(pubkey, list);
            }

            resolve(relayLists);
        });

        sub.start();
    });
}
