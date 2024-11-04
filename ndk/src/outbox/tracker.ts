import { EventEmitter } from "tseep";
import { LRUCache } from "typescript-lru-cache";

import type { NDKRelayList } from "../events/kinds/NDKRelayList.js";
import { getRelayListForUsers } from "../utils/get-users-relay-list.js";
import type { NDK } from "../ndk/index.js";
import type { Hexpubkey } from "../user/index.js";
import { NDKUser } from "../user/index.js";
import { normalize } from "../utils/normalize-url.js";

export type OutboxItemType = "user" | "kind";

/**
 * Tracks outbox scoring of an item. An item can be any of:
 *
 *  -  A user
 *  -  A tag
 */
export class OutboxItem {
    /**
     * Type of item
     */
    public type: OutboxItemType;

    /**
     * The relay URLs that are of interest to this item
     */
    public relayUrlScores: Map<WebSocket["url"], number>;

    public readRelays: Set<WebSocket["url"]>;
    public writeRelays: Set<WebSocket["url"]>;

    constructor(type: OutboxItemType) {
        this.type = type;
        this.relayUrlScores = new Map();
        this.readRelays = new Set();
        this.writeRelays = new Set();
    }
}

/**
 * The responsibility of this class is to track relay:outbox-item associations
 * so that we can intelligently choose which relays to query for which items.
 *
 * A single instance of this class should be shared across all subscriptions within
 * an NDK instance.
 *
 * TODO: The state of this tracker needs to be added to cache adapters so that we
 * can rehydrate-it when a cache is present.
 */
export class OutboxTracker extends EventEmitter {
    public data: LRUCache<Hexpubkey, OutboxItem>;
    private ndk: NDK;
    private debug: debug.Debugger;

    constructor(ndk: NDK) {
        super();

        this.ndk = ndk;
        this.debug = ndk.debug.extend("outbox-tracker");

        this.data = new LRUCache({
            maxSize: 100000,
            entryExpirationTimeInMS: 2 * 60 * 1000,
        });
    }

    /**
     * Adds a list of users to the tracker.
     * @param items
     * @param skipCache
     */
    async trackUsers(items: NDKUser[] | Hexpubkey[], skipCache = false) {
        const promises: Promise<void>[] = [];

        for (let i = 0; i < items.length; i += 400) {
            const slice = items.slice(i, i + 400);
            const pubkeys = slice
                .map((item) => getKeyFromItem(item))
                .filter((pubkey) => !this.data.has(pubkey)); // filter out items that are already being tracked

            // if all items are already being tracked, skip
            if (pubkeys.length === 0) continue;

            // put a placeholder for all items
            for (const pubkey of pubkeys) {
                this.data.set(pubkey, new OutboxItem("user"));
            }

            promises.push(
                new Promise((resolve) => {
                    getRelayListForUsers(pubkeys, this.ndk, skipCache)
                        .then((relayLists: Map<Hexpubkey, NDKRelayList>) => {
                            for (const [pubkey, relayList] of relayLists) {
                                let outboxItem = this.data.get(pubkey)!;
                                outboxItem ??= new OutboxItem("user");

                                if (relayList) {
                                    outboxItem.readRelays = new Set(
                                        normalize(relayList.readRelayUrls)
                                    );
                                    outboxItem.writeRelays = new Set(
                                        normalize(relayList.writeRelayUrls)
                                    );

                                    // remove all blacklisted relays
                                    for (const relayUrl of outboxItem.readRelays) {
                                        if (this.ndk.pool.blacklistRelayUrls.has(relayUrl)) {
                                            // this.debug(
                                            //     `removing blacklisted relay ${relayUrl} from read relays`
                                            // );
                                            outboxItem.readRelays.delete(relayUrl);
                                        }
                                    }

                                    // remove all blacklisted relays
                                    for (const relayUrl of outboxItem.writeRelays) {
                                        if (this.ndk.pool.blacklistRelayUrls.has(relayUrl)) {
                                            // this.debug(
                                            //     `removing blacklisted relay ${relayUrl} from write relays`
                                            // );
                                            outboxItem.writeRelays.delete(relayUrl);
                                        }
                                    }

                                    this.data.set(pubkey, outboxItem);

                                    // this.debug(
                                    //     `Adding ${outboxItem.readRelays.size} read relays and ${outboxItem.writeRelays.size} write relays for ${pubkey}, %o`, relayList?.rawEvent()
                                    // );
                                }
                            }
                        })
                        .finally(resolve);
                })
            );
        }

        return Promise.all(promises);
    }

    /**
     *
     * @param key
     * @param score
     */
    public track(item: NDKUser | Hexpubkey, type?: OutboxItemType, skipCache = true): OutboxItem {
        const key = getKeyFromItem(item);
        type ??= getTypeFromItem(item);
        let outboxItem = this.data.get(key);

        if (!outboxItem) {
            outboxItem = new OutboxItem(type);
            if (item instanceof NDKUser) {
                this.trackUsers([item as NDKUser]);
            }
        }

        return outboxItem;
    }
}

function getKeyFromItem(item: NDKUser | Hexpubkey): Hexpubkey {
    if (item instanceof NDKUser) {
        return item.pubkey;
    } else {
        return item;
    }
}

function getTypeFromItem(item: NDKUser | Hexpubkey): OutboxItemType {
    if (item instanceof NDKUser) {
        return "user";
    } else {
        return "kind";
    }
}
