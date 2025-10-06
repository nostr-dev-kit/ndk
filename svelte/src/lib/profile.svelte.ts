import type { NDKSubscriptionOptions, NDKUserProfile } from "@nostr-dev-kit/ndk";
import { NDKSubscriptionCacheUsage } from "@nostr-dev-kit/ndk";
import type { NDKSvelte } from "./ndk-svelte.svelte";

export interface ProfileStore {
    profile: NDKUserProfile | undefined;
    fetching: boolean;
    error: Error | undefined;
}

/**
 * Fetches and maintains a reactive user profile for a given pubkey
 *
 * @param ndk - NDK instance
 * @param pubkey - User's public key (can be undefined)
 * @param opts - Optional NDK subscription options for the profile fetch
 * @returns Reactive profile store
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { useUser, useProfile } from '@nostr-dev-kit/svelte';
 *
 *   const userStore = useUser(ndk, 'npub1...');
 *   const profileStore = useProfile(ndk, userStore.user?.pubkey);
 * </script>
 *
 * <div>
 *   {#if profileStore.profile}
 *     <h2>{profileStore.profile.name}</h2>
 *     <p>{profileStore.profile.about}</p>
 *     <img src={profileStore.profile.image} alt={profileStore.profile.name} />
 *   {:else if profileStore.fetching}
 *     <p>Loading profile...</p>
 *   {:else if profileStore.error}
 *     <p>Error: {profileStore.error.message}</p>
 *   {/if}
 * </div>
 * ```
 *
 * @example With custom subscription options
 * ```svelte
 * <script>
 *   const profileStore = useProfile(ndk, pubkey, {
 *     cacheUsage: NDKSubscriptionCacheUsage.ONLY_RELAY,
 *     closeOnEose: true,
 *     groupable: false
 *   });
 * </script>
 * ```
 */
export function useProfile(ndk: NDKSvelte, pubkey: string | undefined, opts?: NDKSubscriptionOptions): ProfileStore {
    let profile = $state<NDKUserProfile | undefined>(undefined);
    let fetching = $state(false);
    let error = $state<Error | undefined>(undefined);
    let currentPubkey = $state<string | undefined>(undefined);

    console.log("useProfile called with pubkey:", pubkey);

    $effect.root(() => {
        $effect(() => {
            // If pubkey hasn't changed, don't refetch
            if (pubkey === currentPubkey) {
                return;
            }

            currentPubkey = pubkey;

            if (!pubkey) {
                profile = undefined;
                error = undefined;
                fetching = false;
                return;
            }

            fetching = true;
            error = undefined;

            // Fetch the profile
            fetchProfile(pubkey);
        });
    });

    async function fetchProfile(pubkey: string) {
        console.log("Fetching profile for pubkey:", pubkey);
        try {
            // Check cache first if available and not disabled
            if (ndk.cacheAdapter && opts?.cacheUsage !== NDKSubscriptionCacheUsage.ONLY_RELAY) {
                if (ndk.cacheAdapter.fetchProfileSync) {
                    const cachedProfile = ndk.cacheAdapter.fetchProfileSync(pubkey);
                    if (cachedProfile) {
                        profile = cachedProfile;
                        fetching = false;
                        return;
                    }
                } else if (ndk.cacheAdapter.fetchProfile) {
                    const cachedProfile = await ndk.cacheAdapter.fetchProfile(pubkey);
                    if (cachedProfile) {
                        profile = cachedProfile;
                        fetching = false;
                        return;
                    }
                }
            }

            // Set up default options
            const defaultOpts: NDKSubscriptionOptions = {
                closeOnEose: true,
                groupable: true,
                groupableDelay: 250,
                cacheUsage: NDKSubscriptionCacheUsage.PARALLEL,
            };

            // Merge with provided options
            const subscriptionOpts = { ...defaultOpts, ...opts };

            console.log("Subscription options:", subscriptionOpts);

            // Fetch profile event from relays
            const profileEvent = await ndk.fetchEvent({ kinds: [0], authors: [pubkey] }, subscriptionOpts);

            console.log("Fetched profile event:", profileEvent);

            if (profileEvent) {
                try {
                    const content = JSON.parse(profileEvent.content);
                    profile = content as NDKUserProfile;

                    // Save to cache if available
                    if (ndk.cacheAdapter?.saveProfile) {
                        ndk.cacheAdapter.saveProfile(pubkey, profile);
                    }
                } catch (e) {
                    error = new Error(`Failed to parse profile: ${e}`);
                }
            } else {
                profile = undefined;
            }
        } catch (err) {
            console.error("Error fetching profile:", err);
            error = err as Error;
            profile = undefined;
        } finally {
            fetching = false;
        }
    }

    return {
        get profile() {
            return profile;
        },
        get fetching() {
            return fetching;
        },
        get error() {
            return error;
        },
    };
}
