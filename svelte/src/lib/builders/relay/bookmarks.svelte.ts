import type { NDKSvelte } from '../../ndk-svelte.svelte.js';
import { resolveNDK } from '../resolve-ndk.svelte.js';
import { NDKRelayFeedList, normalizeRelayUrl } from '@nostr-dev-kit/ndk';
import { SvelteMap, SvelteSet } from 'svelte/reactivity';

/**
 * Relay with bookmark statistics
 */
export interface BookmarkedRelayWithStats {
    /** Normalized relay URL */
    url: string;
    /** Number of authors who have bookmarked this relay */
    count: number;
    /** Pubkeys of authors who have bookmarked this relay */
    pubkeys: string[];
    /** Whether current user has bookmarked this relay (only when includesCurrentUser=true) */
    isBookmarkedByCurrentUser: boolean;
}

/**
 * State returned by createBookmarkedRelayList
 */
export interface BookmarkedRelayListState {
    /** All bookmarked relays with statistics, sorted by usage count */
    readonly relays: BookmarkedRelayWithStats[];
    /** Total number of authors being tracked */
    readonly totalAuthors: number;
    /** Number of kind 10012 events received */
    readonly eventsCount: number;
    /** Whether current user is included in the authors list */
    readonly includesCurrentUser: boolean;
    /** Check if a relay is bookmarked by current user */
    isBookmarked(relayUrl: string): boolean;
    /** Get statistics for a specific relay */
    getRelayStats(relayUrl: string): BookmarkedRelayWithStats | null;
    /** Toggle bookmark for current user (only works if includesCurrentUser=true) */
    toggleBookmark(relayUrl: string): Promise<void>;
}

export interface BookmarkedRelayListConfig {
    authors: string[];
    includeCurrentUser?: boolean;
}

/**
 * Creates a reactive bookmarked relay list tracker
 *
 * Subscribes to kind 10012 (NDKRelayFeedList) events from specified authors
 * and aggregates their bookmarked relays with statistics.
 *
 * By default, includes the current user's pubkey in the authors list,
 * which enables the toggleBookmark() function to add/remove bookmarks.
 *
 * @example
 * ```ts
 * // NDK from context - Track follows' bookmarked relays (reactive)
 * const bookmarks = createBookmarkedRelayList(() => ({
 *   authors: ndk.$follows
 * }));
 *
 * // Or with explicit NDK
 * const bookmarks = createBookmarkedRelayList(() => ({
 *   authors: ndk.$follows
 * }), ndk);
 *
 * console.log(bookmarks.relays); // Array of relays with stats
 * console.log(bookmarks.includesCurrentUser); // true (if logged in)
 * await bookmarks.toggleBookmark('wss://relay.damus.io');
 *
 * // Exclude current user
 * const bookmarksWithoutUser = createBookmarkedRelayList(() => ({
 *   authors: ndk.$follows,
 *   includeCurrentUser: false
 * }));
 *
 * console.log(bookmarksWithoutUser.includesCurrentUser); // false
 * ```
 */
