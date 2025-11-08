<script lang="ts">
	import { getContext } from 'svelte';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import ComponentPageTemplate from '$lib/site/templates/ComponentPageTemplate.svelte';
	import { EditProps } from '$lib/site/components/edit-props';
	import * as NotificationItem from '$lib/registry/ui/notification';
	import { createNotificationFeed } from '$lib/registry/builders/notification/index.svelte';

	// Import code examples
	import notificationBuilderCode from './examples/builder/index.txt?raw';
	import notificationPrimitivesCode from './examples/primitives/index.txt?raw';

	// Page metadata
	const metadata = {
		title: 'Notification System',
		description: 'Real-time notification feed with builders and UI primitives'
	};

	// Card data for showcase components
	const notificationBuilderCard = {
		name: 'notification-builder',
		title: 'Notification Feed Builder',
		description: 'Create notification feeds with createNotificationFeed()',
		command: 'npx jsrepo add notification/builder',
		dependencies: ['@nostr-dev-kit/svelte', '@nostr-dev-kit/ndk'],
		apiDocs: []
	};

	const notificationPrimitivesCard = {
		name: 'notification-primitives',
		title: 'Notification UI Primitives',
		description: 'Composable notification display components',
		command: 'npx jsrepo add notification/ui',
		dependencies: ['@nostr-dev-kit/svelte', '@nostr-dev-kit/ndk'],
		apiDocs: []
	};

	const ndk = getContext<NDKSvelte>('ndk');

	// Default to Gigi's pubkey for demo purposes
	let targetPubkey = $state(
		'6e468422dfb74a5738702a8823b9b28168abab8655faacb6853cd0ee15deee93'
	);
</script>

<!-- Preview snippets for showcase -->
{#snippet builderPreview()}
	<div class="space-y-4">
		<EditProps.Root>
			<EditProps.Prop
				name="Target User"
				type="user"
				default={targetPubkey}
				bind:value={targetPubkey}
			/>
		</EditProps.Root>

		{#if targetPubkey}
			{@const feed = createNotificationFeed(() => ({
				pubkey: targetPubkey,
				since: Date.now() / 1000 - 24 * 60 * 60
			}), ndk)}
			<div class="p-4 border rounded-lg bg-muted/50">
				<div class="space-y-2 text-sm">
					<div>
						<span class="font-semibold">Total:</span>
						{feed.count} notifications
					</div>
					<div>
						<span class="font-semibold">Reactions:</span>
						{feed.byType.reactions.length}
					</div>
					<div>
						<span class="font-semibold">Zaps:</span>
						{feed.byType.zaps.length}
					</div>
					<div>
						<span class="font-semibold">Reposts:</span>
						{feed.byType.reposts.length}
					</div>
					<div>
						<span class="font-semibold">Replies:</span>
						{feed.byType.replies.length}
					</div>
					<div>
						<span class="font-semibold">Loading:</span>
						{feed.loading ? 'Yes' : 'No'}
					</div>
				</div>
			</div>
		{/if}
	</div>
{/snippet}

{#snippet primitivesPreview()}
	<div class="space-y-4">
		<EditProps.Root>
			<EditProps.Prop
				name="Target User"
				type="user"
				default={targetPubkey}
				bind:value={targetPubkey}
			/>
		</EditProps.Root>

		{#if targetPubkey}
			{@const feed = createNotificationFeed(() => ({
				pubkey: targetPubkey,
				since: Date.now() / 1000 - 24 * 60 * 60,
				limit: 3
			}), ndk)}
			<div class="space-y-3">
				{#each feed.all.slice(0, 1) as notification}
					<NotificationItem.Root {ndk} {notification}>
						<div class="border rounded-lg p-4 space-y-3">
							<div class="flex items-center justify-between">
								<NotificationItem.Action />
								<NotificationItem.Timestamp />
							</div>
							<NotificationItem.Content />
							<div class="flex items-center gap-3">
								<NotificationItem.Actors max={5} />
							</div>
						</div>
					</NotificationItem.Root>
				{/each}
			</div>
		{/if}
	</div>
{/snippet}

<!-- Use the template -->
<ComponentPageTemplate
	{metadata}
	{ndk}
	showcaseComponents={[
		{
   id: "notificationBuilderCard",
			cardData: notificationBuilderCard,
			preview: builderPreview,
			code: notificationBuilderCode,
			orientation: 'vertical'
		},
		{
   id: "notificationPrimitivesCard",
			cardData: notificationPrimitivesCard,
			preview: primitivesPreview,
			code: notificationPrimitivesCode,
			orientation: 'vertical'
		}
	]}
/>
