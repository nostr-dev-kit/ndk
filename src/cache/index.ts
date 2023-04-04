import {NDKFilter, NDKSubscription} from '../subscription/index.js';
import NDKEvent from '../events/index.js';

export interface NDKCacheAdapter {
    /**
     * Whether this cache adapter is expected to be fast.
     * If this is true, the cache will be queried before the relays.
     * When this is false, the cache will be queried in addition to the relays.
     */
    locking: boolean;

    query(subscription: NDKSubscription): Promise<void>;
    setEvent(event: NDKEvent, filter: NDKFilter): Promise<void>;
}