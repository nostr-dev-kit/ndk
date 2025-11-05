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
		<div class="notification-item-expanded">
			<div class="notification-header">
				<NotificationItem.Action />
				<NotificationItem.Timestamp />
			</div>

			<NotificationItem.Content class="notification-content" />

			<div class="notification-footer">
				<NotificationItem.Actors max={8} size={36} spacing="normal" />
				{#snippet actorCount({ count })}
					<span class="actor-count">
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
		<div class="notification-item-compact">
			<NotificationItem.Actors max={3} size={32} spacing="tight" />

			<div class="notification-details">
				<div class="notification-action-row">
					<NotificationItem.Action />
					<NotificationItem.Timestamp />
				</div>

				<div class="notification-content">
					<NotificationItem.Content />
				</div>
			</div>
		</div>
	</NotificationItem.Root>
{/snippet}

<div class={cn('notification-panel', className)}>
	<div class="panel-header">
		<h2>Notifications</h2>
	</div>

	<div class="panel-body">
		<NotificationFeed
			{ndk}
			{pubkey}
			itemSnippet={variant === 'expanded' ? expandedItem : compactItem}
		/>
	</div>
</div>

<style>
	.notification-panel {
		width: 100%;
		max-width: 640px;
		background: var(--card);
		border: 1px solid var(--border);
		border-radius: 0.75rem;
		overflow: hidden;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.panel-header {
		padding: 1rem 1.5rem;
		border-bottom: 1px solid var(--border);
		background: var(--background);
	}

	.panel-header h2 {
		font-size: 1.25rem;
		font-weight: 600;
		margin: 0;
		color: var(--foreground);
	}

	.panel-body {
		max-height: 600px;
		overflow-y: auto;
	}

	.notification-item-compact {
		display: flex;
		align-items: start;
		gap: 0.75rem;
		padding: 1rem 1.5rem;
		transition: background-color 0.15s;
		border-bottom: 1px solid var(--border);
	}

	.notification-item-compact:last-child {
		border-bottom: none;
	}

	.notification-item-compact:hover {
		background: var(--muted);
	}

	.notification-details {
		flex: 1;
		min-width: 0;
	}

	.notification-action-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
	}

	.notification-content {
		margin-top: 0.5rem;
	}

	.notification-item-expanded {
		padding: 1.5rem;
		border-bottom: 1px solid var(--border);
	}

	.notification-item-expanded:last-child {
		border-bottom: none;
	}

	.notification-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1rem;
	}

	.notification-footer {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px solid var(--border);
	}

	.actor-count {
		font-size: 0.875rem;
		color: var(--muted-foreground);
	}
</style>
