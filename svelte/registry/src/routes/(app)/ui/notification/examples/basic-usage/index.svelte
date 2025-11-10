<!--
  IMPORTANT: Keep this file in sync with index.txt

  Rules for maintaining sync between index.svelte and index.txt:
  1. Both files must demonstrate the SAME functionality
  2. index.svelte = Full implementation (with TypeScript interfaces, all imports, complete styling)
  3. index.txt = Simplified documentation version with these changes:
     - Remove TypeScript interface definitions
     - Use inline prop destructuring: let { ndk, userPubkey } = $props();
     - Keep only essential imports (remove type imports unless needed)
     - Keep inline classes (class="...") but remove <style> blocks
     - Focus on showing component API usage, not implementation details
     - Keep the core component usage identical between both files

  When you modify this file, you MUST update index.txt to reflect the same changes
  following the simplification rules above.
-->
<script lang="ts">
	import { getContext } from 'svelte';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import { createNotificationFeed } from '$lib/registry/builders/notification/index.svelte';
	import * as NotificationItem from '$lib/registry/ui/notification';

	const ndk = getContext<NDKSvelte>('ndk');

	// Gigi's pubkey for demo
	const targetPubkey = '6e468422dfb74a5738702a8823b9b28168abab8655faacb6853cd0ee15deee93';

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
