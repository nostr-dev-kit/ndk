import type { NDKUserProfile } from "@nostr-dev-kit/ndk";
import type { NDKSvelte } from "./ndk-svelte.svelte";
import { LRUCache } from "./utils/lru-cache.js";
import { validateCallback } from "./utils/validate-callback.js";

// Global LRU cache for profile fetches (1000 entries)
const profileCache = new LRUCache<string, NDKUserProfile>(1000);

/**
 * Reactively fetch a user profile by pubkey
 *
 * Returns a reactive proxy to the profile that updates when the pubkey changes.
 * Use it directly as if it were an NDKUserProfile - all property access is reactive.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   const user = ndk.$fetchUser(() => identifier);
 *   const profile = ndk.$fetchProfile(() => user?.pubkey);
 * </script>
 *
 * {#if profile}
 *   <h1>{profile.name}</h1>
 *   <p>{profile.about}</p>
 * {/if}
 * ```
 */
export function createFetchProfile(ndk: NDKSvelte, pubkey: () => string | undefined): NDKUserProfile | undefined {
    validateCallback(pubkey, '$fetchProfile', 'pubkey');
    let _profile = $state<NDKUserProfile | undefined>(undefined);

    const derivedPubkey = $derived(pubkey());

    $effect(() => {
        const pk = derivedPubkey;
        if (!pk) {
            _profile = undefined;
            return;
        }

        // Check cache first
        const cachedProfile = profileCache.get(pk);
        if (cachedProfile) {
            _profile = cachedProfile;
            return;
        }

        const user = ndk.getUser({ pubkey: pk });
        user.fetchProfile({ closeOnEose: true, groupable: true, groupableDelay: 250 })
            .then(() => {
                if (user.profile) {
                    // Update cache with fetched profile
                    profileCache.set(pk, user.profile);
                    _profile = user.profile;
                }
            })
            .catch(() => {
                _profile = undefined;
            });
    });

    // Return a proxy that forwards all access to the reactive _profile
    return new Proxy({} as NDKUserProfile | undefined, {
        get(_target, prop) {
            if (_profile && prop in _profile) {
                const value = _profile[prop as keyof NDKUserProfile];
                return typeof value === "function" ? value.bind(_profile) : value;
            }
            return undefined;
        },
        has(_target, prop) {
            return _profile ? prop in _profile : false;
        },
        ownKeys() {
            return _profile ? Reflect.ownKeys(_profile) : [];
        },
        getOwnPropertyDescriptor(_target, prop) {
            return _profile ? Reflect.getOwnPropertyDescriptor(_profile, prop) : undefined;
        },
    }) as NDKUserProfile | undefined;
}
