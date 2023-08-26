import { NDKCacheAdapter, NDKFilter } from '@nostr-dev-kit/ndk';
import { NDKSubscription, NDKEvent } from '@nostr-dev-kit/ndk';
import Redis from 'ioredis';
import _debug from 'debug';

interface RedisAdapterOptions {
    /**
     * Debug instance to use for logging.
     */
    debug?: debug.IDebugger;

    /**
     * The number of seconds to store events in redis before they expire.
     */
    expirationTime?: number;
}

export default class RedisAdapter implements NDKCacheAdapter {
    public redis;
    public debug;
    private expirationTime;
    readonly locking;

    constructor(opts: RedisAdapterOptions = {}) {
        this.redis = new Redis();
        this.debug = opts.debug || _debug('ndk:redis-adapter');
        this.locking = true;
        this.expirationTime = opts.expirationTime || 3600;
    }

    public async query(subscription: NDKSubscription): Promise<void> {
        const { filter } = subscription;

        this.debug('query', filter);

        // if this filter uses both authors and kinds, then we need to query for each combination of author and kind
        // and then combine the results
        if (filter.authors && filter.kinds) {
            const promises = [];

            for (const author of filter.authors) {
                for (const kind of filter.kinds) {
                    const key = `${author}:${kind}`;
                    promises.push(this.redis.hgetall(key));
                }
            }

            const results = await Promise.all(promises);

            for (const result of results) {
                if (result && result.event) {
                    const event = await this.redis.get(result.event);

                    if (event) {
                        const ndkEvent = new NDKEvent(subscription.ndk, JSON.parse(event));
                        this.debug('hit', ndkEvent.id);
                        subscription.eventReceived(ndkEvent, undefined, true);
                    }
                }
            }
        }
    }

    public async setEvent(event: NDKEvent, filter: NDKFilter): Promise<void> {
        const nostrEvent = await event.toNostrEvent();
        const key = `${nostrEvent.pubkey}:${nostrEvent.kind}`;

        this.debug('setEvent', {nostrEvent, key});

        return new Promise((resolve) => {
            // store in redis the event with an expiration of 1 minute
            // and store the filter that was used to find the event on an hset where the key is the filter and the value is the event id
            // run both at the same time and resolve when both complete
            Promise.all([
                this.redis.set(event.id, JSON.stringify(nostrEvent), 'EX', this.expirationTime),
                this.redis.hset(key, 'event', event.id),
                this.redis.expire(key, this.expirationTime),
            ]).then(() => resolve());
        });
    }
}