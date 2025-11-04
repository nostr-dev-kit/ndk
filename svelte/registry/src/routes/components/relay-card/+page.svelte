<script lang="ts">
	import { getContext } from 'svelte';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import RelayCardPortrait from '$lib/registry/components/relay-card/relay-card-portrait.svelte';
	import RelayCardCompact from '$lib/registry/components/relay-card/relay-card-compact.svelte';
	import RelayCardList from '$lib/registry/components/relay-card/relay-card-list.svelte';
	import { EditProps } from '$lib/site-components/edit-props';
	import ComponentsShowcase from '$site-components/ComponentsShowcase.svelte';
	import ComponentCard from '$site-components/ComponentCard.svelte';
	import ComponentPageSectionTitle from '$site-components/ComponentPageSectionTitle.svelte';
	import ComponentAPI from '$site-components/component-api.svelte';

	// UI component examples
	import BasicExample from './examples/basic.svelte';
	import BuilderUsageExample from './examples/builder-usage.svelte';

	const ndk = getContext<NDKSvelte>('ndk');

	let exampleRelay = $state<string>('wss://relay.damus.io');

	// Sample relays for blocks - customizable via EditProps
	let relay1 = $state<string>('wss://relay.damus.io');
	let relay2 = $state<string>('wss://f7z.io');
	let relay3 = $state<string>('wss://140.f7z.io');
	let relay4 = $state<string>('wss://relay.dergigi.com');
	let relay5 = $state<string>('wss://nostr.wine');

	const displayRelays = $derived([relay1, relay2, relay3, relay4, relay5].filter(Boolean));

	const portraitCardData = {
		name: 'relay-card-portrait',
		title: 'Portrait',
		description: 'Vertical relay card with icon on top.',
		richDescription: 'Vertical card layout with icon on top. Perfect for relay grids and discovery displays.',
		command: 'npx shadcn@latest add relay-card-portrait',
		apiDocs: []
	};

	const compactCardData = {
		name: 'relay-card-compact',
		title: 'Compact',
		description: 'Small square relay card.',
		richDescription: 'Small square card with icon and name. Ideal for compact grids where space is limited.',
		command: 'npx shadcn@latest add relay-card-compact',
		apiDocs: []
	};

	const listCardData = {
		name: 'relay-card-list',
		title: 'List',
		description: 'Horizontal relay card for lists.',
		richDescription: 'Horizontal card layout. Perfect for relay lists and feeds with optional description.',
		command: 'npx shadcn@latest add relay-card-list',
		apiDocs: []
	};

	const basicCardData = {
		name: 'relay-basic',
		title: 'Basic Usage',
		description: 'Minimal relay primitives example.',
		richDescription: 'Minimal example with Relay.Root and essential primitives. All primitives can be composed together: Icon, Name, Url, Description, BookmarkButton, and BookmarkedBy.',
		command: 'npx shadcn@latest add relay-card',
		apiDocs: []
	};

	const builderCardData = {
		name: 'relay-builder',
		title: 'Using the Builder',
		description: 'Bookmarked relay list builder.',
		richDescription: 'Use createBookmarkedRelayList() to create a reactive bookmarked relay list that tracks relays bookmarked by users you follow. Includes bookmark counts and toggle functionality.',
		command: 'npx shadcn@latest add relay-card',
		apiDocs: []
	};
</script>

