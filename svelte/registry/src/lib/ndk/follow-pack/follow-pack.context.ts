import type { NDKSvelte } from '@nostr-dev-kit/svelte';
import type { NDKFollowPack } from '@nostr-dev-kit/ndk';

export interface FollowPackContext {
	ndk: NDKSvelte;
	followPack: NDKFollowPack;
	onclick?: (e: MouseEvent) => void;
}

export const FOLLOW_PACK_CONTEXT_KEY = Symbol('follow-pack');
