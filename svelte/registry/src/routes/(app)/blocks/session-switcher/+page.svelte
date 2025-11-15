<script lang="ts">
	import type { NDKSvelteWithSession } from '@nostr-dev-kit/svelte';
	import { ndk } from '$lib/site/ndk.svelte';
	import BlockPageLayout from '$site-components/BlockPageLayout.svelte';
	import Preview from '$site-components/preview.svelte';
	import SessionSwitcher from '$lib/registry/blocks/session-switcher.svelte';
	import SessionSwitcherCompact from '$lib/registry/blocks/session-switcher-compact.svelte';

	// Import code examples
	import basicExample from './examples/basic.example?raw';
	import compactExample from './examples/compact.example?raw';
	import customActionsExample from './examples/custom-actions.example?raw';
	import primitivesExample from './examples/primitives.example?raw';

</script>

<BlockPageLayout
	title="Session Switcher"
	subtitle="Dropdown menu for switching between multiple logged-in Nostr accounts. Built with bits-ui for full accessibility and keyboard navigation support."
	tags={['Multi-account', '2 variants']}
>
	{#snippet topPreview()}
		<Preview title="Session Switcher" code={basicExample} previewAreaClass="max-h-none">
			<div class="flex flex-col gap-4 items-start">
				<SessionSwitcher
					{ndk}
					onaddsession={() => alert('Add session clicked')}
					actions={[
						{
							label: 'Settings',
							onclick: () => alert('Settings clicked')
						},
						{
							label: 'Logout',
							onclick: () => alert('Logout clicked'),
							variant: 'danger'
						}
					]}
				/>
			</div>
		</Preview>
	{/snippet}
</BlockPageLayout>

<div class="max-w-7xl mx-auto px-8 pb-8">

	<section class="mb-16 space-y-8">
		<div>
			<h2 class="text-[1.75rem] font-bold mb-3">Variants</h2>
			<p class="text-muted-foreground mb-8 text-[1.05rem]">
				Choose between full and compact variants based on your layout requirements.
			</p>
		</div>

		<Preview title="Compact Variant" code={compactExample}>
			<div class="flex gap-4">
				<SessionSwitcherCompact
					{ndk}
					onaddsession={() => alert('Add session clicked')}
					actions={[
						{
							label: 'Logout',
							onclick: () => alert('Logout clicked'),
							variant: 'danger'
						}
					]}
				/>
			</div>
		</Preview>
	</section>

	<section class="mb-16 space-y-8">
		<div>
			<h2 class="text-[1.75rem] font-bold mb-3">Customization</h2>
			<p class="text-muted-foreground mb-8 text-[1.05rem]">
				Add custom actions and use primitives for full control.
			</p>
		</div>

		<Preview title="Custom Actions" code={customActionsExample}>
			<div class="flex flex-col gap-4 items-start">
				<SessionSwitcher
					{ndk}
					onaddsession={() => alert('Add session')}
					actions={[
						{
							label: 'Profile',
							onclick: () => alert('Profile clicked')
						},
						{
							label: 'Settings',
							onclick: () => alert('Settings clicked')
						},
						{
							label: 'Relays',
							onclick: () => alert('Relays clicked')
						},
						{
							label: 'Logout',
							onclick: () => alert('Logout clicked'),
							variant: 'danger'
						}
					]}
				/>
			</div>
		</Preview>

		<Preview title="Using Primitives" code={primitivesExample}>
			<div class="flex flex-col gap-4 items-start">
				<!-- Demo content will be rendered by the primitives example -->
			</div>
		</Preview>
	</section>

	<!-- Component API Section -->
	<section class="mb-16">
		<h2 class="text-[1.75rem] font-bold mb-6">Component API</h2>

		<h3 class="text-lg font-semibold mb-4 text-foreground">SessionSwitcher Block</h3>
		<table class="w-full bg-muted border border-border rounded-xl overflow-hidden border-collapse mb-8">
			<thead>
				<tr>
					<th class="bg-accent py-3.5 px-5 text-left text-sm font-semibold border-b border-border text-muted-foreground">Prop</th>
					<th class="bg-accent py-3.5 px-5 text-left text-sm font-semibold border-b border-border text-muted-foreground">Type</th>
					<th class="bg-accent py-3.5 px-5 text-left text-sm font-semibold border-b border-border text-muted-foreground">Default</th>
					<th class="bg-accent py-3.5 px-5 text-left text-sm font-semibold border-b border-border text-muted-foreground">Description</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td class="p-4 border-b border-border text-sm"><code class="bg-primary/10 py-1 px-2 rounded font-mono text-[0.85em] text-primary">ndk</code></td>
					<td class="p-4 border-b border-border text-sm"><code class="bg-primary/10 py-1 px-2 rounded font-mono text-[0.85em] text-primary">NDKSvelteWithSession</code></td>
					<td class="p-4 border-b border-border text-sm">—</td>
					<td class="p-4 border-b border-border text-sm">NDK instance with session management configured</td>
				</tr>
				<tr>
					<td class="p-4 border-b border-border text-sm"><code class="bg-primary/10 py-1 px-2 rounded font-mono text-[0.85em] text-primary">onaddsession</code></td>
					<td class="p-4 border-b border-border text-sm"><code class="bg-primary/10 py-1 px-2 rounded font-mono text-[0.85em] text-primary">() => void</code></td>
					<td class="p-4 border-b border-border text-sm"><code class="bg-primary/10 py-1 px-2 rounded font-mono text-[0.85em] text-primary">undefined</code></td>
					<td class="p-4 border-b border-border text-sm">Callback when "Add Session" is clicked</td>
				</tr>
				<tr>
					<td class="p-4 border-b-0 text-sm"><code class="bg-primary/10 py-1 px-2 rounded font-mono text-[0.85em] text-primary">actions</code></td>
					<td class="p-4 border-b-0 text-sm"><code class="bg-primary/10 py-1 px-2 rounded font-mono text-[0.85em] text-primary">Action[]</code></td>
					<td class="p-4 border-b-0 text-sm"><code class="bg-primary/10 py-1 px-2 rounded font-mono text-[0.85em] text-primary">[]</code></td>
					<td class="p-4 border-b-0 text-sm">Array of custom action items with label, onclick, optional icon snippet, and optional variant</td>
				</tr>
			</tbody>
		</table>

		<h3 class="text-lg font-semibold mb-4 text-foreground">SessionSwitcher Primitives</h3>
		<table class="w-full bg-muted border border-border rounded-xl overflow-hidden border-collapse">
			<thead>
				<tr>
					<th class="bg-accent py-3.5 px-5 text-left text-sm font-semibold border-b border-border text-muted-foreground">Component</th>
					<th class="bg-accent py-3.5 px-5 text-left text-sm font-semibold border-b border-border text-muted-foreground">Description</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td class="p-4 border-b border-border text-sm"><code class="bg-primary/10 py-1 px-2 rounded font-mono text-[0.85em] text-primary">SessionSwitcher.Root</code></td>
					<td class="p-4 border-b border-border text-sm">Wrapper component that provides context and manages dropdown state</td>
				</tr>
				<tr>
					<td class="p-4 border-b border-border text-sm"><code class="bg-primary/10 py-1 px-2 rounded font-mono text-[0.85em] text-primary">SessionSwitcher.Trigger</code></td>
					<td class="p-4 border-b border-border text-sm">Trigger button that shows current session. Supports variant prop: "full" or "compact"</td>
				</tr>
				<tr>
					<td class="p-4 border-b border-border text-sm"><code class="bg-primary/10 py-1 px-2 rounded font-mono text-[0.85em] text-primary">SessionSwitcher.Content</code></td>
					<td class="p-4 border-b border-border text-sm">Dropdown content container. Supports align and sideOffset props</td>
				</tr>
				<tr>
					<td class="p-4 border-b border-border text-sm"><code class="bg-primary/10 py-1 px-2 rounded font-mono text-[0.85em] text-primary">SessionSwitcher.Section</code></td>
					<td class="p-4 border-b border-border text-sm">Logical section with optional label. Use for grouping related items</td>
				</tr>
				<tr>
					<td class="p-4 border-b border-border text-sm"><code class="bg-primary/10 py-1 px-2 rounded font-mono text-[0.85em] text-primary">SessionSwitcher.Item</code></td>
					<td class="p-4 border-b border-border text-sm">Session item showing avatar, name, and npub. Requires pubkey prop</td>
				</tr>
				<tr>
					<td class="p-4 border-b border-border text-sm"><code class="bg-primary/10 py-1 px-2 rounded font-mono text-[0.85em] text-primary">SessionSwitcher.Action</code></td>
					<td class="p-4 border-b border-border text-sm">Custom action item. Supports onclick, variant, and icon snippet</td>
				</tr>
				<tr>
					<td class="p-4 border-b-0 text-sm"><code class="bg-primary/10 py-1 px-2 rounded font-mono text-[0.85em] text-primary">SessionSwitcher.Separator</code></td>
					<td class="p-4 border-b-0 text-sm">Visual separator between sections</td>
				</tr>
			</tbody>
		</table>
	</section>

	<!-- Features Section -->
	<section class="mb-16">
		<h2 class="text-[1.75rem] font-bold mb-6">Key Features</h2>
		<div class="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6">
			<div class="bg-muted border border-border rounded-xl p-6">
				<h3 class="text-lg font-semibold mb-3 text-foreground">🔌 Built-in NDK Integration</h3>
				<p class="text-muted-foreground text-sm leading-relaxed m-0">Automatically reads sessions from NDK and handles session switching</p>
			</div>
			<div class="bg-muted border border-border rounded-xl p-6">
				<h3 class="text-lg font-semibold mb-3 text-foreground">♿ Accessible</h3>
				<p class="text-muted-foreground text-sm leading-relaxed m-0">Built with bits-ui for full keyboard navigation and screen reader support</p>
			</div>
			<div class="bg-muted border border-border rounded-xl p-6">
				<h3 class="text-lg font-semibold mb-3 text-foreground">🎨 Multiple Variants</h3>
				<p class="text-muted-foreground text-sm leading-relaxed m-0">Full and compact variants for different layout requirements</p>
			</div>
			<div class="bg-muted border border-border rounded-xl p-6">
				<h3 class="text-lg font-semibold mb-3 text-foreground">⚙️ Customizable Actions</h3>
				<p class="text-muted-foreground text-sm leading-relaxed m-0">Add custom dropdown actions with icons and callbacks</p>
			</div>
			<div class="bg-muted border border-border rounded-xl p-6">
				<h3 class="text-lg font-semibold mb-3 text-foreground">🧩 Composable</h3>
				<p class="text-muted-foreground text-sm leading-relaxed m-0">Use primitives for complete control over structure and behavior</p>
			</div>
			<div class="bg-muted border border-border rounded-xl p-6">
				<h3 class="text-lg font-semibold mb-3 text-foreground">📱 Responsive</h3>
				<p class="text-muted-foreground text-sm leading-relaxed m-0">Adapts to different screen sizes and container widths</p>
			</div>
		</div>
	</section>
</div>
