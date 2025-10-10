import type { NDKCacheAdapter, NDKFilter, NostrEvent, ProfilePointer } from "@nostr-dev-kit/ndk";
import { NDKEvent, type NDKRelay, type NDKSubscription } from "@nostr-dev-kit/ndk";
import _debug from "debug";
import Redis from "ioredis";
import { matchFilter } from "nostr-tools";

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
        if (this.redis.status !== "ready") return [];

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

            const parsedEvent = JSON.parse(event) as NostrEvent;

            const ndkEvent = new NDKEvent(subscription.ndk, parsedEvent);

            // Restore all relays this event was seen on
            const relayUrls = await this.redis.smembers(this.relaySetKey(eventId));
            if (relayUrls?.length) {
                // Set the first relay as the primary relay
                const firstRelayUrl = relayUrls[0];
                const firstRelay = subscription.pool.getRelay(firstRelayUrl, false);
                if (firstRelay) {
                    ndkEvent.relay = firstRelay;
                }

                // Register all relays in seenEvents for onRelays getter
                for (const relayUrl of relayUrls) {
                    const relay = subscription.pool.getRelay(relayUrl, false);
                    if (relay) {
                        subscription.ndk?.subManager.seenEvent(ndkEvent.id, relay);
                    }
                }

                subscription.eventReceived(ndkEvent, firstRelay, true);
            } else {
                subscription.eventReceived(ndkEvent, undefined, true);
            }

            events.push(ndkEvent);
        }
    }

    private async storeEvent(event: NostrEvent, relay: NDKRelay) {
        try {
            // Store the event without relay information
            const eventStr = JSON.stringify(event);
            await this.redis.set(event.id!, eventStr);
            await this.redis.expire(event.id!, this.expirationTime);

            // Store relay information separately in a set
            const relaySetKey = this.relaySetKey(event.id!);
            await this.redis.sadd(relaySetKey, relay.url);
            await this.redis.expire(relaySetKey, this.expirationTime);
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
            // Event exists, just add the relay to the relay set
            await this.redis.expire(event.id!, this.expirationTime);

            // Add relay to the relay set
            const relaySetKey = this.relaySetKey(event.id!);
            await this.redis.sadd(relaySetKey, relay.url);
            await this.redis.expire(relaySetKey, this.expirationTime);
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
        this.debug("setEvent", relay.url);
        if (this.redis.status !== "ready") {
            this.debug("Redis not ready, skipping setEvent");
            return;
        }
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

    /**
     * Handles duplicate events by recording relay provenance.
     * Just adds the relay to the set of relays this event has been seen on.
     */
    public async setEventDup(event: NDKEvent, relay: NDKRelay): Promise<void> {
        if (this.redis.status !== "ready") return;

        const relaySetKey = this.relaySetKey(event.id);
        await this.redis.sadd(relaySetKey, relay.url);
        await this.redis.expire(relaySetKey, this.expirationTime);
    }

    /**
     * Add a relay to the set of relays an event has been seen on.
     * This is useful for tracking relay provenance even for duplicate events.
     */
    public async addEventRelay(eventId: string, relay: NDKRelay): Promise<void> {
        if (this.redis.status !== "ready") return;

        const relaySetKey = this.relaySetKey(eventId);
        await this.redis.sadd(relaySetKey, relay.url);
        await this.redis.expire(relaySetKey, this.expirationTime);
    }

    public async loadNip05?(nip05: string, maxAgeForMissing?: number): Promise<ProfilePointer | null | "missing"> {
        this.debug("loadNip05 redis status", this.redis.status);
        if (this.redis.status !== "ready") return null;
        const profile = await this.redis.get(this.nip05Key(nip05));
        return profile ? JSON.parse(profile) : null;
    }

    public async saveNip05?(nip05: string, profile: ProfilePointer | null): Promise<void> {
        this.debug("saveNip05 redis status", this.redis.status);
        if (this.redis.status !== "ready") return;
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

    private relaySetKey(eventId: string): string {
        return `relays:${eventId}`;
    }
}
