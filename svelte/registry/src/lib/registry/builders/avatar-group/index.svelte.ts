import type { NDKUser } from '@nostr-dev-kit/ndk';
import type { NDKSvelte } from '@nostr-dev-kit/svelte';

/**
 * Configuration for avatar group
 */
export interface AvatarGroupConfig {
    /** Array of pubkeys to display */
    pubkeys: string[];

    /** Whether to skip the current user from the list */
    skipCurrentUser?: boolean;
}

/**
 * State returned by createAvatarGroup
 */
export interface AvatarGroupState {
    /** Ordered array of users, prioritizing followed users */
    users: NDKUser[];

    /** Array of users that are followed by current user */
    followedUsers: NDKUser[];

    /** Array of users that are not followed by current user */
    unfollowedUsers: NDKUser[];
}

/**
 * Creates an avatar group with smart ordering based on follows.
 *
 * Prioritizes showing users that the current user follows first.
 * Optionally filters out the current user.
 *
 * @example
 * ```svelte
 * <script>
 *   const avatarGroup = createAvatarGroup(() => ({
 *     pubkeys: ['pubkey1', 'pubkey2', 'pubkey3'],
 *     skipCurrentUser: true
 *   }), ndk);
 * </script>
 *
 * {#each avatarGroup.users.slice(0, 5) as user}
 *   <Avatar {ndk} {user} />
 * {/each}
 * ```
 */
export function createAvatarGroup(
    config: () => AvatarGroupConfig,
    ndk?: NDKSvelte
): AvatarGroupState {
    const { pubkeys, skipCurrentUser = false } = $derived(config());

    // Get current user's follows
    const follows = $derived(ndk?.$follows || new Set<string>());
    const currentPubkey = $derived(ndk?.$currentPubkey);

    // Filter and convert pubkeys to users
    const allUsers = $derived.by(() => {
        if (!ndk) return [];

        let filteredPubkeys = pubkeys;

        // Skip current user if requested
        if (skipCurrentUser && currentPubkey) {
            filteredPubkeys = pubkeys.filter(pk => pk !== currentPubkey);
        }

        return filteredPubkeys.map(pubkey => ndk.getUser({ pubkey }));
    });

    // Separate followed and unfollowed users
    const followedUsers = $derived.by(() => {
        return allUsers.filter(user => follows.has(user.pubkey));
    });

    const unfollowedUsers = $derived.by(() => {
        return allUsers.filter(user => !follows.has(user.pubkey));
    });

    // Prioritize followed users first
    const users = $derived.by(() => {
        return [...followedUsers, ...unfollowedUsers];
    });

    return {
        get users() { return users; },
        get followedUsers() { return followedUsers; },
        get unfollowedUsers() { return unfollowedUsers; }
    };
}
