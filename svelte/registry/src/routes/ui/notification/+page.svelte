<script lang="ts">
	import { getContext } from 'svelte';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import Demo from '$site-components/Demo.svelte';
	import ApiTable from '$site-components/api-table.svelte';

	import Basic from './examples/basic.example.svelte';
	import BasicRaw from './examples/basic.example.svelte?raw';
	import CustomLayout from './examples/custom-layout.example.svelte';
	import CustomLayoutRaw from './examples/custom-layout.example.svelte?raw';

	const ndk = getContext<NDKSvelte>('ndk');
</script>

<svelte:head>
	<title>Notification Primitives - NDK Svelte</title>
	<meta
		name="description"
		content="Composable primitives for building notification UIs. Uses $metaSubscription to group interactions by target event."
	/>
</svelte:head>

<div class="component-page">
	<header>
		<div class="header-badge">
			<span class="badge">UI Primitive</span>
			<span class="badge badge-feature">$metaSubscription</span>
		</div>
		<div class="header-title">
			<h1>NotificationItem</h1>
		</div>
		<p class="header-description">
			Composable primitives for building notification UIs. Uses NDK's $metaSubscription to
			automatically group interactions (reactions, zaps, reposts, replies) by target event,
			providing a clean API for displaying "X, Y, and Z reacted to your post" style notifications.
		</p>
		<div class="header-info">
			<div class="info-card">
				<strong>Composable</strong>
				<span>Mix and match primitives</span>
			</div>
			<div class="info-card">
				<strong>Context-based</strong>
				<span>Root + children pattern</span>
			</div>
			<div class="info-card">
				<strong>Grouped</strong>
				<span>Interactions by target event</span>
			</div>
		</div>
	</header>

	<section class="installation">
		<h2>Installation</h2>
		<pre><code>npx jsrepo add notification</code></pre>
	</section>

	<section class="demos">
		<h2>Examples</h2>

		<Demo title="Basic Usage" code={BasicRaw}>
			<Basic />
		</Demo>

		<Demo title="Custom Layout" code={CustomLayoutRaw}>
			<CustomLayout />
		</Demo>
	</section>

	<section class="api">
		<h2>API Reference</h2>

		<h3>NotificationItem.Root</h3>
		<p>Context provider that sets up notification data for child primitives.</p>
		<ApiTable
			props={[
				{ name: 'ndk', type: 'NDKSvelte', required: true, description: 'NDK instance' },
				{
					name: 'notification',
					type: 'NotificationGroup',
					required: true,
					description: 'Notification group from createNotificationFeed'
				},
				{ name: 'class', type: 'string', description: 'Additional CSS classes' }
			]}
		/>

		<h3>NotificationItem.Actors</h3>
		<p>
			Shows avatars of users who interacted. Uses AvatarGroup internally. Supports custom snippet
			for advanced layouts.
		</p>
		<ApiTable
			props={[
				{
					name: 'max',
					type: 'number',
					default: '5',
					description: 'Maximum avatars before showing overflow'
				},
				{ name: 'size', type: 'number', default: '32', description: 'Avatar size in pixels' },
				{
					name: 'spacing',
					type: "'tight' | 'normal' | 'loose'",
					default: "'tight'",
					description: 'Spacing between avatars'
				},
				{
					name: 'snippet',
					type: 'Snippet<[{ pubkeys: string[], count: number }]>',
					description: 'Custom render snippet for full control'
				}
			]}
		/>

		<h3>NotificationItem.Action</h3>
		<p>
			Shows interaction type (reacted, zapped, reposted, replied) with icon and count. Supports
			custom snippet.
		</p>
		<ApiTable
			props={[
				{
					name: 'snippet',
					type: 'Snippet<[{ type: string, count: number, icon: Component }]>',
					description: 'Custom render snippet for full control'
				}
			]}
		/>

		<h3>NotificationItem.Content</h3>
		<p>
			Renders the embedded event being interacted with using ContentRenderer and EmbeddedEvent.
		</p>
		<ApiTable
			props={[
				{
					name: 'renderer',
					type: 'ContentRenderer',
					description: 'Custom content renderer (optional, has sensible defaults)'
				},
				{
					name: 'snippet',
					type: 'Snippet<[{ event: NDKEvent }]>',
					description: 'Custom render snippet for full control'
				},
				{ name: 'class', type: 'string', description: 'Additional CSS classes' }
			]}
		/>

		<h3>NotificationItem.Timestamp</h3>
		<p>
			Shows relative time of most recent interaction using createTimeAgo. Updates every minute.
		</p>
		<ApiTable
			props={[
				{
					name: 'snippet',
					type: 'Snippet<[{ timestamp: number, formatted: string }]>',
					description: 'Custom render snippet for full control'
				},
				{ name: 'class', type: 'string', description: 'Additional CSS classes' }
			]}
		/>
	</section>
</div>
