<script lang="ts">
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import type { NotificationGroup } from '$lib/registry/builders/notification/index.svelte.js';
	import * as NotificationItem from '$lib/registry/ui/notification';
	import { cn } from '$lib/registry/utils/cn';

	interface Props {
		ndk: NDKSvelte;
		notification: NotificationGroup;
		class?: string;
	}

	let { ndk, notification, class: className }: Props = $props();
</script>

<NotificationItem.Root {ndk} {notification}>
	<div data-notification-item-expanded="" class={cn('border rounded-lg p-6 space-y-4', className)}>
		<!-- Header with action and time -->
		<div class="flex items-center justify-between">
			<NotificationItem.Action />
			<NotificationItem.Timestamp />
		</div>

		<!-- Full target event -->
		<NotificationItem.Content />

		<!-- Actors list with count -->
		<div class="flex items-center gap-3">
			<NotificationItem.Actors max={10} size={36} spacing="normal" />
			<NotificationItem.Actors>
				{#snippet snippet({ count })}
					<span class="text-sm text-muted-foreground">
						{count} {count === 1 ? 'person' : 'people'}
					</span>
				{/snippet}
			</NotificationItem.Actors>
		</div>
	</div>
</NotificationItem.Root>
