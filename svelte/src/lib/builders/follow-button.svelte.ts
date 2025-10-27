import type { NDKUser } from "@nostr-dev-kit/ndk";
import { NDKInterestList } from "@nostr-dev-kit/ndk";
import type { NDKSvelte } from "../ndk-svelte.svelte.js";

/**
 * Creates a reactive follow button state manager
 *
 * @param ndk - The NDKSvelte instance
 * @param target - Function returning the target to follow (NDKUser or string hashtag)
 * @returns Object with isFollowing state and toggle function
 *
 * @example
 * ```svelte
 * <script>
 *   const followButton = createFollowButton(ndk, () => user);
 * </script>
 *
 * <button onclick={followButton.toggle}>
 *   {followButton.isFollowing ? 'Unfollow' : 'Follow'}
 * </button>
 * ```
 */
export function createFollowButton(
    ndk: NDKSvelte,
    target: () => NDKUser | string | undefined
) {
    const isFollowing = $derived.by(() => {
        const t = target();
        if (!t) return false;

        // String = hashtag
        if (typeof t === 'string') {
            const interestList = ndk.$sessionEvent <NDKInterestList>(NDKInterestList);
            if (!interestList) return false;
            return interestList.hasInterest(t.toLowerCase());
        }

        // NDKUser = user
        const pubkey = t.pubkey;
        return ndk.$follows.some(pk => pk === pubkey);
    });

    async function toggle(): Promise<void> {
        const t = target();
        if (!t) return;

        // String = hashtag
        if (typeof t === 'string') {
            const interestList = ndk.$sessionEvent<NDKInterestList>(NDKInterestList);
            if (!interestList) {
                throw new Error("No interest list found. User may not be logged in.");
            }

            const hashtag = t.toLowerCase();
            if (interestList.hasInterest(hashtag)) {
                interestList.removeInterest(hashtag);
            } else {
                interestList.addInterest(hashtag);
            }

            await interestList.publishReplaceable();
            return;
        }

        // NDKUser = user
        const pubkey = t.pubkey;
        const isCurrentlyFollowing = ndk.$follows.some(pk => pk === pubkey);

        if (isCurrentlyFollowing) {
            await ndk.$follows.remove(pubkey);
        } else {
            await ndk.$follows.add(pubkey);
        }
    }

    return {
        get isFollowing() {
            return isFollowing;
        },
        toggle
    };
}
