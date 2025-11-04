import type { NDKUser, NDKUserProfile } from '@nostr-dev-kit/ndk';
import type { NDKSvelte } from '@nostr-dev-kit/svelte';

/**
 * Context shared between User components
 */
export interface UserContext {
    /** NDK instance */
    ndk: NDKSvelte;

    /** The user being displayed */
    user?: NDKUser;

    /** Resolved NDKUser instance */
    ndkUser: NDKUser | null;

    /** User profile data (reactive) */
    profile?: NDKUserProfile | null;

    /** Click handler */
    onclick?: (e: MouseEvent) => void;
}

export const USER_CONTEXT_KEY = Symbol('user');
