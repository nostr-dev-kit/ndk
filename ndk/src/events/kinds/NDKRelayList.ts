import { NDKKind } from ".";
import type { NostrEvent } from "..";
import { NDKEvent } from "../index.js";
import type { NDK } from "../../ndk";
import type { NDKRelay } from "../../relay";
import type { Hexpubkey } from "../../user";
import { NDKRelaySet } from "../../relay/sets";
import { normalizeRelayUrl } from "../../utils/normalize-url";
import { NDKSubscriptionCacheUsage } from "../../subscription";

const READ_MARKER = "read";
const WRITE_MARKER = "write";

export class NDKRelayList extends NDKEvent {
    constructor(ndk?: NDK, rawEvent?: NostrEvent) {
        super(ndk, rawEvent);
        this.kind ??= NDKKind.RelayList;
    }

    static from(ndkEvent: NDKEvent): NDKRelayList {
        return new NDKRelayList(ndkEvent.ndk, ndkEvent.rawEvent());
    }

    static async forUser(pubkey: Hexpubkey, ndk: NDK): Promise<NDKRelayList | undefined> {
        // call forUsers with a single pubkey
        const result = await this.forUsers([pubkey], ndk);
        return result.get(pubkey);
    }

    /**
     * Gathers a set of relay list events for a given set of users.
     * @returns A map of pubkeys to relay list.
     */
    static async forUsers(pubkeys: Hexpubkey[], ndk: NDK): Promise<Map<Hexpubkey, NDKRelayList>> {
        const pool = ndk.outboxPool || ndk.pool;
        const set = new Set<NDKRelay>();

        for (const relay of pool.relays.values()) set.add(relay);

        const relayLists = new Map<Hexpubkey, NDKRelayList>();
        const fromContactList = new Map<Hexpubkey, NDKEvent>();

        const relaySet = new NDKRelaySet(set, ndk);

        // get all kind 10002 events from cache if we have an adapter and is locking
        if (ndk.cacheAdapter?.locking) {
            const cachedList = await ndk.fetchEvents(
                { kinds: [3, 10002], authors: pubkeys },
                { cacheUsage: NDKSubscriptionCacheUsage.ONLY_CACHE },
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
                { closeOnEose: true, pool, groupable: true, cacheUsage: NDKSubscriptionCacheUsage.ONLY_RELAY, subId: 'ndk-relay-list-fetch' },
                relaySet, false
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

    get readRelayUrls(): WebSocket["url"][] {
        return this.tags
            .filter((tag) => tag[0] === "r" || tag[0] === "relay")
            .filter((tag) => !tag[2] || (tag[2] && tag[2] === READ_MARKER))
            .map((tag) => tag[1]);
    }

    set readRelayUrls(relays: WebSocket["url"][]) {
        for (const relay of relays) {
            this.tags.push(["r", relay, READ_MARKER]);
        }
    }

    get writeRelayUrls(): WebSocket["url"][] {
        return this.tags
            .filter((tag) => tag[0] === "r" || tag[0] === "relay")
            .filter((tag) => !tag[2] || (tag[2] && tag[2] === WRITE_MARKER))
            .map((tag) => tag[1]);
    }

    set writeRelayUrls(relays: WebSocket["url"][]) {
        for (const relay of relays) {
            this.tags.push(["r", relay, WRITE_MARKER]);
        }
    }

    get bothRelayUrls(): WebSocket["url"][] {
        return this.tags
            .filter((tag) => tag[0] === "r" || tag[0] === "relay")
            .filter((tag) => !tag[2])
            .map((tag) => tag[1]);
    }
    set bothRelayUrls(relays: WebSocket["url"][]) {
        for (const relay of relays) {
            this.tags.push(["r", relay]);
        }
    }

    get relays(): WebSocket["url"][] {
        return this.tags.filter((tag) => tag[0] === "r" || tag[0] === "relay").map((tag) => tag[1]);
    }

    /**
     * Provides a relaySet for the relays in this list.
     */
    get relaySet(): NDKRelaySet {
        if (!this.ndk) throw new Error("NDKRelayList has no NDK instance");

        return new NDKRelaySet(
            new Set(this.relays.map((u) => this.ndk!.pool.getRelay(u))),
            this.ndk
        );
    }
}

function relayListFromKind3(ndk: NDK, contactList: NDKEvent): NDKRelayList | undefined {
    try {
        const content = JSON.parse(contactList.content);
        const relayList = new NDKRelayList(ndk);
        const readRelays = new Set<string>();
        const writeRelays = new Set<string>();

        for (let [key, config] of Object.entries(content)) {
            try {
                key = normalizeRelayUrl(key);
            } catch {
                continue;
            }

            if (!config) {
                readRelays.add(key);
                writeRelays.add(key);
            } else {
                const relayConfig: { read?: boolean; write?: boolean } = config;
                if (relayConfig.write) writeRelays.add(key);
                if (relayConfig.read) readRelays.add(key);
            }
        }

        relayList.readRelayUrls = Array.from(readRelays);
        relayList.writeRelayUrls = Array.from(writeRelays);

        return relayList;
    } catch {
        /* */
    }

    return undefined;
}
