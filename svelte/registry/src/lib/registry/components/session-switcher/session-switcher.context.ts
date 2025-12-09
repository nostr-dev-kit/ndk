import type { NDKSvelteWithSession } from '@nostr-dev-kit/svelte';

export interface SessionSwitcherContext {
	ndk: NDKSvelteWithSession;
	switchSession: (pubkey: string) => void;
}

export const SESSION_SWITCHER_CONTEXT_KEY = Symbol.for('session-switcher');
