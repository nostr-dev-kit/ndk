<script lang="ts">
	import { getContext } from 'svelte';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import ComponentPageTemplate from '$lib/site/templates/ComponentPageTemplate.svelte';
	import Preview from '$site-components/preview.svelte';
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

<!-- Custom sections with examples -->
{#snippet customSections()}
	<section class="mt-16">
		<h2 class="text-3xl font-bold mb-4">Builder Pattern</h2>
		<p class="text-muted-foreground mb-6">
			The <code class="px-2 py-1 bg-muted rounded text-sm">createNotificationFeed()</code> builder aggregates and categorizes notifications.
			This is a teaching example, not an installable component.
		</p>

		<Preview code={notificationBuilderCode}>
			{@render builderPreview()}
		</Preview>
	</section>

	<section class="mt-16">
		<h2 class="text-3xl font-bold mb-4">UI Primitives</h2>
		<p class="text-muted-foreground mb-6">
			Compose notification displays using UI primitives.
			This is a teaching example showing how to build custom layouts.
		</p>

		<Preview code={notificationPrimitivesCode}>
			{@render primitivesPreview()}
		</Preview>
	</section>
{/snippet}

<!-- Use the template -->
<ComponentPageTemplate
	{metadata}
	{ndk}
	{customSections}
/>
