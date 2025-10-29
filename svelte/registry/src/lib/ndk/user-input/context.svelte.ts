// @ndk-version: user-input@0.4.0
import type { NDKUser } from '@nostr-dev-kit/ndk';
import type { NDKSvelte } from '@nostr-dev-kit/svelte';
import type { UserInputResult } from '@nostr-dev-kit/svelte';

/**
 * Context shared between UserInput components
 */
export interface UserInputContext {
    /** NDK instance */
    ndk: NDKSvelte;

    /** Current search query */
    query: string;

    /** Set the search query */
    setQuery: (query: string) => void;

    /** Search results */
    results: UserInputResult[];

    /** Selected user */
    selectedUser: NDKUser | null;

    /** Select a user */
    selectUser: (user: NDKUser) => void;

    /** Clear selection and results */
    clear: () => void;

    /** Whether search is in progress */
    loading: boolean;

    /** Optional callback when user is selected */
    onSelect?: (user: NDKUser) => void;
}

export const USER_INPUT_CONTEXT_KEY = Symbol('user-input');
