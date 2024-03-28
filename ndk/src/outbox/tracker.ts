import { EventEmitter } from "tseep";
import { LRUCache } from "typescript-lru-cache";

import { NDKRelayList } from "../events/kinds/NDKRelayList.js";
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
 * can rehydrae-it when a cache is present.
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
            entryExpirationTimeInMS: 5000,
        });
    }

    public trackUsers(items: NDKUser[] | Hexpubkey[]) {
        for (let i = 0; i < items.length; i += 400) {
            const slice = items.slice(i, i + 400);
            let pubkeys = slice.map((item) => getKeyFromItem(item));

            // filter out items that are already being tracked
            pubkeys = pubkeys.filter((pubkey) => !this.data.has(pubkey));

            // if all items are already being tracked, skip
            if (pubkeys.length === 0) continue;

            const outboxItems = new Map<Hexpubkey, OutboxItem>();

            for (const pubkey of pubkeys) {
                outboxItems.set(pubkey, this.track(pubkey, "user"));
            }

            NDKRelayList.forUsers(pubkeys, this.ndk).then(
                (relayLists: Map<Hexpubkey, NDKRelayList>) => {
                    for (const [pubkey, relayList] of relayLists) {
                        const outboxItem = outboxItems.get(pubkey)!;

                        const user = new NDKUser({ pubkey: pubkey });
                        user.ndk = this.ndk;

                        if (relayList) {
                            outboxItem.readRelays = new Set(normalize(relayList.readRelayUrls));
                            outboxItem.writeRelays = new Set(normalize(relayList.writeRelayUrls));

                            // remove all blacklisted relays
                            for (const relayUrl of outboxItem.readRelays) {
                                if (this.ndk.pool.blacklistRelayUrls.has(relayUrl)) {
                                    this.debug(
                                        `removing blacklisted relay ${relayUrl} from read relays`
                                    );
                                    outboxItem.readRelays.delete(relayUrl);
                                }
                            }

                            // remove all blacklisted relays
                            for (const relayUrl of outboxItem.writeRelays) {
                                if (this.ndk.pool.blacklistRelayUrls.has(relayUrl)) {
                                    this.debug(
                                        `removing blacklisted relay ${relayUrl} from write relays`
                                    );
                                    outboxItem.writeRelays.delete(relayUrl);
                                }
                            }

                            this.data.set(pubkey, outboxItem);

                            // this.debug(
                            //     `Adding ${outboxItem.readRelays.size} read relays and ${outboxItem.writeRelays.size} write relays for ${user.pubkey}`
                            // );
                        }
                    }
                }
            );
        }
    }

    /**
     *
     * @param key
     * @param score
     */
    public track(item: NDKUser | Hexpubkey, type?: OutboxItemType): OutboxItem {
        const key = getKeyFromItem(item);
        type ??= getTypeFromItem(item);
        let outboxItem = this.data.get(key);

        if (!outboxItem) outboxItem = new OutboxItem(type);

        this.data.set(key, outboxItem);

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
