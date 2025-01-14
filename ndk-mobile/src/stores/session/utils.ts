import { NDKUser, NDKFilter, NDKKind, NDKEvent } from '@nostr-dev-kit/ndk';
import { SessionInitOpts } from './types.js';

export const generateFilters = (user: NDKUser, opts: SessionInitOpts): NDKFilter[] => {
    let filters: NDKFilter[] = [];
    filters.push({ kinds: [], authors: [user.pubkey] });

    if (opts.follows) filters[0].kinds!.push(3);
    if (opts.muteList) filters[0].kinds!.push(NDKKind.MuteList);
    if (opts.kinds) filters[0].kinds!.push(...opts.kinds.keys());
    if (opts.filters) filters.push(
        ...opts.filters(user)
    );

    return filters;
};

/**
 * Checks whether the first event is newer than the second event.
 * @returns 
 */
export const firstIsNewer = (first: NDKEvent, second: NDKEvent): boolean => {
    return first && second && first.created_at >= second.created_at;
}; 