<div class="px-8">
	<!-- Header -->
	<div class="mb-12 pt-8">
		<div class="flex items-start justify-between gap-4 mb-4">
			<h1 class="text-4xl font-bold">RelayCard</h1>
		</div>
		<p class="text-lg text-muted-foreground mb-6">
			Composable relay display components with NIP-11 info and bookmark functionality. Build custom
			relay cards with flexible primitive components.
		</p>

		<EditProps.Root>
			<EditProps.Prop name="Example Relay" type="text" bind:value={exampleRelay} />
			<EditProps.Prop name="Relay 1" type="text" bind:value={relay1} />
			<EditProps.Prop name="Relay 2" type="text" bind:value={relay2} />
			<EditProps.Prop name="Relay 3" type="text" bind:value={relay3} />
			<EditProps.Prop name="Relay 4" type="text" bind:value={relay4} />
			<EditProps.Prop name="Relay 5" type="text" bind:value={relay5} />
			<EditProps.Button>Change Sample Relays</EditProps.Button>
		</EditProps.Root>
	</div>

	<!-- ComponentsShowcase Section -->
	{#snippet portraitPreview()}
		<div class="flex gap-6 overflow-x-auto pb-4">
			{#each displayRelays as relayUrl}
				<RelayCardPortrait {ndk} {relayUrl} class="flex-none" />
			{/each}
		</div>
	{/snippet}

	{#snippet compactPreview()}
		<div class="flex gap-4 overflow-x-auto pb-4">
			{#each displayRelays as relayUrl}
				<RelayCardCompact {ndk} {relayUrl} />
			{/each}
		</div>
	{/snippet}

	{#snippet listPreview()}
		<div class="space-y-4">
			<div>
				<h3 class="text-sm font-semibold mb-2">Default</h3>
				<div class="space-y-0 border border-border rounded-lg overflow-hidden">
					{#each displayRelays.slice(0, 4) as relayUrl}
						<RelayCardList {ndk} {relayUrl} />
					{/each}
				</div>
			</div>
			<div>
				<h3 class="text-sm font-semibold mb-2">Compact</h3>
				<div class="space-y-0 border border-border rounded-lg overflow-hidden">
					{#each displayRelays.slice(0, 4) as relayUrl}
						<RelayCardList {ndk} {relayUrl} compact />
					{/each}
				</div>
			</div>
		</div>
	{/snippet}

	<ComponentPageSectionTitle
		title="Blocks"
		description="Pre-composed relay card layouts ready to use."
	/>

	<ComponentsShowcase
		class="-mx-8 px-8"
		blocks={[
			{
				name: 'Portrait',
				description: 'Vertical card with icon on top',
				command: 'npx shadcn@latest add relay-card-portrait',
				codeSnippet:
					'<span class="text-gray-500">&lt;</span><span class="text-blue-400">RelayCardPortrait</span> <span class="text-cyan-400">relayUrl</span><span class="text-gray-500">=</span><span class="text-green-400">"wss://relay.damus.io"</span> <span class="text-gray-500">/&gt;</span>',
				preview: portraitPreview,
				cardData: portraitCardData
			},
			{
				name: 'Compact',
				description: 'Small square card',
				command: 'npx shadcn@latest add relay-card-compact',
				codeSnippet:
					'<span class="text-gray-500">&lt;</span><span class="text-blue-400">RelayCardCompact</span> <span class="text-cyan-400">relayUrl</span><span class="text-gray-500">=</span><span class="text-green-400">"wss://relay.damus.io"</span> <span class="text-gray-500">/&gt;</span>',
				preview: compactPreview,
				cardData: compactCardData
			},
			{
				name: 'List',
				description: 'Horizontal list layout',
				command: 'npx shadcn@latest add relay-card-list',
				codeSnippet:
					'<span class="text-gray-500">&lt;</span><span class="text-blue-400">RelayCardList</span> <span class="text-cyan-400">relayUrl</span><span class="text-gray-500">=</span><span class="text-green-400">"wss://relay.damus.io"</span> <span class="text-gray-500">/&gt;</span>',
				preview: listPreview,
				cardData: listCardData
			}
		]}
	/>

	<!-- Components Section -->
	<ComponentPageSectionTitle title="Components" description="Explore each relay card variant in detail" />

	<section class="py-12 space-y-16">
		<ComponentCard inline data={portraitCardData}>
			{#snippet preview()}
				<div class="flex gap-6 overflow-x-auto pb-4">
					{#each displayRelays as relayUrl}
						<RelayCardPortrait {ndk} {relayUrl} class="flex-none" />
					{/each}
				</div>
			{/snippet}
		</ComponentCard>

		<ComponentCard inline data={compactCardData}>
			{#snippet preview()}
				<div class="flex gap-4 overflow-x-auto pb-4">
					{#each displayRelays as relayUrl}
						<RelayCardCompact {ndk} {relayUrl} />
					{/each}
				</div>
			{/snippet}
		</ComponentCard>

		<ComponentCard inline data={listCardData}>
			{#snippet preview()}
				<div class="space-y-4">
					<div>
						<h3 class="text-sm font-semibold mb-2">Default</h3>
						<div class="space-y-0 border border-border rounded-lg overflow-hidden">
							{#each displayRelays.slice(0, 4) as relayUrl}
								<RelayCardList {ndk} {relayUrl} />
							{/each}
						</div>
					</div>
					<div>
						<h3 class="text-sm font-semibold mb-2">Compact</h3>
						<div class="space-y-0 border border-border rounded-lg overflow-hidden">
							{#each displayRelays.slice(0, 4) as relayUrl}
								<RelayCardList {ndk} {relayUrl} compact />
							{/each}
						</div>
					</div>
				</div>
			{/snippet}
		</ComponentCard>
	</section>

	<!-- UI Primitives Section -->
	<ComponentPageSectionTitle title="UI Primitives" description="Primitive components for building custom relay card layouts" />

	<section class="py-12 space-y-16">
		<ComponentCard inline data={basicCardData}>
			{#snippet preview()}
				<BasicExample {ndk} relayUrl={exampleRelay} />
			{/snippet}
		</ComponentCard>

		<ComponentCard inline data={builderCardData}>
			{#snippet preview()}
				<BuilderUsageExample {ndk} />
			{/snippet}
		</ComponentCard>
	</section>

	<!-- Component API -->
	<ComponentAPI
		components={[
			{
				name: 'Relay.Root',
				description:
					'Root container that provides context to child components. Fetches NIP-11 relay information automatically.',
				importPath: "import { Relay } from '$lib/registry/ui/relay'",
				props: [
					{
						name: 'ndk',
						type: 'NDKSvelte',
						description:
							'NDK instance. Optional if NDK is available in Svelte context (from parent components).'
					},
					{
						name: 'relayUrl',
						type: 'string',
						description: 'The relay WebSocket URL (e.g., "wss://relay.damus.io")',
						required: true
					}
				]
			},
			{
				name: 'Relay.Icon',
				description: 'Display relay icon from NIP-11 metadata with fallback.',
				importPath: "import { Relay } from '$lib/registry/ui/relay'",
				props: [
					{
						name: 'size',
						type: 'number',
						default: '48',
						description: 'Icon size in pixels'
					},
					{
						name: 'class',
						type: 'string',
						description: 'Additional CSS classes'
					}
				]
			},
			{
				name: 'Relay.Name',
				description: 'Display relay name from NIP-11 metadata.',
				importPath: "import { Relay } from '$lib/registry/ui/relay'",
				props: [
					{
						name: 'fallback',
						type: 'string',
						default: '"Relay"',
						description: 'Fallback text when relay name is unavailable'
					},
					{
						name: 'class',
						type: 'string',
						description: 'Additional CSS classes'
					}
				]
			},
			{
				name: 'Relay.Url',
				description: 'Display relay URL with optional domain-only mode.',
				importPath: "import { Relay } from '$lib/registry/ui/relay'",
				props: [
					{
						name: 'showProtocol',
						type: 'boolean',
						default: 'true',
						description: 'Show wss:// protocol prefix'
					},
					{
						name: 'class',
						type: 'string',
						description: 'Additional CSS classes'
					}
				]
			},
			{
				name: 'Relay.Description',
				description: 'Display relay description from NIP-11 metadata with line clamping.',
				importPath: "import { Relay } from '$lib/registry/ui/relay'",
				props: [
					{
						name: 'maxLines',
						type: 'number',
						default: '2',
						description: 'Maximum number of lines to display'
					},
					{
						name: 'class',
						type: 'string',
						description: 'Additional CSS classes'
					}
				]
			}
		]}
	/>

	<!-- Builder API -->
	<section class="mt-16">
		<h2 class="text-3xl font-bold mb-4">Builder API</h2>

		<div class="space-y-6">
			<div class="border border-border rounded-lg p-6">
				<h3 class="text-xl font-semibold mb-3">createBookmarkedRelayList</h3>
				<p class="text-muted-foreground mb-4">
					Creates a reactive store that tracks relays bookmarked by a set of users. Returns a
					<code class="text-sm bg-muted px-2 py-1 rounded">BookmarkedRelayListState</code> with sorted
					relay list and bookmark counts.
				</p>

				<div class="bg-muted p-4 rounded-lg mb-4">
					<code class="text-sm">
						createBookmarkedRelayList(
						<br />
						&nbsp;&nbsp;options: () => {'{'} authors: string[], includeCurrentUser?: boolean {'}'},
						<br />
						&nbsp;&nbsp;ndk: NDKSvelte
						<br />
						): BookmarkedRelayListState
					</code>
				</div>

				<div class="space-y-3">
					<div>
						<h4 class="text-sm font-semibold mb-1">Parameters</h4>
						<ul class="space-y-2 text-sm text-muted-foreground">
							<li>
								<code class="bg-muted px-2 py-1 rounded">options</code> - Function returning configuration
								object:
								<ul class="ml-4 mt-1 space-y-1">
									<li>
										<code class="bg-muted px-1 py-0.5 rounded">authors</code>: Array of pubkeys to track
									</li>
									<li>
										<code class="bg-muted px-1 py-0.5 rounded">includeCurrentUser</code>: Include
										current user's bookmarks (enables toggle)
									</li>
								</ul>
							</li>
							<li>
								<code class="bg-muted px-2 py-1 rounded">ndk</code> - NDK instance
							</li>
						</ul>
					</div>

					<div>
						<h4 class="text-sm font-semibold mb-1">Returns</h4>
						<div class="text-sm text-muted-foreground">
							<code class="bg-muted px-2 py-1 rounded">BookmarkedRelayListState</code> with:
							<ul class="ml-4 mt-1 space-y-1">
								<li>
									<code class="bg-muted px-1 py-0.5 rounded">relays</code>: Array of {'{'}url: string,
									count: number{'}'} sorted by count
								</li>
								<li>
									<code class="bg-muted px-1 py-0.5 rounded">loading</code>: Boolean loading state
								</li>
								<li>
									<code class="bg-muted px-1 py-0.5 rounded">toggle(relay)</code>: Function to
									bookmark/unbookmark relay
								</li>
							</ul>
						</div>
					</div>

					<div>
						<h4 class="text-sm font-semibold mb-1">Example</h4>
						<div class="bg-muted p-3 rounded-lg">
							<code class="text-sm">
								const bookmarks = createBookmarkedRelayList(
								<br />
								&nbsp;&nbsp;() => ({'{'} authors: followPubkeys, includeCurrentUser: true {'}'}),
								<br />
								&nbsp;&nbsp;ndk
								<br />
								);
							</code>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>
</div>
