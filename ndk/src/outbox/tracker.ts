import EventEmitter from "eventemitter3";
import { RelayUrl } from "../relay/index.js";
import { Hexpubkey, NDKUser } from "../user/index.js";
import { LRUCache } from "typescript-lru-cache";

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
    public relayUrlScores: Map<RelayUrl, number>;

    public lastTimeQueried: number | undefined;

    constructor(type: OutboxItemType) {
        this.type = type;
        this.relayUrlScores = new Map();
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

    constructor() {
        super();

        this.data = new LRUCache({
            maxSize: 5,
            entryExpirationTimeInMS: 5000,
            onEntryMarkedAsMostRecentlyUsed: ({key}) => {
                console.log("entry marked as most recently used", key);
            },
        });
    }

    public trackUsers(items: NDKUser[] | Hexpubkey[]) {
        items.forEach((item) => {
            this.track(item, "user");
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
    ) {
        const key = getKeyFromItem(item);
        type ??= getTypeFromItem(item);
        let outboxItem = this.data.get(key);

        if (!outboxItem) outboxItem = new OutboxItem(type);

        this.data.set(key, outboxItem);
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