<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import type { NotificationGroup } from '$lib/registry/builders/notification';
	import { createNotificationFeed } from '$lib/registry/builders/notification';
	import NotificationItemCompact from '$lib/registry/components/notification-item-compact/notification-item-compact.svelte';
	import { cn } from '$lib/registry/utils/cn.js';

	interface Props {
		ndk: NDKSvelte;
		pubkey: string;
		kinds?: number[];
		since?: number;
		sort?: 'time' | 'count' | 'tag-time' | 'unique-authors';
		limit?: number;
		itemSnippet?: Snippet<[{ ndk: NDKSvelte; notification: NotificationGroup }]>;
		emptySnippet?: Snippet;
		class?: string;
	}

	let {
		ndk,
		pubkey,
		kinds,
		since,
		sort,
		limit,
		itemSnippet,
		emptySnippet,
		class: className
	}: Props = $props();

	const feed = createNotificationFeed(() => ({
		pubkey,
		kinds,
		since,
		sort,
		limit
	}), ndk);
</script>

<div data-notification-feed="" data-loading={feed.loading ? '' : undefined} data-empty={feed.all.length === 0 ? '' : undefined} class={cn('notification-feed', className)}>
	{#if feed.loading && feed.all.length === 0}
		<div class="p-8 text-center text-muted-foreground">
			<p>Loading notifications...</p>
		</div>
	{:else if feed.all.length === 0}
		{#if emptySnippet}
			{@render emptySnippet()}
		{:else}
			<div class="p-8 text-center text-muted-foreground">
				<p>No notifications yet</p>
			</div>
		{/if}
	{:else}
		{#each feed.all as notification (notification.targetEvent.id)}
			{#if itemSnippet}
				{@render itemSnippet({ ndk, notification })}
			{:else}
				<NotificationItemCompact {ndk} {notification} />
			{/if}
		{/each}
	{/if}
</div>
