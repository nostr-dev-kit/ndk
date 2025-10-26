import type { NDKUser, NDKUserProfile } from '@nostr-dev-kit/ndk';
import type { NDKSvelte } from '$lib/ndk-svelte.svelte.js';

export interface ProfileFetcherState {
    profile: NDKUserProfile | null;
    loading: boolean;
}

export interface CreateProfileFetcherProps {
    ndk: NDKSvelte;
    user: NDKUser | string; // NDKUser instance or pubkey/npub
}

/**
 * Create reactive state for fetching a user profile
 *
 * Handles fetching and caching user profiles.
 *
 * @example
 * ```ts
 * const profileFetcher = createProfileFetcher({ ndk, user: 'npub1...' });
 *
 * // Access state
 * profileFetcher.profile // User profile
 * profileFetcher.loading // Loading state
 * ```
 */
export function createProfileFetcher(props: CreateProfileFetcherProps): ProfileFetcherState {
    const state = $state<{ profile: NDKUserProfile | null; loading: boolean }>({
        profile: null,
        loading: true
    });

    async function fetchProfile() {
        state.loading = true;

        try {
            let ndkUser: NDKUser;

            // Handle string (pubkey/npub) or NDKUser
            if (typeof props.user === 'string') {
                ndkUser = props.ndk.getUser({ pubkey: props.user });
            } else {
                ndkUser = props.user;
            }

            // Check if profile already cached
            if (ndkUser.profile) {
                state.profile = ndkUser.profile;
                state.loading = false;
                return;
            }

            // Fetch profile
            const fetchedProfile = await ndkUser.fetchProfile();
            state.profile = fetchedProfile || null;
        } catch (err) {
            console.error('Failed to fetch profile:', err);
            state.profile = null;
        }

        state.loading = false;
    }

    $effect(() => {
        if (props.user) fetchProfile();
    });

    return {
        get profile() {
            return state.profile;
        },
        get loading() {
            return state.loading;
        },
    };
}
