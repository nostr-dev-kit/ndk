import NDK, { NDKUser, NDKFilter, NDKKind, NDKEvent } from '@nostr-dev-kit/ndk';
import { FollowOpts, SessionInitOpts } from './types.js';
import { NDKCacheAdapterSqlite } from '../../cache-adapter/sqlite.js';

/**
 * Generates the filters to receive the events that are required to
 * start the session as specified by the app.
 */
export const generateFilters = (ndk: NDK, user: NDKUser, opts: SessionInitOpts): NDKFilter[] => {
    let filters: NDKFilter[] = [];
    filters.push({ kinds: [], authors: [user.pubkey] });

    const followFilter = getFollowFilter(ndk, opts.follows, user);
    if (followFilter) filters.push(...followFilter);

    if (opts.muteList) filters[0].kinds!.push(NDKKind.MuteList);
    if (opts.kinds) filters[0].kinds!.push(...opts.kinds.keys());
    if (opts.filters) filters.push(
        ...opts.filters(user)
    );

    return filters;
};

/**
 * Checks whether the first event is newer than the second event.
 */
export const firstIsNewer = (first: NDKEvent, second: NDKEvent): boolean => {
    return first && second && first.created_at >= second.created_at;
}; 

/**
 * Generates a filter to update the follow list.
 * 
 * It uses the most recent event in our cache to determine from when to start syncing.
 * @param follows 
 * @param user 
 * @returns 
 */
const getFollowFilter = (
    ndk: NDK,
    follows: boolean | FollowOpts,
    user: NDKUser,
): NDKFilter[] | undefined => {
    if (!follows) return undefined;

    const filters: NDKFilter[] = [];
    const lastKnownEvent = getLatestKnownEvent(ndk, [NDKKind.Contacts, 967 as NDKKind], user);
    
    const lastKnownFilter = lastKnownEvent ? { since: lastKnownEvent+1 } : {};

    filters.push({ kinds: [3], authors: [user.pubkey], ...lastKnownFilter });

    if (typeof follows === 'object') {
        filters.push({
            kinds: [967 as NDKKind],
            "#k": follows.kinds.map(kind => kind.toString()),
            authors: [user.pubkey],
            ...lastKnownFilter
        });
    }

    return filters;
};

/**
 * Get the most recent known event for a given kind, optionally belonging to a specific user.
 * @param ndk 
 * @param user 
 * @param kind 
 * @returns 
 */
const getLatestKnownEvent = (ndk: NDK, kinds: NDKKind[], user?: NDKUser): number | undefined => {
    const cacheAdapter = ndk.cacheAdapter;
    if (!(cacheAdapter instanceof NDKCacheAdapterSqlite)) {
        return undefined;
    }

    const kindPlaceholders = kinds.map(() => '?').join(',');
    const params: any[] = [...kinds];

    let query = `SELECT created_at FROM events WHERE kind IN (${kindPlaceholders})`;

    if (user) {
        // Add placeholder for pubkey
        query += ' AND pubkey = ?';
        params.push(user.pubkey);
    }

    query += ' ORDER BY created_at DESC';
    query += ' LIMIT 1';

    try {
        const event = cacheAdapter.db.getFirstSync(query, params) as { created_at: number };
        return event?.created_at;
    } catch (error) {
        console.error('Error getting latest known event', error);
    }

    return undefined;
}