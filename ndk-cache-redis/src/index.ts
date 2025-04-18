import type { NDKCacheAdapter, NDKFilter, NostrEvent, ProfilePointer } from "@nostr-dev-kit/ndk";
import { NDKRelay } from "@nostr-dev-kit/ndk";
import { NDKEvent, type NDKSubscription } from "@nostr-dev-kit/ndk";
import _debug from "debug";
import Redis from "ioredis";
import { matchFilter } from "nostr-tools";

type NostrEventWithRelay = NostrEvent & { relay?: string };
interface RedisAdapterOptions {
    debug?: debug.IDebugger;
    expirationTime?: number;
    path?: string;
}

export default class RedisAdapter implements NDKCacheAdapter {
    public redis: Redis;
    public debug;
    private expirationTime;
    readonly locking;

    constructor(opts: RedisAdapterOptions = {}) {
        this.redis = opts.path ? new Redis(opts.path) : new Redis();
        this.debug = opts.debug || _debug("ndk:redis-adapter");
        this.redis.on("error", (err: Error) => {
            this.debug("redis error", err);
        });
        this.locking = true;
        this.expirationTime = opts.expirationTime || 3600;
    }

    public async query(subscription: NDKSubscription): Promise<NDKEvent[]> {
        this.debug("query redis status", this.redis.status);
        if (this.redis.status !== "connect") return [];
        
        const events: NDKEvent[] = [];
        for (const filter of subscription.filters) {
            await this.processFilter(filter, subscription, events);
        }
        return events;
    }

    private async processFilter(filter: NDKFilter, subscription: NDKSubscription, events: NDKEvent[]): Promise<void> {
        const filterString = JSON.stringify(filter);

        const eventIds = await this.redis.smembers(filterString);
        if (!eventIds?.length) return;

        for (const eventId of eventIds) {
            const event = await this.redis.get(eventId);
            if (!event) continue;

            const parsedEvent = JSON.parse(event);

            const ndkEvent = new NDKEvent(subscription.ndk, parsedEvent);
            subscription.eventReceived(ndkEvent, undefined, true);
            events.push(ndkEvent);
        }
    }

    private async storeEvent(event: NostrEventWithRelay, relay: NDKRelay) {
        event.relay = relay.url;
        try {
            const eventStr = JSON.stringify(event);
            await this.redis.set(event.id!, eventStr);
            await this.redis.expire(event.id!, this.expirationTime);
        } catch (err) {
            this.debug("Error storing event", err);
        }
    }

    private async storeEventWithFilter(event: NostrEvent, filter: NDKFilter, relay: NDKRelay): Promise<void> {
        const filterString = JSON.stringify(filter);

        await this.redis.sadd(filterString, event.id!);
        await this.redis.expire(filterString, this.expirationTime);

        const exists = await this.redis.exists(event.id!);

        if (!exists) {
            await this.storeEvent(event, relay);
        } else {
            await this.redis.expire(event.id!, this.expirationTime);
        }
    }

    public shouldSkipFilter(filter: NDKFilter): boolean {
        const values = Object.values(filter);

        if (values.some((v) => Array.isArray(v) && v.length > 10)) {
            this.debug("skipping filter", filter);
            return true;
        }

        if (values && values.length > 3) return true;

        if (filter.since || filter.until) return true;

        return false;
    }

    public async setEvent(event: NDKEvent, filters: NDKFilter[], relay: NDKRelay): Promise<void> {
        this.debug("setEvent redis status", this.redis.status);
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
                }
            }
        }
    }

    public async loadNip05?(nip05: string, maxAgeForMissing?: number): Promise<ProfilePointer | null | "missing"> {
        this.debug("loadNip05 redis status", this.redis.status);
        if (this.redis.status !== "connect") return null;
        const profile = await this.redis.get(this.nip05Key(nip05));
        return profile ? JSON.parse(profile) : null;
    }

    public async saveNip05?(nip05: string, profile: ProfilePointer | null): Promise<void> {
        this.debug("saveNip05 redis status", this.redis.status);
        if (this.redis.status !== "connect") return;
        try {
            const profileStr = JSON.stringify(profile);
            await this.redis.set(this.nip05Key(nip05), profileStr);
            await this.redis.expire(this.nip05Key(nip05), this.expirationTime);
        } catch (err) {
            this.debug("Error saving nip05", err);
        }
    }

    private nip05Key(nip05: string): string {
        return `nip05:${nip05}`;
    }
}
