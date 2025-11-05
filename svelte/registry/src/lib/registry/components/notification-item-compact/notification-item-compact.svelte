<script lang="ts">
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import type { NotificationGroup } from '$lib/registry/builders/notification';
	import * as NotificationItem from '$lib/registry/ui/notification';
	import { cn } from '$lib/registry/utils/cn.js';

	interface Props {
		ndk: NDKSvelte;
		notification: NotificationGroup;
		class?: string;
	}

	let { ndk, notification, class: className }: Props = $props();
</script>

<NotificationItem.Root {ndk} {notification}>
	<div class={cn('flex flex-col items-start gap-3 p-4 hover:bg-muted/50 transition-colors', className)}>
		<div class="flex flex-row w-full items-center">
			<div class="flex flex-row flex-1">
				<!-- Actors with avatars -->
				<NotificationItem.Actors max={3} size={24} spacing="tight" />
				<NotificationItem.Action />
			</div>
			<NotificationItem.Timestamp />
		</div>

		<NotificationItem.Content />
	</div>
</NotificationItem.Root>
