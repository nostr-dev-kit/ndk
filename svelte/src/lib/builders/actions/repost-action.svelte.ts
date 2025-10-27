import { NDKEvent, NDKKind } from "@nostr-dev-kit/ndk";
import type { NDKSvelte } from "../../ndk-svelte.svelte.js";

export interface RepostStats {
    count: number;
    hasReposted: boolean;
    userRepost?: NDKEvent;
}

/**
 * Creates a reactive repost action state manager
 *
 * @param ndk - The NDKSvelte instance
 * @param event - Function returning the event to repost
 * @returns Object with repost state and toggle function
 *
 * @example
 * ```svelte
 * <script>
 *   const repostAction = createRepostAction(ndk, () => event);
 * </script>
 *
 * <button onclick={repostAction.toggle}>
 *   {repostAction.hasReposted ? 'Unrepost' : 'Repost'} ({repostAction.count})
 * </button>
 * ```
 */
export function createRepostAction(
    ndk: NDKSvelte,
    event: () => NDKEvent | undefined
) {
    // Subscribe to reposts for this event
    const repostsSub = ndk.$subscribe(() => {
        const e = event();
        if (!e?.id) return undefined;

        return {
            filters: [{
                kinds: [NDKKind.Repost, NDKKind.GenericRepost],
                "#e": [e.id]
            }],
            opts: { closeOnEose: false }
        };
    });

    const stats = $derived.by((): RepostStats => {
        const reposts = repostsSub.events;
        const currentPubkey = ndk.$currentPubkey;

        let userRepost: NDKEvent | undefined;
        const hasReposted = currentPubkey
            ? Array.from(reposts).some(r => {
                if (r.pubkey === currentPubkey) {
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

    async function toggle(): Promise<void> {
        const e = event();
        if (!e?.id) {
            throw new Error("No event to repost");
        }

        if (!ndk.$currentUser) {
            throw new Error("User must be logged in to repost");
        }

        // If already reposted, delete the repost
        if (stats.hasReposted && stats.userRepost) {
            await stats.userRepost.delete();
            return;
        }

        // Otherwise, create a new repost (using kind 6 - generic repost)
        const repostEvent = new NDKEvent(ndk, {
            kind: NDKKind.GenericRepost,
            content: "",
            tags: [
                ["e", e.id, e.relay?.url || ""],
                ["p", e.pubkey]
            ]
        });

        await repostEvent.publish();
    }

    return {
        get count() {
            return stats.count;
        },
        get hasReposted() {
            return stats.hasReposted;
        },
        toggle
    };
}
