<script lang="ts">
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import { getContext } from 'svelte';
	import { cn } from '$lib/registry/utils/cn.js';
	import NotificationFeed from '$lib/registry/components/notification-feed/notification-feed.svelte';
	import * as NotificationItem from '$lib/registry/ui/notification';
	import type { NotificationGroup } from '$lib/registry/builders/notification';

	interface Props {
		ndk?: NDKSvelte;
		pubkey: string;
		class?: string;
		variant?: 'compact' | 'expanded';
	}

	let {
		ndk: ndkProp,
		pubkey,
		class: className = '',
		variant = 'compact'
	}: Props = $props();

	const ndkContext = getContext<NDKSvelte>('ndk');
	const ndk = $derived(ndkProp || ndkContext);
</script>

{#snippet expandedItem({ ndk, notification }: { ndk: NDKSvelte; notification: NotificationGroup })}
	<NotificationItem.Root {ndk} {notification}>
		<div class="p-6 border-b border-border last:border-b-0">
			<div class="flex items-center justify-between mb-4">
				<NotificationItem.Action />
				<NotificationItem.Timestamp />
			</div>

			<NotificationItem.Content class="mt-2" />

			<div class="flex items-center gap-3 mt-4 pt-4 border-t border-border">
				<NotificationItem.Actors max={8} size={36} spacing="normal" />
				{#snippet actorCount({ count })}
					<span class="text-sm text-muted-foreground">
						{count} {count === 1 ? 'person' : 'people'}
					</span>
				{/snippet}
				<NotificationItem.Actors snippet={actorCount} />
			</div>
		</div>
	</NotificationItem.Root>
{/snippet}

{#snippet compactItem({ ndk, notification }: { ndk: NDKSvelte; notification: NotificationGroup })}
	<NotificationItem.Root {ndk} {notification}>
		<div class="flex items-start gap-3 p-4 px-6 transition-colors border-b border-border last:border-b-0 hover:bg-muted">
			<NotificationItem.Actors max={3} size={32} spacing="tight" />

			<div class="flex-1 min-w-0">
				<div class="flex items-center gap-2 mb-2">
					<NotificationItem.Action />
					<NotificationItem.Timestamp />
				</div>

				<div class="mt-2">
					<NotificationItem.Content />
				</div>
			</div>
		</div>
	</NotificationItem.Root>
{/snippet}

<div class={cn('w-full max-w-[640px] bg-card border border-border rounded-xl overflow-hidden shadow-sm', className)}>
	<div class="p-4 px-6 border-b border-border bg-background">
		<h2 class="text-xl font-semibold m-0 text-foreground">Notifications</h2>
	</div>

	<div class="max-h-[600px] overflow-y-auto">
		<NotificationFeed
			{ndk}
			{pubkey}
			itemSnippet={variant === 'expanded' ? expandedItem : compactItem}
		/>
	</div>
</div>
