<script lang="ts">
	import { setContext } from 'svelte';
	import type { Snippet } from 'svelte';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import type { NotificationGroup } from '$lib/registry/builders/notification/index.svelte.js';
	import type { NotificationContext } from './notification.context';
	import { NOTIFICATION_CONTEXT_KEY } from './notification.context';
	import { cn } from '$lib/registry/utils/cn.js';

	interface Props {
		ndk: NDKSvelte;
		notification: NotificationGroup;
		class?: string;
		children: Snippet;
	}

	let { ndk, notification, class: className, children }: Props = $props();

	const context: NotificationContext = {
		get ndk() {
			return ndk;
		},
		get notification() {
			return notification;
		},
		get targetEvent() {
			return notification.targetEvent;
		},
		get interactions() {
			return notification.interactions;
		},
		get types() {
			return notification.types;
		},
		get actors() {
			return notification.actors;
		}
	};

	setContext(NOTIFICATION_CONTEXT_KEY, context);
</script>

<div class={cn('contents', className)}>
	{@render children()}
</div>
