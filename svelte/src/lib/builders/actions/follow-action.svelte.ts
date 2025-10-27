import type { NDKUser } from "@nostr-dev-kit/ndk";
import { NDKInterestList } from "@nostr-dev-kit/ndk";
import type { NDKSvelte } from "../../ndk-svelte.svelte.js";

/**
 * Creates a reactive follow action state manager
 *
 * @param ndk - The NDKSvelte instance
 * @param target - Function returning the target to follow (NDKUser or string hashtag)
 * @returns Object with isFollowing state and toggle function
 *
 * @example
 * ```svelte
 * <script>
 *   const followAction = createFollowAction(ndk, () => user);
 * </script>
 *
 * <button onclick={followAction.toggle}>
 *   {followAction.isFollowing ? 'Unfollow' : 'Follow'}
 * </button>
 * ```
 */
export function createFollowAction(
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
        try {
            const pubkey = t.pubkey;
            return ndk.$follows.some(pk => pk === pubkey);
        } catch {
            // User doesn't have pubkey set yet (e.g., from createFetchUser before loaded)
            return false;
        }
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
        let pubkey: string;
        try {
            pubkey = t.pubkey;
        } catch {
            // User doesn't have pubkey set yet
            throw new Error("User not loaded yet");
        }

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
