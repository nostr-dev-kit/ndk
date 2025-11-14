import { NDKEvent, NDKKind } from "@nostr-dev-kit/ndk";
import type { NDKSvelte } from "@nostr-dev-kit/svelte";
import { getNDK } from '../../utils/ndk/index.svelte.js';

export interface RepostStats {
    count: number;
    hasReposted: boolean;
    pubkeys: string[];
    userRepost?: NDKEvent;
}

export interface RepostActionConfig {

    event: NDKEvent | undefined;
}

export type QuoteIntentCallback = (event: NDKEvent) => void;

/**
 * Creates a reactive repost action state manager
 *
 * @param config - Function returning configuration with ndk and event
 * @returns Object with repost state, repost function, and quote function
 *
 * @example
 * ```svelte
 * <script>
 *   const repostAction = createRepostAction(() => ({ event }));
 * </script>
 *
 * <button onclick={repostAction.repost}>
 *   {repostAction.hasReposted ? 'Unrepost' : 'Repost'} ({repostAction.count})
 * </button>
 *
 * <button onclick={() => repostAction.quote("Great post!")}>
 *   Quote Post
 * </button>
 * ```
 */
export function createRepostAction(
    config: () => RepostActionConfig,
    ndk?: NDKSvelte
) {
    const ndk = getNDK(ndk);

    // Subscribe to reposts and quotes for this event
    let repostsSub = $state<ReturnType<NDKSvelte["$subscribe"]> | null>(null);

    $effect(() => {
        const { event } = config();
        if (!event?.id) {
            repostsSub = null;
            return;
        }

        repostsSub = ndk.$subscribe(() => ({
            filters: [
                // Regular reposts (kind 6 & 16) - use e.filter() for correct tag handling
                {
                    kinds: [NDKKind.Repost, NDKKind.GenericRepost],
                    ...event.filter()
                },
                // Quote posts with #q tag
                {
                    "#q": [event.tagId()]
                }
            ],
            closeOnEose: false
        }));
    });

    const stats = $derived.by((): RepostStats => {
        const sub = repostsSub;
        if (!sub) return { count: 0, hasReposted: false, pubkeys: [] };

        const reposts = sub.events;
        if (!reposts) return { count: 0, hasReposted: false, pubkeys: [] };

        let userRepost: NDKEvent | undefined;
        const uniquePubkeys = new Set<string>();

        // Collect all unique pubkeys and check if user has reposted
        for (const r of reposts) {
            uniquePubkeys.add(r.pubkey);
            if (ndk.$currentPubkey && r.pubkey === ndk.$currentPubkey) {
                userRepost = r;
            }
        }

        const hasReposted = !!userRepost;

        return {
            count: uniquePubkeys.size,
            hasReposted,
            pubkeys: Array.from(uniquePubkeys),
            userRepost
        };
    });

    async function repost(): Promise<NDKEvent> {
        const { event } = config();

        if (!event?.id) {
            throw new Error("No event to repost");
        }

        if (!ndk.$currentPubkey) {
            throw new Error("User must be logged in to repost");
        }

        // If already reposted, delete the repost
        if (stats.hasReposted && stats.userRepost) {
            await stats.userRepost.delete();
            return stats.userRepost;
        }

        // Otherwise, create a new repost using NDK's built-in method
        const repostEvent = await event.repost(true);
        return repostEvent;
    }

    async function quote(content: string): Promise<NDKEvent> {
        const { event } = config();

        if (!event?.id) {
            throw new Error("No event to quote");
        }

        if (!ndk.$currentPubkey) {
            throw new Error("User must be logged in to quote");
        }

        // Create quote post (kind 1 with #q tag)
        const quoteEvent = new NDKEvent(ndk, {
            kind: NDKKind.Text,
            content,
        });

        quoteEvent.tag(event, undefined, false, "q");

        await quoteEvent.publish();
        return quoteEvent;
    }

    return {
        get count() {
            return stats.count;
        },
        get hasReposted() {
            return stats.hasReposted;
        },
        get pubkeys() {
            return stats.pubkeys;
        },
        repost,
        quote
    };
}
