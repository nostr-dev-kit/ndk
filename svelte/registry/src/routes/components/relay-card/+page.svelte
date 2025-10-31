<script lang="ts">
	import Demo from '$site-components/Demo.svelte';
	import { getContext } from 'svelte';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import { RelayCard } from '$lib/registry/components/relay-card';
	import { RelayCardPortrait, RelayCardCompact, RelayCardList } from '$lib/registry/components/blocks';
	import { EditProps } from '$lib/site-components/edit-props';
	import ComponentAPI from '$site-components/component-api.svelte';

	// Code examples for blocks
	import PortraitCodeRaw from './examples/portrait-code.svelte?raw';
	import CompactCodeRaw from './examples/compact-code.svelte?raw';
	import ListCodeRaw from './examples/list-code.svelte?raw';

	// UI component examples
	import BasicExample from './examples/basic.svelte';
	import BasicExampleRaw from './examples/basic.svelte?raw';
	import BuilderUsageExample from './examples/builder-usage.svelte';
	import BuilderUsageExampleRaw from './examples/builder-usage.svelte?raw';

	const ndk = getContext<NDKSvelte>('ndk');

	let exampleRelay = $state<string>('wss://relay.damus.io');

	// Sample relays for blocks - customizable via EditProps
	let relay1 = $state<string>('wss://relay.damus.io');
	let relay2 = $state<string>('wss://f7z.io');
	let relay3 = $state<string>('wss://140.f7z.io');
	let relay4 = $state<string>('wss://relay.dergigi.com');
	let relay5 = $state<string>('wss://nostr.wine');

	const displayRelays = $derived([relay1, relay2, relay3, relay4, relay5].filter(Boolean));
</script>

