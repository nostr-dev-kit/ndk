import type { NDKUser, NDKUserProfile } from '@nostr-dev-kit/ndk';
import { SvelteMap } from 'svelte/reactivity';
import type { NDKSvelte } from '@nostr-dev-kit/svelte';
import { resolveNDK } from '../resolve-ndk/index.svelte.js';

// Track in-flight profile fetch requests to prevent duplicate fetches
const inFlightRequests = new SvelteMap<string, Promise<NDKUserProfile | null>>();

export interface ProfileFetcherState {
    profile: NDKUserProfile | null;
    user: NDKUser | null;
    loading: boolean;
}

export interface ProfileFetcherConfig {
    user: NDKUser | string; // NDKUser instance or pubkey/npub
}

/**
 * Create reactive state for fetching a user profile
 *
 * Handles fetching and caching user profiles with deduplication.
 *
 * @param config - Function returning configuration with user
 * @param ndk - Optional NDK instance (uses context if not provided)
 *
 * @example
 * ```ts
 * // NDK from context
 * const profileFetcher = createProfileFetcher(() => ({ user: 'npub1...' }));
 *
 * // Or with explicit NDK
 * const profileFetcher = createProfileFetcher(() => ({ user: 'npub1...' }), ndk);
 *
 * // Access state
 * profileFetcher.profile // User profile
 * profileFetcher.user // NDKUser instance (available once loaded)
 * profileFetcher.loading // Loading state
 * ```
 */
export function createProfileFetcher(
    config: () => ProfileFetcherConfig,
    ndk?: NDKSvelte
): ProfileFetcherState {
    const resolvedNDK = resolveNDK(ndk);
    const state = $state<{ profile: NDKUserProfile | null; user: NDKUser | null; loading: boolean }>({
        profile: null,
        user: null,
        loading: true
    });

    async function fetchProfile(payload: NDKUser | string) {
        state.loading = true;

        try {
            const ndkUser = typeof payload === 'string'
                ? await resolvedNDK.fetchUser(payload)
                : payload;

            if (!ndkUser) {
                state.profile = null;
                state.user = null;
                state.loading = false;
                return;
            }

            const pubkey = ndkUser.pubkey;

            // Check if profile already cached
            if (ndkUser.profile) {
                state.profile = ndkUser.profile;
                state.user = ndkUser;
                state.loading = false;
                return;
            }

            // Check if there's already an in-flight request for this pubkey
            let fetchPromise = inFlightRequests.get(pubkey);

            if (!fetchPromise) {
                // No in-flight request, create a new one
                fetchPromise = ndkUser
                    .fetchProfile({ closeOnEose: true, groupable: true, groupableDelay: 250 })
                    .finally(() => {
                        // Remove from in-flight requests when complete
                        inFlightRequests.delete(pubkey);
                    });

                inFlightRequests.set(pubkey, fetchPromise);
            }

            // Fetch profile
            const fetchedProfile = await fetchPromise;
            state.profile = fetchedProfile || null;
            state.user = ndkUser;
        } catch (err) {
            console.error('Failed to fetch profile:', err);
            state.profile = null;
            state.user = null;
        }

        state.loading = false;
    }

    $effect(() => {
        const { user } = config();
        if (user) fetchProfile(user);
    });

    return {
        get profile() {
            return state.profile;
        },
        get user() {
            return state.user;
        },
        get loading() {
            return state.loading;
        },
    };
}
