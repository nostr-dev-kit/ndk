import EventEmitter from "eventemitter3";
import { NDKRelayUrl } from "../relay/index.js";
import { Hexpubkey, NDKUser } from "../user/index.js";
import { LRUCache } from "typescript-lru-cache";
import { NDK } from "../ndk/index.js";
import { NDKRelayList } from "../events/kinds/NDKRelayList.js";

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
    public relayUrlScores: Map<NDKRelayUrl, number>;

    public readRelays: Set<NDKRelayUrl>;
    public writeRelays: Set<NDKRelayUrl>;

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

    constructor(ndk: NDK) {
        super();

        this.ndk = ndk;

        this.data = new LRUCache({
            maxSize: 5,
            entryExpirationTimeInMS: 5000,
        });
    }

    public trackUsers(items: NDKUser[] | Hexpubkey[]) {
        items.forEach((item) => {
            if (this.data.has(getKeyFromItem(item))) return;

            const outboxItem = this.track(item, "user");

            const user = item instanceof NDKUser ? item : new NDKUser({ hexpubkey: item });
            user.ndk = this.ndk;

            user.relayList().then((relayList: NDKRelayList | undefined) => {
                if (relayList) {
                    outboxItem.readRelays = new Set(relayList.readRelayUrls);
                    outboxItem.writeRelays = new Set(relayList.writeRelayUrls);

                    this.ndk.debug(`OutboxTracker: ${user.hexpubkey} has ${relayList.readRelayUrls.length} read relays and ${relayList.writeRelayUrls.length} write relays`);
                } else {
                    this.ndk.debug(`OutboxTracker: ${user.hexpubkey} has no relays`);
                }
            });
        });
    }

    /**
     *
     * @param key
     * @param score
     */
    public track(
        item: NDKUser | Hexpubkey,
        type?: OutboxItemType,
    ): OutboxItem {
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
        return item.hexpubkey;
    } else {
        return item;
    }
}

function getTypeFromItem(
    item: NDKUser | Hexpubkey,
): OutboxItemType {
    if (item instanceof NDKUser) {
        return "user";
    } else {
        return "kind";
    }
}