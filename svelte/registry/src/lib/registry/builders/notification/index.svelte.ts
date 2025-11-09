import type { NDKEvent } from '@nostr-dev-kit/ndk';
import type { NDKSvelte } from '@nostr-dev-kit/svelte';
import { resolveNDK } from '../resolve-ndk/index.svelte.js';

/**
 * Configuration for notification feed
 */
export interface NotificationFeedConfig {
    /** Pubkey to get notifications for */
    pubkey: string;

    /** Event kinds to track (default: reactions, zaps, reposts, replies, generic replies) */
    kinds?: number[];

    /** Unix timestamp to fetch notifications since */
    since?: number;

    /** How to sort notifications */
    sort?: 'time' | 'count' | 'tag-time' | 'unique-authors';

    /** Maximum number of notification groups to return */
    limit?: number;
}

/**
 * A group of notifications for a single target event
 */
export interface NotificationGroup {
    /** The event being interacted with */
    targetEvent: NDKEvent;

    /** All interactions on this event */
    interactions: NDKEvent[];

    /** Unique pubkeys of actors */
    actors: string[];

    /** Total count of interactions */
    totalCount: number;

    /** Interactions grouped by type */
    types: Map<number, NDKEvent[]>;

    /** Most recent interaction timestamp */
    mostRecentAt: number;
}

/**
 * State returned by createNotificationFeed
 */
export interface NotificationFeedState {
    /** All notification groups */
    all: NotificationGroup[];

    /** Total notification count */
    count: number;

    /** Notifications grouped by type */
    byType: {
        reactions: NotificationGroup[];
        zaps: NotificationGroup[];
        reposts: NotificationGroup[];
        replies: NotificationGroup[];
    };

    /** Loading state */
    loading: boolean;
}

/**
 * Creates a notification feed using $metaSubscription.
 *
 * Tracks interactions (reactions, zaps, reposts, replies) on a user's events
 * and groups them by target event.
 *
 * @example
 * ```svelte
 * <script>
 *   const feed = createNotificationFeed(() => ({
 *     pubkey: targetPubkey,
 *     since: Date.now() / 1000 - 24 * 60 * 60, // Last 24 hours
 *     sort: 'tag-time'
 *   }), ndk);
 * </script>
 *
 * {#each feed.all as notification}
 *   <NotificationItem.Root {ndk} {notification}>
 *     <!-- Notification UI -->
 *   </NotificationItem.Root>
 * {/each}
 * ```
 */
export function createNotificationFeed(
    config: () => NotificationFeedConfig,
    ndkParam?: NDKSvelte
): NotificationFeedState {
    const ndk = resolveNDK(ndkParam);

    // $metaSubscribe handles its own reactivity - the function we pass
    // will be re-evaluated when config() changes
    const metaSub = ndk?.$metaSubscribe?.(() => {
        const {
            pubkey,
            kinds = [7, 9735, 6, 16, 1, 1111], // reactions, zaps, reposts, boost, replies, generic replies
            since,
            sort = 'tag-time',
            limit
        } = config();

        return {
            filters: [{
                kinds,
                '#p': [pubkey],
                since
            }],
            sort,
            limit
        };
    });

    const loading = $derived(false);

    // Group interactions by target event
    const groupedNotifications = $derived.by(() => {
        if (!metaSub?.events) return new Map<string, NotificationGroup>();

        const groups = new Map<string, NotificationGroup>();

        // Get all target events that have been interacted with
        const targetEvents = metaSub.events || [];

        for (const targetEvent of targetEvents) {
            // Get all interactions for this target event
            const interactions = metaSub.eventsTagging?.(targetEvent) || [];

            if (interactions.length === 0) continue;

            // Extract unique actors
            const actorSet = new Set<string>();
            const typeMap = new Map<number, NDKEvent[]>();
            let mostRecent = 0;

            for (const interaction of interactions) {
                actorSet.add(interaction.pubkey);

                // Group by interaction type
                const eventKind = interaction.kind ?? 1;
                if (!typeMap.has(eventKind)) {
                    typeMap.set(eventKind, []);
                }
                typeMap.get(eventKind)!.push(interaction);

                // Track most recent timestamp
                if (interaction.created_at && interaction.created_at > mostRecent) {
                    mostRecent = interaction.created_at;
                }
            }

            const group: NotificationGroup = {
                targetEvent,
                interactions,
                actors: Array.from(actorSet),
                totalCount: interactions.length,
                types: typeMap,
                mostRecentAt: mostRecent
            };

            groups.set(targetEvent.id, group);
        }

        return groups;
    });

    // Convert to array and sort by most recent
    const all = $derived.by(() => {
        const notifications = Array.from(groupedNotifications.values());
        return notifications.sort((a, b) => b.mostRecentAt - a.mostRecentAt);
    });

    // Group by interaction type
    const byType = $derived.by(() => {
        const reactions: NotificationGroup[] = [];
        const zaps: NotificationGroup[] = [];
        const reposts: NotificationGroup[] = [];
        const replies: NotificationGroup[] = [];

        for (const group of all) {
            // Check what types of interactions this group has
            if (group.types.has(7)) reactions.push(group);
            if (group.types.has(9735)) zaps.push(group);
            if (group.types.has(6) || group.types.has(16)) reposts.push(group);
            if (group.types.has(1) || group.types.has(1111)) replies.push(group);
        }

        return { reactions, zaps, reposts, replies };
    });

    const count = $derived(all.length);

    return {
        get all() { return all; },
        get count() { return count; },
        get byType() { return byType; },
        get loading() { return loading; }
    };
}