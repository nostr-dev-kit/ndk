import type { NDKSvelte } from '@nostr-dev-kit/svelte';
import type { NDKEvent } from '@nostr-dev-kit/ndk';
import type { NotificationGroup } from '$lib/registry/builders/notification';

export interface NotificationContext {
	ndk: NDKSvelte;
	notification: NotificationGroup;
	targetEvent: NDKEvent;
	interactions: NDKEvent[];
	types: Map<number, NDKEvent[]>;
	actors: string[];
}

export const NOTIFICATION_CONTEXT_KEY = Symbol('notification');
