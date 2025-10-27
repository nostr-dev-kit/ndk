import type { NDKUser } from '@nostr-dev-kit/ndk';
import type { NDKSvelte, ProfileFetcherState } from '@nostr-dev-kit/svelte';

/**
 * Context shared between UserProfile components
 */
export interface UserProfileContext {
    /** NDK instance */
    ndk: NDKSvelte;

    /** The user being displayed (can be NDKUser or just pubkey) */
    user?: NDKUser;
    pubkey?: string;

    /** Resolved NDKUser instance */
    ndkUser: NDKUser | null;

    /** Profile fetcher state (reactive) */
    profileFetcher: ProfileFetcherState | null;

    /** Whether to show hover card on mouse enter */
    showHoverCard: boolean;

    /** Click handler */
    onclick?: (e: MouseEvent) => void;
}

export const USER_PROFILE_CONTEXT_KEY = Symbol('user-profile');
