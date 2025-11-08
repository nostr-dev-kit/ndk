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
	import type { ActionInfo } from '$lib/registry/ui/notification';

	const ndk = getContext<NDKSvelte>('ndk');

	const targetPubkey = 'npub1dergggklka99wwrs92yz8wdjs952h2ux2ha2ed598ngwu9w7a6fsh9xzpc';

	const feed = createNotificationFeed(
		() => ({
			pubkey: targetPubkey,
			since: Date.now() / 1000 - 24 * 60 * 60,
			limit: 2
		}),
		ndk
	);
</script>

<div class="custom-demo">
	{#each feed.all as notification}
		<NotificationItem.Root {ndk} {notification}>
			<!-- Custom Twitter-style layout -->
			<div class="twitter-style">
				<div class="action-icon">
					{#snippet actionIcon(action: ActionInfo)}
						<svelte:component this={action.icon} size={20} class="text-primary" />
					{/snippet}
					<NotificationItem.Action snippet={actionIcon} />
				</div>

				<div class="notification-body">
					<div class="actors-line">
						<NotificationItem.Actors max={3} size={24} spacing="tight" />
						{#snippet actionText(action: ActionInfo)}
							<span class="action-text">{action.type} your post</span>
						{/snippet}
						<NotificationItem.Action snippet={actionText} />
						<NotificationItem.Timestamp />
					</div>

					<div class="content-preview">
						<NotificationItem.Content />
					</div>
				</div>
			</div>
		</NotificationItem.Root>
	{/each}
</div>

<style>
	.custom-demo {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.twitter-style {
		display: flex;
		gap: 0.75rem;
		padding: 1rem;
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		background: white;
	}

	.action-icon {
		flex-shrink: 0;
	}

	.notification-body {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.actors-line {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
	}

	.action-text {
		color: #6b7280;
	}

	.content-preview {
		margin-left: 2rem;
		padding-left: 1rem;
		border-left: 2px solid #e5e7eb;
		font-size: 0.875rem;
		color: #6b7280;
	}
</style>
