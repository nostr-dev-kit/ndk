import type { NDKUser } from "@nostr-dev-kit/ndk";
import { NDKInterestList } from "@nostr-dev-kit/ndk";
import type { NDKSvelte } from "@nostr-dev-kit/svelte";
import { getNDK } from "../../utils/ndk/index.svelte.js";

export interface FollowActionConfig {
    target: NDKUser | string | undefined;
}

/**
 * Creates a reactive follow action state manager
 *
 * @param config - Function returning configuration with target (NDKUser, pubkey hex string, or hashtag)
 * @param ndk - Optional NDK instance (uses context if not provided)
 * @returns Object with isFollowing state and follow function
 *
 * @example
 * ```svelte
 * <script>
 *   // Follow a user
 *   const followAction = createFollowAction(() => ({ target: user }));
 *
 *   // Follow by pubkey (64 hex chars)
 *   const followAction = createFollowAction(() => ({ target: 'fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52' }));
 *
 *   // Follow a hashtag
 *   const followAction = createFollowAction(() => ({ target: 'nostr' }));
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
    const ndk = getNDK(ndk);

    // Ensure NDKInterestList is monitored if we have sessions
    // This is needed for hashtag follows
    if (ndk.$sessions) {
        ndk.$sessions.addMonitor([NDKInterestList]);
    }

    const isFollowing = $derived.by(() => {
        let { target } = config();
        if (!target) return false;

        // String = pubkey (64 hex chars) or hashtag
        if (typeof target === 'string') {
            // If it's a 64-character hex string, treat it as a pubkey
            if (/^[0-9a-f]{64}$/i.test(target)) {
                target = ndk.getUser({ pubkey: target });
            } else {
                // Otherwise it's a hashtag
                const interestList = ndk.$sessionEvent(NDKInterestList, { create: true }) as NDKInterestList | undefined;
                if (!interestList) return false;
                return interestList.hasInterest(target.toLowerCase());
            }
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
        let { target } = config();
        if (!target) return;

        // String = pubkey (64 hex chars) or hashtag
        if (typeof target === 'string') {
            // If it's a 64-character hex string, treat it as a pubkey
            if (/^[0-9a-f]{64}$/i.test(target)) {
                target = ndk.getUser({ pubkey: target });
            } else {
                // Otherwise it's a hashtag
                const interestList = ndk.$sessionEvent(NDKInterestList, { create: true }) as NDKInterestList | undefined;
                if (!interestList) return;

                const hashtag = target.toLowerCase();
                if (isFollowing) {
                    interestList.removeInterest(hashtag);
                } else {
                    interestList.addInterest(hashtag);
                }

                await interestList.publishReplaceable();
                return;
            }
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