<div class="container mx-auto p-8 max-w-7xl">
	<!-- Header -->
	<div class="mb-12">
		<EditProps.Root>
			<EditProps.Prop name="Example Relay" type="text" bind:value={exampleRelay} />
			<EditProps.Prop name="Relay 1" type="text" bind:value={relay1} />
			<EditProps.Prop name="Relay 2" type="text" bind:value={relay2} />
			<EditProps.Prop name="Relay 3" type="text" bind:value={relay3} />
			<EditProps.Prop name="Relay 4" type="text" bind:value={relay4} />
			<EditProps.Prop name="Relay 5" type="text" bind:value={relay5} />
			<EditProps.Button>Change Sample Relays</EditProps.Button>
		</EditProps.Root>
		<div class="flex items-start justify-between gap-4 mb-4">
			<h1 class="text-4xl font-bold">RelayCard</h1>
		</div>
		<p class="text-lg text-muted-foreground">
			Composable relay display components with NIP-11 info and bookmark functionality. Build custom
			relay cards with flexible primitive components.
		</p>
	</div>

	<!-- Blocks Section -->
	<section class="mb-16">
		<h2 class="text-3xl font-bold mb-2">Blocks</h2>
		<p class="text-muted-foreground mb-8">
			Pre-composed relay card layouts ready to use. Install with a single command.
		</p>

		<div class="space-y-12">
			<!-- Portrait -->
			<Demo
				title="Portrait"
				description="Vertical card layout with icon on top. Perfect for relay grids and discovery displays."
				component="relay-card-portrait"
				code={PortraitCodeRaw}
			>
				<div class="flex gap-6 overflow-x-auto pb-4">
					{#each displayRelays as relayUrl}
						<RelayCardPortrait {ndk} {relayUrl} class="flex-none" />
					{/each}
				</div>
			</Demo>

			<!-- Compact -->
			<Demo
				title="Compact"
				description="Small square card with icon and name. Ideal for compact grids where space is limited."
				component="relay-card-compact"
				code={CompactCodeRaw}
			>
				<div class="flex gap-4 overflow-x-auto pb-4">
					{#each displayRelays as relayUrl}
						<RelayCardCompact {ndk} {relayUrl} />
					{/each}
				</div>
			</Demo>

			<!-- List -->
			<Demo
				title="List"
				description="Horizontal card layout. Perfect for relay lists and feeds with optional description."
				component="relay-card-list"
				code={ListCodeRaw}
			>
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
			</Demo>
		</div>
	</section>

	<!-- UI Components Section -->
	<section class="mb-16">
		<h2 class="text-3xl font-bold mb-2">UI Components</h2>
		<p class="text-muted-foreground mb-8">
			Primitive components for building custom relay card layouts. Compose them together to create
			your own designs.
		</p>

		<div class="space-y-8">
			<!-- Basic Usage -->
			<Demo
				title="Basic Usage"
				description="Minimal example with RelayCard.Root and essential primitives. All primitives can be composed together: Icon, Name, Url, Description, BookmarkButton, and BookmarkedBy."
				code={BasicExampleRaw}
			>
				<BasicExample {ndk} relayUrl={exampleRelay} />
			</Demo>

			<!-- Builder Usage -->
			<Demo
				title="Using the Builder"
				description="Use createBookmarkedRelayList() to create a reactive bookmarked relay list that tracks relays bookmarked by users you follow. Includes bookmark counts and toggle functionality."
				code={BuilderUsageExampleRaw}
			>
				<BuilderUsageExample {ndk} />
			</Demo>
		</div>
	</section>

	<!-- Component API -->
	<ComponentAPI
		components={[
			{
				name: 'RelayCard.Root',
				description:
					'Root container that provides context to child components. Fetches NIP-11 relay information automatically.',
				importPath: "import { RelayCard } from '$lib/registry/components/relay-card'",
				props: [
					{
						name: 'ndk',
						type: 'NDKSvelte',
						description:
							'NDK instance. Optional if NDK is available in Svelte context (from parent components).',
						required: false
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
				name: 'RelayCard.Icon',
				description: 'Display relay icon from NIP-11 metadata with fallback.',
				importPath: "import { RelayCard } from '$lib/registry/components/relay-card'",
				props: [
					{
						name: 'size',
						type: 'number',
						default: '48',
						description: 'Icon size in pixels',
						required: false
					},
					{
						name: 'class',
						type: 'string',
						description: 'Additional CSS classes',
						required: false
					}
				]
			},
			{
				name: 'RelayCard.Name',
				description: 'Display relay name from NIP-11 metadata.',
				importPath: "import { RelayCard } from '$lib/registry/components/relay-card'",
				props: [
					{
						name: 'fallback',
						type: 'string',
						default: '"Relay"',
						description: 'Fallback text when relay name is unavailable',
						required: false
					},
					{
						name: 'class',
						type: 'string',
						description: 'Additional CSS classes',
						required: false
					}
				]
			},
			{
				name: 'RelayCard.Url',
				description: 'Display relay URL with optional domain-only mode.',
				importPath: "import { RelayCard } from '$lib/registry/components/relay-card'",
				props: [
					{
						name: 'showProtocol',
						type: 'boolean',
						default: 'true',
						description: 'Show wss:// protocol prefix',
						required: false
					},
					{
						name: 'class',
						type: 'string',
						description: 'Additional CSS classes',
						required: false
					}
				]
			},
			{
				name: 'RelayCard.Description',
				description: 'Display relay description from NIP-11 metadata with line clamping.',
				importPath: "import { RelayCard } from '$lib/registry/components/relay-card'",
				props: [
					{
						name: 'maxLines',
						type: 'number',
						default: '2',
						description: 'Maximum number of lines to display',
						required: false
					},
					{
						name: 'class',
						type: 'string',
						description: 'Additional CSS classes',
						required: false
					}
				]
			},
			{
				name: 'RelayCard.BookmarkButton',
				description:
					'Toggle button for bookmarking/unbookmarking relay. Requires user authentication.',
				importPath: "import { RelayCard } from '$lib/registry/components/relay-card'",
				props: [
					{
						name: 'bookmarks',
						type: 'BookmarkedRelayListState',
						description:
							'Bookmarked relay list state from createBookmarkedRelayList. Must include current user for toggle functionality.',
						required: true
					},
					{
						name: 'size',
						type: '"sm" | "md" | "lg"',
						default: '"md"',
						description: 'Button size variant',
						required: false
					},
					{
						name: 'class',
						type: 'string',
						description: 'Additional CSS classes',
						required: false
					}
				]
			},
			{
				name: 'RelayCard.BookmarkedBy',
				description: 'Display avatars of users who have bookmarked this relay.',
				importPath: "import { RelayCard } from '$lib/registry/components/relay-card'",
				props: [
					{
						name: 'bookmarks',
						type: 'BookmarkedRelayListState',
						description: 'Bookmarked relay list state from createBookmarkedRelayList',
						required: true
					},
					{
						name: 'maxAvatars',
						type: 'number',
						default: '5',
						description: 'Maximum number of avatars to display',
						required: false
					},
					{
						name: 'avatarSize',
						type: 'number',
						default: '32',
						description: 'Avatar size in pixels',
						required: false
					},
					{
						name: 'class',
						type: 'string',
						description: 'Additional CSS classes',
						required: false
					}
				]
			},
			{
				name: 'RelayCardPortrait',
				description:
					'Preset: Vertical card with icon on top. Import from $lib/ndk/blocks for quick use.',
				importPath: "import { RelayCardPortrait } from '$lib/registry/components/blocks'",
				props: [
					{
						name: 'ndk',
						type: 'NDKSvelte',
						description: 'NDK instance',
						required: true
					},
					{
						name: 'relayUrl',
						type: 'string',
						description: 'The relay WebSocket URL',
						required: true
					},
					{
						name: 'width',
						type: 'string',
						default: '"w-[280px]"',
						description: 'Card width (Tailwind classes)',
						required: false
					},
					{
						name: 'height',
						type: 'string',
						default: '"h-[320px]"',
						description: 'Card height (Tailwind classes)',
						required: false
					},
					{
						name: 'onclick',
						type: '(e: MouseEvent) => void',
						description: 'Optional click handler',
						required: false
					}
				]
			},
			{
				name: 'RelayCardCompact',
				description:
					'Preset: Small square card with icon and name. Import from $lib/ndk/blocks.',
				importPath: "import { RelayCardCompact } from '$lib/registry/components/blocks'",
				props: [
					{
						name: 'ndk',
						type: 'NDKSvelte',
						description: 'NDK instance',
						required: true
					},
					{
						name: 'relayUrl',
						type: 'string',
						description: 'The relay WebSocket URL',
						required: true
					},
					{
						name: 'size',
						type: 'string',
						default: '"w-[160px] h-[160px]"',
						description: 'Card size (Tailwind classes)',
						required: false
					},
					{
						name: 'onclick',
						type: '(e: MouseEvent) => void',
						description: 'Optional click handler',
						required: false
					}
				]
			},
			{
				name: 'RelayCardList',
				description:
					'Preset: Horizontal list card. Import from $lib/ndk/blocks.',
				importPath: "import { RelayCardList } from '$lib/registry/components/blocks'",
				props: [
					{
						name: 'ndk',
						type: 'NDKSvelte',
						description: 'NDK instance',
						required: true
					},
					{
						name: 'relayUrl',
						type: 'string',
						description: 'The relay WebSocket URL',
						required: true
					},
					{
						name: 'showDescription',
						type: 'boolean',
						default: 'true',
						description: 'Show relay description',
						required: false
					},
					{
						name: 'compact',
						type: 'boolean',
						default: 'false',
						description: 'Compact variant with smaller icon (32px) and no URL display',
						required: false
					},
					{
						name: 'onclick',
						type: '(e: MouseEvent) => void',
						description: 'Optional click handler',
						required: false
					}
				]
			}
		]}
	/>

	<!-- Builder API -->
	<section class="mb-16">
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
