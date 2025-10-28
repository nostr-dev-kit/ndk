import { NDKEvent, NDKKind } from "@nostr-dev-kit/ndk";
import type { NDKSvelte } from "../../ndk-svelte.svelte.js";

export interface RepostStats {
    count: number;
    hasReposted: boolean;
    userRepost?: NDKEvent;
}

export interface RepostActionConfig {
    ndk: NDKSvelte;
    event: NDKEvent | undefined;
}

/**
 * Creates a reactive repost action state manager
 *
 * @param config - Function returning configuration with ndk and event
 * @returns Object with repost state, repost function, and quote function
 *
 * @example
 * ```svelte
 * <script>
 *   const repostAction = createRepostAction(() => ({ ndk, event }));
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
    config: () => RepostActionConfig
) {
    // Subscribe to reposts and quotes for this event
    let repostsSub = $state<ReturnType<NDKSvelte["$subscribe"]> | null>(null);

    $effect(() => {
        const { ndk, event } = config();
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
        if (!sub) return { count: 0, hasReposted: false };

        const { ndk } = config();
        const reposts = sub.events;

        let userRepost: NDKEvent | undefined;
        const hasReposted = ndk.$currentPubkey
            ? Array.from(reposts).some(r => {
                if (r.pubkey === ndk.$currentPubkey) {
                    userRepost = r;
                    return true;
                }
                return false;
            })
            : false;

        return {
            count: reposts.size,
            hasReposted,
            userRepost
        };
    });

    async function repost(): Promise<NDKEvent> {
        const { ndk, event } = config();

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

        // Otherwise, create a new repost (using kind 6 - generic repost)
        const repostEvent = new NDKEvent(ndk, {
            kind: NDKKind.GenericRepost,
            content: "",
            tags: [
                ["e", event.id, event.relay?.url || ""],
                ["p", event.pubkey]
            ]
        });

        await repostEvent.publish();
        return repostEvent;
    }

    async function quote(content: string): Promise<NDKEvent> {
        const { ndk, event } = config();

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
            tags: [
                ["q", event.tagId()],
                ["e", event.id, event.relay?.url || "", "mention"],
                ["p", event.pubkey]
            ]
        });

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
        repost,
        quote
    };
}
