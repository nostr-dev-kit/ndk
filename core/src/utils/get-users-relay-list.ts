import type { NDKEvent } from "../events/index.js";
import { NDKKind } from "../events/kinds/index.js";
import { NDKRelayList, relayListFromKind3 } from "../events/kinds/relay-list.js";
import type { NDK } from "../ndk/index.js";
import type { NDKRelay } from "../relay/index.js";
import { NDKRelaySet } from "../relay/sets/index.js";
import type { NDKSubscriptionOptions } from "../subscription/index.js";
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
 * @param skipCache
 * @param timeout
 * @param relayHints - Optional map of pubkey to relay URLs to augment the relay set for fetching that user's relay list
 * @returns
 */
export async function getRelayListForUsers(
    pubkeys: Hexpubkey[],
    ndk: NDK,
    skipCache = false,
    timeout = 1000,
    relayHints?: Map<Hexpubkey, string[]>,
): Promise<Map<Hexpubkey, NDKRelayList>> {
    const pool = ndk.outboxPool || ndk.pool;
    const set = new Set<NDKRelay>();

    for (const relay of pool.relays.values()) set.add(relay);

    // Add relays from hints to augment the relay set
    if (relayHints) {
        for (const hints of relayHints.values()) {
            for (const url of hints) {
                const relay = pool.getRelay(url, true, true);
                if (relay) set.add(relay);
            }
        }
    }

    const relayLists = new Map<Hexpubkey, NDKRelayList>();
    const fromContactList = new Map<Hexpubkey, NDKEvent>();

    const relaySet = new NDKRelaySet(set, ndk);

    // get all kind 10002 events from cache if we have an adapter and is locking
    if (ndk.cacheAdapter?.locking && !skipCache) {
        const cachedList = await ndk.fetchEvents(
            { kinds: [3, 10002], authors: Array.from(new Set(pubkeys)) },
            { cacheUsage: NDKSubscriptionCacheUsage.ONLY_CACHE, subId: "ndk-relay-list-fetch" },
        );

        // get list of relay lists from cache
        for (const relayList of cachedList) {
            if (relayList.kind === 10002) relayLists.set(relayList.pubkey, NDKRelayList.from(relayList));
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
        pubkeys = pubkeys.filter((pubkey) => !relayLists.has(pubkey) && !fromContactList.has(pubkey));
    }

    // if we have no pubkeys left, return the results
    if (pubkeys.length === 0) return relayLists;

    const relayListEvents = new Map<Hexpubkey, NDKEvent>();
    const contactListEvents = new Map<Hexpubkey, NDKEvent>();

    return new Promise<Map<Hexpubkey, NDKRelayList>>((resolve) => {
        let resolved = false;

        const handleSubscription = async () => {
            // Get from relays the missing pubkeys
            // Prepare options, including the relaySet if available
            const subscribeOpts: NDKSubscriptionOptions = {
                closeOnEose: true,
                pool,
                groupable: true,
                subId: "ndk-relay-list-fetch",
                addSinceFromCache: true,
                relaySet,
            };
            if (relaySet) subscribeOpts.relaySet = relaySet;

            const sub = ndk.subscribe({ kinds: [3, 10002], authors: pubkeys }, subscribeOpts, {
                onEvent: (event) => {
                    if (event.kind === NDKKind.RelayList) {
                        const existingEvent = relayListEvents.get(event.pubkey);
                        if (existingEvent && existingEvent.created_at! > event.created_at!) return;
                        relayListEvents.set(event.pubkey, event);
                    } else if (event.kind === NDKKind.Contacts) {
                        const existingEvent = contactListEvents.get(event.pubkey);
                        if (existingEvent && existingEvent.created_at! > event.created_at!) return;
                        contactListEvents.set(event.pubkey, event);
                    }
                },
                onEose: () => {
                    if (resolved) return;
                    resolved = true;

                    ndk.debug(
                        `[getRelayListForUsers] EOSE - relayListEvents: ${relayListEvents.size}, contactListEvents: ${contactListEvents.size}`,
                    );
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

                    ndk.debug(
                        `[getRelayListForUsers] Returning ${relayLists.size} relay lists for ${pubkeys.length} pubkeys`,
                    );
                    resolve(relayLists);
                },
            });

            // Check if any relays are still connecting or disconnected
            const hasDisconnectedRelays = Array.from(set).some(
                (relay) => relay.status <= 2, // DISCONNECTING, DISCONNECTED, or RECONNECTING
            );
            const hasConnectingRelays = Array.from(set).some(
                (relay) => relay.status === 4, // CONNECTING
            );

            // Use a longer timeout if relays are still connecting or disconnected
            // Otherwise use the provided timeout (EOSE should resolve it)
            let effectiveTimeout = timeout;
            if (hasDisconnectedRelays || hasConnectingRelays) {
                effectiveTimeout = timeout + 3000; // Give 3 extra seconds for connection + response
            }

            ndk.debug(
                `[getRelayListForUsers] Setting fallback timeout to ${effectiveTimeout}ms (disconnected: ${hasDisconnectedRelays}, connecting: ${hasConnectingRelays})`,
                { pubkeys },
            );

            setTimeout(() => {
                if (!resolved) {
                    resolved = true;
                    ndk.debug(`[getRelayListForUsers] Timeout reached, returning ${relayLists.size} relay lists`);
                    resolve(relayLists);
                }
            }, effectiveTimeout);
        };

        handleSubscription();
    });
}
