import type { NDKUser } from "@nostr-dev-kit/ndk";
import { NDKInterestList } from "@nostr-dev-kit/ndk";
import type { NDKSvelte } from "../../ndk-svelte.svelte.js";
import { resolveNDK } from "../resolve-ndk.svelte.js";

export interface FollowActionConfig {
    target: NDKUser | string | undefined;
}

/**
 * Creates a reactive follow action state manager
 *
 * @param config - Function returning configuration with target
 * @param ndk - Optional NDK instance (uses context if not provided)
 * @returns Object with isFollowing state and follow function
 *
 * @example
 * ```svelte
 * <script>
 *   // NDK from context
 *   const followAction = createFollowAction(() => ({ target: user }));
 *
 *   // Or with explicit NDK
 *   const followAction = createFollowAction(() => ({ target: user }), ndk);
 * </script>
 *
 * <button onclick={followAction.follow}>
 *   {followAction.isFollowing ? 'Unfollow' : 'Follow'}
 * </button>
 * ```
 */
export function createFollowAction(
    config: () => FollowActionConfig,
    ndk?: NDKSvelte
) {
    const resolvedNDK = resolveNDK(ndk);

    // Ensure NDKInterestList is monitored if we have sessions
    // This is needed for hashtag follows
    if (resolvedNDK.$sessions) {
        resolvedNDK.$sessions.addMonitor([NDKInterestList]);
    }

    const isFollowing = $derived.by(() => {
        const { target } = config();
        if (!target) return false;

        // String = hashtag
        if (typeof target === 'string') {
            const interestList = resolvedNDK.$sessionEvent<NDKInterestList>(NDKInterestList);
            if (!interestList) return false;
            return interestList.hasInterest(target.toLowerCase());
        }

        // NDKUser = user
        try {
            const pubkey = target.pubkey;
            return resolvedNDK.$follows.has(pubkey);
        } catch {
            // User doesn't have pubkey set yet (e.g., from createFetchUser before loaded)
            return false;
        }
    });

    async function follow(): Promise<void> {
        const { target } = config();
        if (!target) return;

        // String = hashtag
        if (typeof target === 'string') {
            const interestList = resolvedNDK.$sessionEvent<NDKInterestList>(NDKInterestList);
            if (!interestList) {
                throw new Error("No interest list found. User may not be logged in.");
            }

            const hashtag = target.toLowerCase();
            if (isFollowing) {
                interestList.removeInterest(hashtag);
            } else {
                interestList.addInterest(hashtag);
            }

            await interestList.publishReplaceable();
            return;
        }

        // NDKUser = user
        let pubkey: string;
        try {
            pubkey = target.pubkey;
        } catch {
            // User doesn't have pubkey set yet
            throw new Error("User not loaded yet");
        }

        if (isFollowing) {
            await resolvedNDK.$follows.remove(pubkey);
        } else {
            await resolvedNDK.$follows.add(pubkey);
        }
    }

    return {
        get isFollowing() {
            return isFollowing;
        },
        follow
    };
}
