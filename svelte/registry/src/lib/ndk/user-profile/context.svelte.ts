import type { NDKUser, NDKUserProfile } from '@nostr-dev-kit/ndk';
import type { NDKSvelte } from '@nostr-dev-kit/svelte';

/**
 * Context shared between UserProfile components
 */
export interface UserProfileContext {
    /** NDK instance */
    ndk: NDKSvelte;

    /** The user being displayed */
    user?: NDKUser;

    /** Resolved NDKUser instance */
    ndkUser: NDKUser | null;

    /** User profile data (reactive) */
    profile?: NDKUserProfile | null;

    /** Whether to show hover card on mouse enter */
    showHoverCard: boolean;

    /** Click handler */
    onclick?: (e: MouseEvent) => void;
}

export const USER_PROFILE_CONTEXT_KEY = Symbol('user-profile');
