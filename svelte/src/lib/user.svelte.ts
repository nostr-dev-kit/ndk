import type { NDKUser } from "@nostr-dev-kit/ndk";
import type { NDKSvelte } from "./ndk-svelte.svelte";

export interface UserStore {
    user: NDKUser | undefined;
    fetching: boolean;
    error: Error | undefined;
}

/**
 * Resolves a user identifier (npub, NIP-05, hex pubkey, or nprofile) to a reactive user object
 * Note: This does NOT fetch the profile. Use useProfile() for profile data.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { useUser, useProfile } from '@nostr-dev-kit/svelte';
 *
 *   const userStore = useUser(ndk, 'npub1...');
 *   const profile = useProfile(ndk, userStore.user?.pubkey);
 * </script>
 *
 * <div>
 *   {#if userStore.user}
 *     <span>{userStore.user.npub}</span>
 *     {#if profile}
 *       <span>{profile.name}</span>
 *     {/if}
 *   {/if}
 * </div>
 * ```
 */
export function useUser(ndk: NDKSvelte, identifier: string): UserStore {
    let user = $state<NDKUser | undefined>(undefined);
    let fetching = $state(false);
    let error = $state<Error | undefined>(undefined);

    $effect.root(() => {
        $effect(() => {
            if (!identifier) {
                user = undefined;
                error = undefined;
                return;
            }

            fetching = true;
            error = undefined;
            ndk.fetchUser(identifier)
                .then((fetchedUser) => {
                    user = fetchedUser || undefined;
                })
                .catch((err) => {
                    error = err;
                    user = undefined;
                })
                .finally(() => {
                    fetching = false;
                });
        });
    });

    return {
        get user() {
            return user;
        },
        get fetching() {
            return fetching;
        },
        get error() {
            return error;
        },
    };
}
