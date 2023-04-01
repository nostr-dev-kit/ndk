import {NDKSubscription} from '../subscription/';
import NDKEvent from '../events/';

export interface NDKCacheAdapter {
    query(subscription: NDKSubscription): void;
    setEvent(event: NDKEvent): Promise<void>;
}