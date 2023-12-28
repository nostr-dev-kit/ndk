import { NDKCacheAdapter, NDKFilter, NDKRelay, NostrEvent, ProfilePointer } from "@nostr-dev-kit/ndk";
import { NDKEvent, type NDKSubscription } from "@nostr-dev-kit/ndk";
import _debug from "debug";
import Redis from "ioredis";
import { matchFilter } from "nostr-tools";

type NostrEventWithRelay = NostrEvent & { relay?: string };
interface RedisAdapterOptions {
    /**
     * Debug instance to use for logging.
     */
    debug?: debug.IDebugger;

    /**
     * The number of seconds to store events in redis before they expire.
     */
    expirationTime?: number;
    /**
    * Redis instance connection path
    */
    path?: string
}

export default class RedisAdapter implements NDKCacheAdapter {
    public redis;
    public debug;
    private expirationTime;
    readonly locking;

    constructor(opts: RedisAdapterOptions = {}) {
        this.redis = opts.path ? new Redis(opts.path) : new Redis();
        this.debug = opts.debug || _debug("ndk:redis-adapter");
        this.redis.on("error", (err) => {
            this.debug("redis error", err);
        });
        this.locking = true;
        this.expirationTime = opts.expirationTime || 3600;
    }

    public async query(subscription: NDKSubscription): Promise<void> {
        this.debug('query redis status', this.redis.status);
	if (this.redis.status !== "connect") return;
        await Promise.all(
            subscription.filters.map((filter) => this.processFilter(filter, subscription))
        );
    }

    private async processFilter(filter: NDKFilter, subscription: NDKSubscription): Promise<void> {
        const filterString = JSON.stringify(filter);

        const eventIds = await this.redis.smembers(filterString);

        return new Promise((resolve) => {
            Promise.all(eventIds.map(async (eventId) => {
                const event = await this.redis.get(eventId);
                if (!event) return;

                const parsedEvent = JSON.parse(event);
                const relayUrl = parsedEvent.relay;
                delete parsedEvent.relay;
                const relay = subscription.ndk.pool.getRelay(relayUrl, false) || new NDKRelay(relayUrl);

                subscription.eventReceived(new NDKEvent(subscription.ndk, parsedEvent), relay, true);
            })).then(() => {
                resolve();
            });
        });
    }

    private storeEvent(event: NostrEventWithRelay, relay: NDKRelay) {
        event.relay = relay.url;
        return this.redis.set(event.id!, JSON.stringify(event), "EX", this.expirationTime);
    }

    private async storeEventWithFilter(event: NostrEvent, filter: NDKFilter, relay: NDKRelay): Promise<void> {
        const filterString = JSON.stringify(filter);

        // very naive quick implementation of storing the filter
        this.redis.sadd(filterString, event.id!);
        this.redis.expire(filterString, this.expirationTime);

        // store the event if it doesn't already exist
        const exists = await this.redis.exists(event.id!);

        if (!exists) {
            await this.storeEvent(event, relay);
        } else {
            // renew the expiration time
            this.redis.expire(event.id!, this.expirationTime);
        }
    }

    public shouldSkipFilter(filter: NDKFilter): boolean {
        const values = Object.values(filter);

        // if it has too many things tagged in an array
        if (values.some((v) => Array.isArray(v) && v.length > 10)) {
            this.debug("skipping filter", filter);
            return true;
        }

        // if it has too many queries
        if (values && values.length > 3) return true;

        // if it uses since or until
        if (filter.since || filter.until) return true;

        return false;
    }


    public async setEvent(event: NDKEvent, filters: NDKFilter[], relay: NDKRelay): Promise<void> {
        this.debug('setEvent redis status', this.redis.status);
	if (this.redis.status !== "connect") return;
        const rawEvent = event.rawEvent();

        if (filters.length === 1) {
            if (this.shouldSkipFilter(filters[0])) return;

            await this.storeEventWithFilter(rawEvent, filters[0], relay);
        } else if (filters.length > 1) {
            for (const filter of filters) {
                if (this.shouldSkipFilter(filter)) continue;

                if (matchFilter(filter, rawEvent as any)) {
                    await this.storeEventWithFilter(rawEvent, filter, relay);
                    continue;
                }
            }
        }
    }

    public async loadNip05?(nip05: string): Promise<ProfilePointer | null> {
        this.debug('loadNip05 redis status', this.redis.status);
	if (this.redis.status !== "connect") return null;
        const profile = await this.redis.get(this.nip05Key(nip05));
        return profile ? JSON.parse(profile) : null;
    }

    public saveNip05?(nip05: string, profile: ProfilePointer): void {
        this.debug('saveNip05 redis status', this.redis.status);
	if (this.redis.status !== "connect") return;
        this.redis.set(
            this.nip05Key(nip05),
            JSON.stringify(profile),
            "EX",
            this.expirationTime,
        );
    }

    private nip05Key(nip05: string): string {
        return `nip05:${nip05}`;
    }
}
