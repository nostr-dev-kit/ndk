<script lang="ts">
	import { getContext } from 'svelte';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import BlockPageLayout from '$site-components/BlockPageLayout.svelte';
	import Preview from '$site-components/preview.svelte';
	import NotificationPanel from '$lib/registry/blocks/notification-panel.svelte';

	// Import code examples
	import compactExample from './examples/compact.example?raw';
	import expandedExample from './examples/expanded.example?raw';

	const ndk = getContext<NDKSvelte>('ndk');

	// Gigi's pubkey for demo
	const demoPubkey = 'npub1dergggklka99wwrs92yz8wdjs952h2ux2ha2ed598ngwu9w7a6fsh9xzpc';
</script>

<BlockPageLayout
	title="Notification Panel"
	subtitle="Complete notification panel block using $metaSubscription to group interactions by target event. Shows mentions, reactions, zaps, reposts, and replies with avatar groups and embedded content. Includes scrollable body with compact or expanded layouts."
	tags={['$metaSubscription', '2 variants']}
	blockName="notification-panel"
	installCommand="npx jsrepo add notification-panel"
	code={compactExample}
>
	{#snippet topPreview()}
		<NotificationPanel {ndk} pubkey={demoPubkey} variant="compact" />
	{/snippet}
</BlockPageLayout>

<div class="max-w-7xl mx-auto px-8 pb-8">

	<!-- Variants Section -->
	<section class="mb-16">
		<h2 class="text-[1.75rem] font-bold mb-3">Variants</h2>
		<p class="text-muted-foreground mb-8 text-[1.05rem]">
			Choose between compact and expanded layouts. Compact shows horizontal layout with avatars on
			the left, while expanded shows full content with avatars below.
		</p>

		<div class="space-y-8">
			<Preview title="Expanded Layout" code={expandedExample} previewAreaClass="max-h-none">
				<NotificationPanel {ndk} pubkey={demoPubkey} variant="expanded" />
			</Preview>
		</div>
	</section>

	<!-- Props Section -->
	<section class="mb-16">
		<h2 class="text-[1.75rem] font-bold mb-6">Props</h2>

		<div class="border border-border rounded-xl overflow-hidden bg-card">
			<table class="w-full">
				<thead class="bg-muted border-b border-border">
					<tr>
						<th class="text-left py-3.5 px-4 font-semibold text-sm">Name</th>
						<th class="text-left py-3.5 px-4 font-semibold text-sm">Type</th>
						<th class="text-left py-3.5 px-4 font-semibold text-sm">Default</th>
						<th class="text-left py-3.5 px-4 font-semibold text-sm">Description</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-border">
					<tr>
						<td class="py-3 px-4 font-mono text-sm">ndk</td>
						<td class="py-3 px-4 font-mono text-sm text-muted-foreground">NDKSvelte</td>
						<td class="py-3 px-4 text-sm text-muted-foreground">context</td>
						<td class="py-3 px-4 text-sm">NDK instance (optional if provided via context)</td>
					</tr>
					<tr>
						<td class="py-3 px-4 font-mono text-sm">pubkey</td>
						<td class="py-3 px-4 font-mono text-sm text-muted-foreground">string</td>
						<td class="py-3 px-4 text-sm text-red-500">required</td>
						<td class="py-3 px-4 text-sm">Target user pubkey to show notifications for</td>
					</tr>
					<tr>
						<td class="py-3 px-4 font-mono text-sm">variant</td>
						<td class="py-3 px-4 font-mono text-sm text-muted-foreground"
							>'compact' | 'expanded'</td
						>
						<td class="py-3 px-4 font-mono text-sm text-muted-foreground">'compact'</td>
						<td class="py-3 px-4 text-sm">Layout variant for notification items</td>
					</tr>
					<tr>
						<td class="py-3 px-4 font-mono text-sm">class</td>
						<td class="py-3 px-4 font-mono text-sm text-muted-foreground">string</td>
						<td class="py-3 px-4 text-sm text-muted-foreground">-</td>
						<td class="py-3 px-4 text-sm">Additional CSS classes</td>
					</tr>
				</tbody>
			</table>
		</div>
	</section>

	<!-- Features Section -->
	<section class="mb-16">
		<h2 class="text-[1.75rem] font-bold mb-6">Features</h2>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			<div class="border border-border rounded-xl p-6 bg-card">
				<h3 class="text-lg font-semibold mb-2">Grouped Interactions</h3>
				<p class="text-muted-foreground text-sm">
					Uses $metaSubscription to automatically group interactions by target event. Shows "X, Y,
					and Z reacted" instead of separate notifications.
				</p>
			</div>

			<div class="border border-border rounded-xl p-6 bg-card">
				<h3 class="text-lg font-semibold mb-2">Avatar Groups</h3>
				<p class="text-muted-foreground text-sm">
					Displays stacked avatars of users who interacted, with prioritization for followed users
					and overflow count for large groups.
				</p>
			</div>

			<div class="border border-border rounded-xl p-6 bg-card">
				<h3 class="text-lg font-semibold mb-2">Embedded Content</h3>
				<p class="text-muted-foreground text-sm">
					Shows the actual event being interacted with using ContentRenderer and EmbeddedEvent
					components.
				</p>
			</div>

			<div class="border border-border rounded-xl p-6 bg-card">
				<h3 class="text-lg font-semibold mb-2">Real-time Updates</h3>
				<p class="text-muted-foreground text-sm">
					Automatically updates as new interactions arrive through NDK's reactive subscription
					system.
				</p>
			</div>

			<div class="border border-border rounded-xl p-6 bg-card">
				<h3 class="text-lg font-semibold mb-2">Multiple Event Types</h3>
				<p class="text-muted-foreground text-sm">
					Tracks mentions (kind 1), reactions (kind 7), zaps (kind 9735), reposts (kinds 6/16), and
					replies (kind 1111).
				</p>
			</div>

			<div class="border border-border rounded-xl p-6 bg-card">
				<h3 class="text-lg font-semibold mb-2">Scrollable Body</h3>
				<p class="text-muted-foreground text-sm">
					Fixed height container with overflow scrolling for handling large numbers of notifications
					efficiently.
				</p>
			</div>
		</div>
	</section>
</div>
