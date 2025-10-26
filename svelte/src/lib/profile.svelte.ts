import type { NDKUserProfile } from "@nostr-dev-kit/ndk";
import type { NDKSvelte } from "./ndk-svelte.svelte";
import { validateCallback } from "./utils/validate-callback.js";
import { untrack } from "svelte";

// Track in-flight profile fetch requests to prevent duplicate fetches
const inFlightRequests = new Map<string, Promise<NDKUserProfile | null>>();

export type FetchProfileResult = NDKUserProfile & {
    $loaded: boolean;
};

/**
 * Reactively fetch a user profile by pubkey
 *
 * Returns a reactive profile object with all profile properties directly accessible.
 * Use `$loaded` to check if the profile has been fetched.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   const profile = ndk.$fetchProfile(() => pubkey);
 * </script>
 *
 * {#if profile.$loaded}
 *   <h1>{profile.name || 'Anonymous'}</h1>
 *   <p>{profile.about}</p>
 * {/if}
 * ```
 */
export function createFetchProfile(ndk: NDKSvelte, pubkey: () => string | undefined) {
    validateCallback(pubkey, "$fetchProfile", "pubkey");
    let profile = $state<NDKUserProfile>({});

    const derivedPubkey = $derived(pubkey());

    function clearProfile() {
        // Mutate to clear all properties without reassigning
        Object.keys(profile).forEach((key) => delete profile[key]);
    }

    $effect(() => {
        const pk = derivedPubkey;
        if (!pk) {
            untrack(() => clearProfile());
            return;
        }

        console.log("trying to get profile of ", pk);

        // Check if there's already an in-flight request for this pubkey
        let fetchPromise = inFlightRequests.get(pk);

        if (!fetchPromise) {
            // No in-flight request, create a new one
            const user = ndk.getUser({ pubkey: pk });
            fetchPromise = user
                .fetchProfile({ closeOnEose: true, groupable: true, groupableDelay: 250 })
                .finally(() => {
                    // Remove from in-flight requests when complete
                    inFlightRequests.delete(pk);
                });

            inFlightRequests.set(pk, fetchPromise);
        }

        // Set empty state while loading (mutate)
        untrack(() => clearProfile());

        fetchPromise
            .then((fetchedProfile) => {
                console.log("fetched profile of ", pk, fetchedProfile);
                if (fetchedProfile) {
                    // Mutate to set new properties
                    clearProfile(); // No untrack needed here—runs outside the $effect body
                    Object.assign(profile, fetchedProfile);
                } else {
                    clearProfile();
                }
            })
            .catch(() => {
                clearProfile();
            });
    });

    return profile;
}
