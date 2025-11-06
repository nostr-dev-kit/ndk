<script lang="ts">
	import { getContext } from 'svelte';
	import type NDKSvelte from '@nostr-dev-kit/svelte';
	import BlockPageLayout from '$site-components/BlockPageLayout.svelte';
	import Demo from '$site-components/Demo.svelte';
	import SessionSwitcher from '$lib/registry/blocks/session-switcher.svelte';
	import SessionSwitcherCompact from '$lib/registry/blocks/session-switcher-compact.svelte';

	// Import code examples
	import basicExample from './examples/basic.example?raw';
	import compactExample from './examples/compact.example?raw';
	import customActionsExample from './examples/custom-actions.example?raw';
	import primitivesExample from './examples/primitives.example?raw';

	const ndk = getContext<NDKSvelte>('ndk');
</script>

<BlockPageLayout
	title="Session Switcher"
	subtitle="Dropdown menu for switching between multiple logged-in Nostr accounts. Built with bits-ui for full accessibility and keyboard navigation support."
	blockName="session-switcher"
>
	<div class="flex gap-2 flex-wrap">
		<span class="px-2.5 py-1 bg-secondary text-secondary-foreground rounded-md text-xs font-medium border border-border">Multi-account</span>
		<span class="px-2.5 py-1 bg-secondary text-secondary-foreground rounded-md text-xs font-medium border border-border">2 variants</span>
	</div>
</BlockPageLayout>

<div class="component-page">

	<section class="demo space-y-12">
		<h2 class="text-2xl font-semibold mb-4">Variants</h2>

		<Demo
			title="Full Variant"
			description="Shows avatar, display name, and truncated npub. Perfect for sidebars and headers with adequate space."
			code={basicExample}
		>
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
		</Demo>

		<Demo
			title="Compact Variant"
			description="Avatar-only variant for tight spaces. Ideal for mobile headers or space-constrained layouts."
			code={compactExample}
		>
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
		</Demo>

		<h2 class="text-2xl font-semibold mb-4 mt-12">Customization</h2>

		<Demo
			title="Custom Actions"
			description="Add custom action items to the dropdown menu with icons and callbacks."
			code={customActionsExample}
		>
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
		</Demo>

		<Demo
			title="Using Primitives"
			description="Build your own custom session switcher using the primitive components for full control."
			code={primitivesExample}
		>
			<div class="flex flex-col gap-4 items-start">
				<!-- Demo content will be rendered by the primitives example -->
			</div>
		</Demo>
	</section>

	<section class="props-section mt-12">
		<h2 class="text-2xl font-semibold mb-4">Props</h2>

		<h3 class="text-xl font-semibold mb-3 mt-6">SessionSwitcher Block</h3>
		<div class="overflow-x-auto">
			<table class="props-table">
				<thead>
					<tr>
						<th>Name</th>
						<th>Type</th>
						<th>Default</th>
						<th>Description</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td><code>ndk</code></td>
						<td><code>NDKSvelteWithSession</code></td>
						<td><span class="text-destructive">Required</span></td>
						<td>NDK instance with session management configured</td>
					</tr>
					<tr>
						<td><code>onaddsession</code></td>
						<td><code>() => void</code></td>
						<td><code>undefined</code></td>
						<td>Callback when "Add Session" is clicked</td>
					</tr>
					<tr>
						<td><code>actions</code></td>
						<td><code>Action[]</code></td>
						<td><code>[]</code></td>
						<td>Array of custom action items with label, onclick, optional icon snippet, and optional variant ("default" | "primary" | "danger")</td>
					</tr>
				</tbody>
			</table>
		</div>

		<h3 class="text-xl font-semibold mb-3 mt-6">SessionSwitcher Primitives</h3>
		<div class="overflow-x-auto">
			<table class="props-table">
				<thead>
					<tr>
						<th>Component</th>
						<th>Description</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td><code>SessionSwitcher.Root</code></td>
						<td>Wrapper component that provides context and manages dropdown state</td>
					</tr>
					<tr>
						<td><code>SessionSwitcher.Trigger</code></td>
						<td>Trigger button that shows current session. Supports <code>variant</code> prop: "full" or "compact"</td>
					</tr>
					<tr>
						<td><code>SessionSwitcher.Content</code></td>
						<td>Dropdown content container. Supports <code>align</code> and <code>sideOffset</code> props</td>
					</tr>
					<tr>
						<td><code>SessionSwitcher.Section</code></td>
						<td>Logical section with optional label. Use for grouping related items</td>
					</tr>
					<tr>
						<td><code>SessionSwitcher.Item</code></td>
						<td>Session item showing avatar, name, and npub. Requires <code>pubkey</code> prop</td>
					</tr>
					<tr>
						<td><code>SessionSwitcher.Action</code></td>
						<td>Custom action item. Supports <code>onclick</code>, <code>variant</code>, and <code>icon</code> snippet</td>
					</tr>
					<tr>
						<td><code>SessionSwitcher.Separator</code></td>
						<td>Visual separator between sections</td>
					</tr>
				</tbody>
			</table>
		</div>
	</section>

	<section class="features-section mt-12">
		<h2 class="text-2xl font-semibold mb-4">Features</h2>
		<div class="features-grid">
			<div class="feature-card">
				<h3>Built-in NDK Integration</h3>
				<p>Automatically reads sessions from NDK and handles session switching</p>
			</div>
			<div class="feature-card">
				<h3>Accessible</h3>
				<p>Built with bits-ui for full keyboard navigation and screen reader support</p>
			</div>
			<div class="feature-card">
				<h3>Multiple Variants</h3>
				<p>Full and compact variants for different layout requirements</p>
			</div>
			<div class="feature-card">
				<h3>Customizable Actions</h3>
				<p>Add custom dropdown actions with icons and callbacks</p>
			</div>
			<div class="feature-card">
				<h3>Composable</h3>
				<p>Use primitives for complete control over structure and behavior</p>
			</div>
			<div class="feature-card">
				<h3>Responsive</h3>
				<p>Adapts to different screen sizes and container widths</p>
			</div>
		</div>
	</section>

	<section class="installation-section mt-12">
		<h2 class="text-2xl font-semibold mb-4">Installation</h2>
		<div class="bg-muted p-4 rounded-lg font-mono text-sm">
			<p class="mb-2">npm install bits-ui</p>
		</div>
		<p class="mt-4 text-muted-foreground">Then copy the component code from the registry.</p>
	</section>
</div>

<style>
	.component-page {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}

	.props-table {
		width: 100%;
		border-collapse: collapse;
		border: 1px solid var(--border);
		border-radius: 0.5rem;
	}

	.props-table th,
	.props-table td {
		padding: 0.75rem 1rem;
		text-align: left;
		border-bottom: 1px solid var(--border);
	}

	.props-table th {
		background: var(--muted);
		font-weight: 600;
		font-size: 0.875rem;
	}

	.props-table td {
		font-size: 0.875rem;
	}

	.props-table code {
		background: var(--muted);
		padding: 0.125rem 0.375rem;
		border-radius: 0.25rem;
		font-size: 0.8125rem;
	}

	.features-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 1.5rem;
	}

	.feature-card {
		padding: 1.5rem;
		background: var(--muted);
		border: 1px solid var(--border);
		border-radius: 0.5rem;
	}

	.feature-card h3 {
		font-size: 1.125rem;
		font-weight: 600;
		margin-bottom: 0.5rem;
	}

	.feature-card p {
		color: var(--muted-foreground);
		font-size: 0.875rem;
	}
</style>
