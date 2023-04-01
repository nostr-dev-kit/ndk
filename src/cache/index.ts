import {NDKFilter} from '../subscription/';
import NDKEvent from '../events/';

export interface NDKCacheAdapter {
    getEvents(filter: NDKFilter): Promise<Set<NDKEvent>>;
}