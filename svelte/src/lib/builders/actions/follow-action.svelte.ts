import type { NDKUser } from "@nostr-dev-kit/ndk";
import { NDKInterestList } from "@nostr-dev-kit/ndk";
import type { NDKSvelte } from "../../ndk-svelte.svelte.js";

export interface FollowActionConfig {
    ndk: NDKSvelte;
    target: NDKUser | string | undefined;
}

/**
 * Creates a reactive follow action state manager
 *
 * @param config - Function returning configuration with ndk and target
 * @returns Object with isFollowing state and follow function
 *
 * @example
 * ```svelte
 * <script>
 *   const followAction = createFollowAction(() => ({ ndk, target: user }));
 * </script>
 *
 * <button onclick={followAction.follow}>
 *   {followAction.isFollowing ? 'Unfollow' : 'Follow'}
 * </button>
 * ```
 */
export function createFollowAction(
    config: () => FollowActionConfig
) {
    const isFollowing = $derived.by(() => {
        const { ndk, target } = config();
        if (!target) return false;

        // String = hashtag
        if (typeof target === 'string') {
            const interestList = ndk.$sessionEvent<NDKInterestList>(NDKInterestList);
            if (!interestList) return false;
            return interestList.hasInterest(target.toLowerCase());
        }

        // NDKUser = user
        try {
            const pubkey = target.pubkey;
            return ndk.$follows.has(pubkey);
        } catch {
            // User doesn't have pubkey set yet (e.g., from createFetchUser before loaded)
            return false;
        }
    });

    async function follow(): Promise<void> {
        const { ndk, target } = config();
        if (!target) return;

        // String = hashtag
        if (typeof target === 'string') {
            const interestList = ndk.$sessionEvent<NDKInterestList>(NDKInterestList);
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
            await ndk.$follows.remove(pubkey);
        } else {
            await ndk.$follows.add(pubkey);
        }
    }

    return {
        get isFollowing() {
            return isFollowing;
        },
        follow
    };
}
