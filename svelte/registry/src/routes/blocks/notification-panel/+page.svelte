<script lang="ts">
	import { getContext } from 'svelte';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import BlockDetailHeader from '$site-components/blocks/BlockDetailHeader.svelte';
	import BlockInstallSection from '$site-components/blocks/BlockInstallSection.svelte';
	import CodeBlock from '$site-components/CodeBlock.svelte';
	import NotificationPanel from '$lib/registry/blocks/notification-panel.svelte';

	// Import code examples
	import compactExample from './examples/compact.example?raw';
	import expandedExample from './examples/expanded.example?raw';

	const ndk = getContext<NDKSvelte>('ndk');

	// Gigi's pubkey for demo
	const demoPubkey = 'npub1dergggklka99wwrs92yz8wdjs952h2ux2ha2ed598ngwu9w7a6fsh9xzpc';
</script>

<div class="max-w-7xl mx-auto p-8">
	<BlockDetailHeader
		title="Notification Panel"
		description="Complete notification panel block using $metaSubscription to group interactions by target event. Shows mentions, reactions, zaps, reposts, and replies with avatar groups and embedded content. Includes scrollable body with compact or expanded layouts."
		icon="🔔"
		iconGradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
		badges={[{ label: '$metaSubscription', variant: 'feature' }, { label: '2 variants' }]}
	/>

	<BlockInstallSection command="npx jsrepo add notification-panel" />

	<!-- Variants Section -->
	<section class="mb-16">
		<h2 class="text-[1.75rem] font-bold mb-3">Variants</h2>
		<p class="text-muted-foreground mb-8 text-[1.05rem]">
			Choose between compact and expanded layouts. Compact shows horizontal layout with avatars on
			the left, while expanded shows full content with avatars below.
		</p>

		<!-- Variant 1: Compact -->
		<div class="bg-muted border border-border rounded-2xl overflow-hidden mb-8">
			<div class="p-6 border-b border-border">
				<h3 class="text-xl font-semibold mb-2">Compact Layout</h3>
				<p class="text-muted-foreground text-[0.95rem]">
					Horizontal layout perfect for sidebars. Shows avatars, action type, and embedded content
					preview.
				</p>
			</div>

			<div
				class="py-12 px-8 bg-background border-b border-border min-h-[500px] flex items-center justify-center"
			>
				<NotificationPanel {ndk} pubkey={demoPubkey} variant="compact" />
			</div>

			<div class="flex gap-0 bg-muted border-b border-border">
				<button
					class="py-3.5 px-6 bg-transparent border-none text-primary text-sm font-medium cursor-pointer border-b-2 border-b-primary transition-all"
					>Code</button
				>
			</div>

			<div class="bg-background overflow-x-auto">
				<CodeBlock
					lang="svelte"
					code={compactExample}
				/>
			</div>
		</div>

		<!-- Variant 2: Expanded -->
		<div class="bg-muted border border-border rounded-2xl overflow-hidden mb-8">
			<div class="p-6 border-b border-border">
				<h3 class="text-xl font-semibold mb-2">Expanded Layout</h3>
				<p class="text-muted-foreground text-[0.95rem]">
					Vertical layout with full event content. Shows action header, complete embedded event, and
					actor avatars with count below.
				</p>
			</div>

			<div
				class="py-12 px-8 bg-background border-b border-border min-h-[500px] flex items-center justify-center"
			>
				<NotificationPanel {ndk} pubkey={demoPubkey} variant="expanded" />
			</div>

			<div class="flex gap-0 bg-muted border-b border-border">
				<button
					class="py-3.5 px-6 bg-transparent border-none text-primary text-sm font-medium cursor-pointer border-b-2 border-b-primary transition-all"
					>Code</button
				>
			</div>

			<div class="bg-background overflow-x-auto">
				<CodeBlock
					lang="svelte"
					code={expandedExample}
				/>
			</div>
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