export function createBookmarkedRelayList(
    config: () => BookmarkedRelayListConfig,
    ndk?: NDKSvelte
): BookmarkedRelayListState {
    const resolvedNDK = resolveNDK(ndk);
    // Merge current user into authors list if enabled
    const effectiveAuthors = $derived.by(() => {
        const { authors: authorsList, includeCurrentUser = true } = config();

        if (!includeCurrentUser || !resolvedNDK.$currentPubkey) {
            return authorsList;
        }

        // Add current user if not already in the list
        const authorsSet = new SvelteSet(authorsList);
        if (!authorsSet.has(resolvedNDK.$currentPubkey)) {
            return [...authorsList, resolvedNDK.$currentPubkey];
        }
        return authorsList;
    });

    const includesCurrentUser = $derived(
        config().includeCurrentUser !== false && resolvedNDK.$currentPubkey
            ? effectiveAuthors.includes(resolvedNDK.$currentPubkey)
            : false
    );

    // Subscribe to kind 10012 (NDKRelayFeedList) from all authors
    const subscription = resolvedNDK.$subscribe<NDKRelayFeedList>(() => {
        if (effectiveAuthors.length === 0) return undefined;

        return {
            filters: [{ kinds: [10012], authors: effectiveAuthors }],
            wrap: true,
        };
    });

    // Get current user's relay feed list from subscription events
    const currentUserList = $derived.by(() => {
        if (!includesCurrentUser || !resolvedNDK.$currentPubkey) return null;

        // Find the current user's kind 10012 event in the subscription
        const userEvent = subscription.events.find(
            event => event.pubkey === resolvedNDK.$currentPubkey
        );

        return userEvent as NDKRelayFeedList | null;
    });

    // Aggregate bookmarked relays across all authors
    const aggregatedRelays = $derived.by(() => {
        const totalAuthors = effectiveAuthors.length;
        if (totalAuthors === 0) return [];

        const relayDataMap = new SvelteMap<string, { count: number; pubkeys: SvelteSet<string> }>();

        // Process all kind 10012 events
        for (const event of subscription.events) {
            const relayList = event as NDKRelayFeedList;
            const authorPubkey = event.pubkey;

            if (relayList.relayUrls) {
                for (const url of relayList.relayUrls) {
                    const normalized = normalizeRelayUrl(url);
                    const existing = relayDataMap.get(normalized);

                    if (existing) {
                        existing.count++;
                        existing.pubkeys.add(authorPubkey);
                    } else {
                        relayDataMap.set(normalized, {
                            count: 1,
                            pubkeys: new SvelteSet([authorPubkey])
                        });
                    }
                }
            }
        }

        // Convert to array with current user bookmark status
        return Array.from(relayDataMap.entries())
            .map(([url, data]) => ({
                url,
                count: data.count,
                pubkeys: Array.from(data.pubkeys),
                isBookmarkedByCurrentUser: includesCurrentUser && resolvedNDK.$currentUser?.pubkey
                    ? data.pubkeys.has(resolvedNDK.$currentUser.pubkey)
                    : false
            }))
            .sort((a, b) => b.count - a.count);
    });

    function isBookmarked(relayUrl: string): boolean {
        const normalized = normalizeRelayUrl(relayUrl);
        const relay = aggregatedRelays.find(r => r.url === normalized);
        return relay?.isBookmarkedByCurrentUser ?? false;
    }

    function getRelayStats(relayUrl: string): BookmarkedRelayWithStats | null {
        const normalized = normalizeRelayUrl(relayUrl);
        return aggregatedRelays.find(r => r.url === normalized) ?? null;
    }

    async function toggleBookmark(relayUrl: string): Promise<void> {
        if (!includesCurrentUser || !resolvedNDK.$currentUser) {
            throw new Error('Cannot toggle bookmark: current user not in authors list');
        }

        const normalized = normalizeRelayUrl(relayUrl);

        // Clone the existing list or create a new one
        let list: NDKRelayFeedList;
        if (currentUserList) {
            // Clone the existing event to preserve all existing bookmarks
            list = new NDKRelayFeedList(resolvedNDK);
            list.tags = [...currentUserList.tags];
        } else {
            list = new NDKRelayFeedList(resolvedNDK);
        }

        const isCurrentlyBookmarked = isBookmarked(normalized);

        if (isCurrentlyBookmarked) {
            // Remove bookmark
            list.tags = list.tags.filter(tag =>
                !(tag[0] === 'relay' && normalizeRelayUrl(tag[1]) === normalized)
            );
        } else {
            // Add bookmark
            list.tags.push(['relay', normalized]);
        }

        await list.publish();
    }

    return {
        get relays() { return aggregatedRelays; },
        get totalAuthors() { return effectiveAuthors.length; },
        get eventsCount() { return subscription.events.length; },
        get includesCurrentUser() { return includesCurrentUser; },
        isBookmarked,
        getRelayStats,
        toggleBookmark
    };
}
