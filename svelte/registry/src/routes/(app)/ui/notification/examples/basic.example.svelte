<script lang="ts">
	import { getContext } from 'svelte';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import { createNotificationFeed } from '@nostr-dev-kit/svelte';
	import * as NotificationItem from '$lib/registry/ui/notification';

	const ndk = getContext<NDKSvelte>('ndk');

	// Gigi's pubkey for demo
	const targetPubkey = 'npub1dergggklka99wwrs92yz8wdjs952h2ux2ha2ed598ngwu9w7a6fsh9xzpc';

	const feed = createNotificationFeed(
		() => ({
			pubkey: targetPubkey,
			since: Date.now() / 1000 - 24 * 60 * 60,
			limit: 3
		}),
		ndk
	);
</script>

<div class="notification-demo">
	{#each feed.all as notification}
		<NotificationItem.Root {ndk} {notification}>
			<div class="notification-card">
				<div class="notification-header">
					<NotificationItem.Action />
					<NotificationItem.Timestamp />
				</div>

				<NotificationItem.Content class="notification-content" />

				<div class="notification-footer">
					<NotificationItem.Actors max={5} size={28} />
				</div>
			</div>
		</NotificationItem.Root>
	{/each}
</div>

<style>
	.notification-demo {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.notification-card {
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		padding: 1rem;
		background: white;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.notification-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.notification-footer {
		padding-top: 0.75rem;
		border-top: 1px solid #e5e7eb;
	}
</style>
