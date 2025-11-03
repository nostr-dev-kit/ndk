<script lang="ts">
	import { getContext } from 'svelte';
	import { NDKFollowPack, NDKKind } from '@nostr-dev-kit/ndk';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import FollowPackPortrait from '$lib/registry/components/follow-pack/follow-pack-portrait.svelte';
	import FollowPackHero from '$lib/registry/components/follow-pack/follow-pack-hero.svelte';
	import FollowPackCompact from '$lib/registry/components/follow-pack/follow-pack-compact.svelte';
	import FollowPackListItem from '$lib/registry/components/follow-pack/follow-pack-list-item.svelte';
	import { EditProps } from '$lib/site-components/edit-props';
	import Demo from '$site-components/Demo.svelte';
	import ComponentAPI from '$site-components/component-api.svelte';
	import ComponentsShowcase from '$site-components/ComponentsShowcase.svelte';
	import * as ComponentAnatomy from '$site-components/component-anatomy';
	import { FollowPack } from '$lib/registry/ui/follow-pack';
	import ComponentPageSectionTitle from '$site-components/ComponentPageSectionTitle.svelte';

	import PortraitCodeRaw from './examples/portrait-code.svelte?raw';
	import HeroCodeRaw from './examples/hero-code.svelte?raw';
	import CompactCodeRaw from './examples/compact-code.svelte?raw';
	import ListItemCodeRaw from './examples/list-item-code.svelte?raw';

	import UIBasicRaw from './examples/ui-basic.svelte?raw';
	import UIFullRaw from './examples/ui-full.svelte?raw';

	const ndk = getContext<NDKSvelte>('ndk');

	let followPacks = $state<NDKFollowPack[]>([]);
	let pack1 = $state<NDKFollowPack | undefined>();
	let pack2 = $state<NDKFollowPack | undefined>();
	let pack3 = $state<NDKFollowPack | undefined>();
	let pack4 = $state<NDKFollowPack | undefined>();
	let pack5 = $state<NDKFollowPack | undefined>();

	$effect(() => {
		(async () => {
			const fetched = await ndk.fetchEvents({
				kinds: [NDKKind.FollowPack],
				limit: 10
			});
			const packs = Array.from(fetched).map((e) => NDKFollowPack.from(e));
			followPacks = packs;

			if (packs.length > 0) {
				if (!pack1) pack1 = packs[0];
				if (!pack2 && packs.length > 1) pack2 = packs[1];
				if (!pack3 && packs.length > 2) pack3 = packs[2];
				if (!pack4 && packs.length > 3) pack4 = packs[3];
				if (!pack5 && packs.length > 4) pack5 = packs[4];
			}
		})();
	});

	const displayPacks = $derived(
		[pack1, pack2, pack3, pack4, pack5].filter(Boolean) as NDKFollowPack[]
	);

	// Anatomy layer data
	const anatomyLayers: Record<string, ComponentAnatomy.AnatomyLayer> = {
		image: {
			id: 'image',
			label: 'FollowPack.Image',
			description: 'Displays the follow pack image. Automatically handles missing images with a fallback icon. Supports gradient overlays for better text readability.',
			props: ['class', 'showGradient', 'fallback']
		},
		title: {
			id: 'title',
			label: 'FollowPack.Title',
			description: 'Displays the follow pack title. Shows "Untitled Pack" if no title is set. Supports line clamping for overflow control.',
			props: ['class', 'lines']
		},
		description: {
			id: 'description',
			label: 'FollowPack.Description',
			description: 'Displays the follow pack description. Automatically hidden if no description exists. Supports both character truncation and line clamping.',
			props: ['class', 'maxLength', 'lines']
		},
		memberCount: {
			id: 'memberCount',
			label: 'FollowPack.MemberCount',
			description: 'Displays the number of people in the follow pack. Counts the pubkeys array from the event. Supports both short (number only) and long (formatted with "people") formats.',
			props: ['class', 'format']
		}
	};
</script>

<div class="container mx-auto p-8 max-w-7xl">
	<!-- Header -->
	<div class="mb-12">
		
		<div class="flex items-start justify-between gap-4 mb-4">
			<h1 class="text-4xl font-bold">FollowPack</h1>
			{#key followPacks}
				<EditProps.Root>
					<EditProps.Prop name="Pack 1" type="event" bind:value={pack1} options={followPacks} />
					<EditProps.Prop name="Pack 2" type="event" bind:value={pack2} options={followPacks} />
					<EditProps.Prop name="Pack 3" type="event" bind:value={pack3} options={followPacks} />
					<EditProps.Prop name="Pack 4" type="event" bind:value={pack4} options={followPacks} />
					<EditProps.Prop name="Pack 5" type="event" bind:value={pack5} options={followPacks} />
					<EditProps.Button>Change Sample Packs</EditProps.Button>
				</EditProps.Root>
			{/key}
		</div>
		<p class="text-lg text-muted-foreground">
			Display curated lists of people (kind 39089). Follow packs are collections of users grouped
			by topic, interest, or community. Perfect for showcasing recommended follows, team members, or
			thematic user lists.
		</p>
	</div>

	<!-- Blocks Showcase Section -->
	{#if displayPacks.length > 0}
		{#snippet heroPreview()}
			{#if pack1}
				<div class="min-w-[800px]">
					<FollowPackHero {ndk} followPack={pack1} />
				</div>
			{/if}
		{/snippet}

		{#snippet portraitPreview()}
			{#if pack1}
				<FollowPackPortrait {ndk} followPack={pack1} />
			{/if}
		{/snippet}

		{#snippet compactPreview()}
			{#if pack1}
				<div class="w-full max-w-3xl">
					<FollowPackCompact {ndk} followPack={pack1} />
				</div>
			{/if}
		{/snippet}

		{#snippet listItemPreview()}
			<div class="space-y-2 max-w-2xl">
				{#each displayPacks.slice(0, 4) as pack}
					<FollowPackListItem {ndk} followPack={pack} />
				{/each}
			</div>
		{/snippet}

		<ComponentsShowcase
			description="Beautifully crafted variants. Each optimized for its purpose. Choose the perfect presentation for your content."
			blocks={[
				{
					name: 'Hero',
					description: 'Featured display with full-bleed imagery. Perfect for landing pages and hero sections.',
					command: 'npx shadcn@latest add follow-pack-hero',
					codeSnippet:
						'<span class="text-gray-500">&lt;</span><span class="text-blue-400">FollowPackHero</span> <span class="text-cyan-400">followPack</span><span class="text-gray-500">=&#123;</span>pack<span class="text-gray-500">&#125;</span> <span class="text-gray-500">/&gt;</span>',
					preview: heroPreview,
					cardData: {
						name: 'follow-pack-hero',
						title: 'Follow Pack Hero',
						description: 'Featured display with full-bleed imagery. Perfect for landing pages and hero sections.',
						richDescription: 'The Follow Pack Hero component is designed to showcase follow packs in a dramatic, full-width layout. It features large imagery with overlaid text, making it perfect for landing pages, featured sections, and hero areas where you want to make a strong visual impact.',
						command: 'npx shadcn@latest add follow-pack-hero',
						dependencies: ['@nostr-dev-kit/ndk', '@nostr-dev-kit/svelte'],
						registryDependencies: ['user-card', 'avatar'],
						apiDocs: [
							{
								name: 'FollowPackHero',
								description: 'Hero-style follow pack display component with full-bleed imagery and overlaid content.',
								importPath: "import FollowPackHero from '$lib/registry/components/follow-pack/follow-pack-hero.svelte'",
								props: [
									{
										name: 'ndk',
										type: 'NDKSvelte',
										description: 'NDK instance (optional if provided via context)'
									},
									{
										name: 'followPack',
										type: 'NDKFollowPack',
										required: true,
										description: 'The follow pack event (kind 39089) to display'
									},
									{
										name: 'onclick',
										type: '(e: MouseEvent) => void',
										description: 'Optional click handler for custom actions'
									},
									{
										name: 'class',
										type: 'string',
										description: 'Additional CSS classes to apply'
									}
								]
							}
						],
						relatedComponents: [
							{ name: 'portrait', title: 'Follow Pack Portrait', path: '#portrait' },
							{ name: 'compact', title: 'Follow Pack Compact', path: '#compact' },
							{ name: 'list-item', title: 'Follow Pack List Item', path: '#list' }
						],
						version: '0.16.0'
					}
				},
				{
					name: 'Portrait',
					description: 'Vertical elegance for grid displays. Ideal for galleries and multi-column layouts.',
					command: 'npx shadcn@latest add follow-pack-portrait',
					codeSnippet:
						'<span class="text-gray-500">&lt;</span><span class="text-blue-400">FollowPackPortrait</span> <span class="text-cyan-400">followPack</span><span class="text-gray-500">=&#123;</span>pack<span class="text-gray-500">&#125;</span> <span class="text-gray-500">/&gt;</span>',
					preview: portraitPreview,
					cardData: {
						name: 'follow-pack-portrait',
						title: 'Follow Pack Portrait',
						description: 'Vertical elegance for grid displays. Ideal for galleries and multi-column layouts.',
						richDescription: 'The Follow Pack Portrait component presents follow packs in a vertical card format, perfect for grid layouts and gallery displays. Its portrait orientation makes it ideal for showing multiple packs side-by-side while maintaining full visibility of imagery and details.',
						command: 'npx shadcn@latest add follow-pack-portrait',
						dependencies: ['@nostr-dev-kit/ndk', '@nostr-dev-kit/svelte'],
						registryDependencies: ['user-card', 'avatar'],
						apiDocs: [
							{
								name: 'FollowPackPortrait',
								description: 'Vertical card-style follow pack display optimized for grid layouts.',
								importPath: "import FollowPackPortrait from '$lib/registry/components/follow-pack/follow-pack-portrait.svelte'",
								props: [
									{
										name: 'ndk',
										type: 'NDKSvelte',
										description: 'NDK instance (optional if provided via context)'
									},
									{
										name: 'followPack',
										type: 'NDKFollowPack',
										required: true,
										description: 'The follow pack event (kind 39089) to display'
									},
									{
										name: 'onclick',
										type: '(e: MouseEvent) => void',
										description: 'Optional click handler for custom actions'
									},
									{
										name: 'class',
										type: 'string',
										description: 'Additional CSS classes to apply'
									}
								]
							}
						],
						relatedComponents: [
							{ name: 'hero', title: 'Follow Pack Hero', path: '#hero' },
							{ name: 'compact', title: 'Follow Pack Compact', path: '#compact' },
							{ name: 'list-item', title: 'Follow Pack List Item', path: '#list' }
						],
						version: '0.16.0'
					}
				},
				{
					name: 'Compact',
					description:
						'Information-dense for feeds. Optimized for content streams and horizontal layouts.',
					command: 'npx shadcn@latest add follow-pack-compact',
					codeSnippet:
						'<span class="text-gray-500">&lt;</span><span class="text-blue-400">FollowPackCompact</span> <span class="text-cyan-400">followPack</span><span class="text-gray-500">=&#123;</span>pack<span class="text-gray-500">&#125;</span> <span class="text-gray-500">/&gt;</span>',
					preview: compactPreview,
					cardData: {
						name: 'follow-pack-compact',
						title: 'Follow Pack Compact',
						description: 'Information-dense for feeds. Optimized for content streams and horizontal layouts.',
						richDescription: 'The Follow Pack Compact component provides a horizontal, information-dense display perfect for content feeds and streams. It efficiently uses horizontal space while presenting all essential information, making it ideal for timeline-style layouts.',
						command: 'npx shadcn@latest add follow-pack-compact',
						dependencies: ['@nostr-dev-kit/ndk', '@nostr-dev-kit/svelte'],
						registryDependencies: ['user-card', 'avatar'],
						apiDocs: [
							{
								name: 'FollowPackCompact',
								description: 'Horizontal compact follow pack display for feed and timeline layouts.',
								importPath: "import FollowPackCompact from '$lib/registry/components/follow-pack/follow-pack-compact.svelte'",
								props: [
									{
										name: 'ndk',
										type: 'NDKSvelte',
										description: 'NDK instance (optional if provided via context)'
									},
									{
										name: 'followPack',
										type: 'NDKFollowPack',
										required: true,
										description: 'The follow pack event (kind 39089) to display'
									},
									{
										name: 'onclick',
										type: '(e: MouseEvent) => void',
										description: 'Optional click handler for custom actions'
									},
									{
										name: 'class',
										type: 'string',
										description: 'Additional CSS classes to apply'
									}
								]
							}
						],
						relatedComponents: [
							{ name: 'hero', title: 'Follow Pack Hero', path: '#hero' },
							{ name: 'portrait', title: 'Follow Pack Portrait', path: '#portrait' },
							{ name: 'list-item', title: 'Follow Pack List Item', path: '#list' }
						],
						version: '0.16.0'
					}
				},
				{
					name: 'List Item',
					description: 'Minimal design for sidebars. Maximum impact with minimal footprint.',
					command: 'npx shadcn@latest add follow-pack-list-item',
					codeSnippet:
						'<span class="text-gray-500">&lt;</span><span class="text-blue-400">FollowPackListItem</span> <span class="text-cyan-400">followPack</span><span class="text-gray-500">=&#123;</span>pack<span class="text-gray-500">&#125;</span> <span class="text-gray-500">/&gt;</span>',
					preview: listItemPreview,
					cardData: {
						name: 'follow-pack-list-item',
						title: 'Follow Pack List Item',
						description: 'Minimal design for sidebars. Maximum impact with minimal footprint.',
						richDescription: 'The Follow Pack List Item component provides a minimal, space-efficient display designed for sidebar navigation and compact lists. It delivers essential information in a clean, unobtrusive format that integrates seamlessly into tight spaces.',
						command: 'npx shadcn@latest add follow-pack-list-item',
						dependencies: ['@nostr-dev-kit/ndk', '@nostr-dev-kit/svelte'],
						registryDependencies: ['user-card', 'avatar'],
						apiDocs: [
							{
								name: 'FollowPackListItem',
								description: 'Minimal list item display for sidebar and navigation use.',
								importPath: "import FollowPackListItem from '$lib/registry/components/follow-pack/follow-pack-list-item.svelte'",
								props: [
									{
										name: 'ndk',
										type: 'NDKSvelte',
										description: 'NDK instance (optional if provided via context)'
									},
									{
										name: 'followPack',
										type: 'NDKFollowPack',
										required: true,
										description: 'The follow pack event (kind 39089) to display'
									},
									{
										name: 'onclick',
										type: '(e: MouseEvent) => void',
										description: 'Optional click handler for custom actions'
									},
									{
										name: 'class',
										type: 'string',
										description: 'Additional CSS classes to apply'
									}
								]
							}
						],
						relatedComponents: [
							{ name: 'hero', title: 'Follow Pack Hero', path: '#hero' },
							{ name: 'portrait', title: 'Follow Pack Portrait', path: '#portrait' },
							{ name: 'compact', title: 'Follow Pack Compact', path: '#compact' }
						],
						version: '0.16.0'
					}
				}
			]}
		/>
	{/if}

	<!-- Anatomy Section -->
	{#if pack1}
		<ComponentPageSectionTitle title="Anatomy" description="Click on any layer to see its details and props" />

		<ComponentAnatomy.Root>
			<ComponentAnatomy.Preview>
				<div class="relative bg-card border border-border rounded-xl overflow-hidden">
					<FollowPack.Root {ndk} followPack={pack1}>
						<ComponentAnatomy.Layer id="image" label="FollowPack.Image" class="h-48 overflow-hidden" absolute={true}>
							<FollowPack.Image class="w-full h-full object-cover" />
						</ComponentAnatomy.Layer>

						<div class="p-4 space-y-3">
							<ComponentAnatomy.Layer id="title" label="FollowPack.Title">
								<FollowPack.Title class="text-lg font-semibold" />
							</ComponentAnatomy.Layer>

							<ComponentAnatomy.Layer id="description" label="FollowPack.Description">
								<FollowPack.Description class="text-sm text-muted-foreground" maxLength={100} />
							</ComponentAnatomy.Layer>

							<ComponentAnatomy.Layer id="memberCount" label="FollowPack.MemberCount" class="w-fit">
								<FollowPack.MemberCount class="text-xs text-muted-foreground" format="long" />
							</ComponentAnatomy.Layer>
						</div>
					</FollowPack.Root>
				</div>
			</ComponentAnatomy.Preview>

			<ComponentAnatomy.DetailPanel layers={anatomyLayers} />
		</ComponentAnatomy.Root>
	{/if}

	<!-- Blocks Section -->
	<section class="min-h-[500px] lg:min-h-[60vh] border-b border-border/50 pb-12">
		<h2 class="text-3xl font-bold mb-2">Blocks</h2>
		<p class="text-muted-foreground mb-8">
			Pre-composed layouts ready to use. Install with a single command.
		</p>

		<div class="space-y-12">
			<Demo
				title="Portrait"
				description="Use for follow pack galleries or grid layouts where vertical space is abundant. Shows full pack details with prominent image."
				component="follow-pack-portrait"
				code={PortraitCodeRaw}
				props={[
					{
						name: 'ndk',
						type: 'NDKSvelte',
						description: 'NDK instance (optional if provided via context)'
					},
					{
						name: 'followPack',
						type: 'NDKFollowPack',
						required: true,
						description: 'The follow pack event (kind 39089) to display'
					},
					{
						name: 'onclick',
						type: '(e: MouseEvent) => void',
						description: 'Optional click handler for custom actions'
					},
					{
						name: 'class',
						type: 'string',
						description: 'Additional CSS classes to apply'
					}
				]}
			>
				<div class="flex gap-4 flex-wrap">
					{#each displayPacks.slice(0, 3) as pack}
						<FollowPackPortrait {ndk} followPack={pack} />
					{/each}
				</div>
			</Demo>

			<Demo
				title="Hero"
				description="Use for featured follow packs or landing page highlights. Large format with dramatic imagery and overlaid text."
				component="follow-pack-hero"
				code={HeroCodeRaw}
				props={[
					{
						name: 'ndk',
						type: 'NDKSvelte',
						description: 'NDK instance (optional if provided via context)'
					},
					{
						name: 'followPack',
						type: 'NDKFollowPack',
						required: true,
						description: 'The follow pack event (kind 39089) to display'
					},
					{
						name: 'onclick',
						type: '(e: MouseEvent) => void',
						description: 'Optional click handler for custom actions'
					},
					{
						name: 'class',
						type: 'string',
						description: 'Additional CSS classes to apply'
					}
				]}
			>
				{#if pack1}
					<FollowPackHero {ndk} followPack={pack1} />
				{/if}
			</Demo>

			<Demo
				title="Compact"
				description="Use for follow pack lists or feeds where horizontal space is limited. Shows key information in a horizontal layout."
				component="follow-pack-compact"
				code={CompactCodeRaw}
				props={[
					{
						name: 'ndk',
						type: 'NDKSvelte',
						description: 'NDK instance (optional if provided via context)'
					},
					{
						name: 'followPack',
						type: 'NDKFollowPack',
						required: true,
						description: 'The follow pack event (kind 39089) to display'
					},
					{
						name: 'onclick',
						type: '(e: MouseEvent) => void',
						description: 'Optional click handler for custom actions'
					},
					{
						name: 'class',
						type: 'string',
						description: 'Additional CSS classes to apply'
					}
				]}
			>
				<div class="space-y-2 max-w-2xl">
					{#each displayPacks.slice(0, 3) as pack}
						<FollowPackCompact {ndk} followPack={pack} />
					{/each}
				</div>
			</Demo>

			<Demo
				title="List Item"
				description="Use for minimal follow pack lists or sidebars. Displays essential information only with a clean, simple design."
				component="follow-pack-list-item"
				code={ListItemCodeRaw}
				props={[
					{
						name: 'ndk',
						type: 'NDKSvelte',
						description: 'NDK instance (optional if provided via context)'
					},
					{
						name: 'followPack',
						type: 'NDKFollowPack',
						required: true,
						description: 'The follow pack event (kind 39089) to display'
					},
					{
						name: 'onclick',
						type: '(e: MouseEvent) => void',
						description: 'Optional click handler for custom actions'
					},
					{
						name: 'class',
						type: 'string',
						description: 'Additional CSS classes to apply'
					}
				]}
			>
				<div class="max-w-md">
					{#each displayPacks.slice(0, 4) as pack}
						<FollowPackListItem {ndk} followPack={pack} />
					{/each}
				</div>
			</Demo>
		</div>
	</section>

	<!-- UI Primitives Section -->
	<section class="min-h-[500px] lg:min-h-[60vh] border-b border-border/50 pb-12">
		<h2 class="text-3xl font-bold mb-2">UI Primitives</h2>
		<p class="text-muted-foreground mb-8">
			Primitive components for building custom follow pack layouts. Mix and match to create your
			own designs.
		</p>

		<div class="space-y-8">
			<Demo
				title="Basic Usage"
				description="Minimal example with FollowPack.Root and essential primitives."
				code={UIBasicRaw}
			>
				{#if pack1}
					<div class="p-4 bg-card rounded-lg">
						<div class="text-lg font-semibold">{pack1.title || 'Untitled Pack'}</div>
						<div class="text-sm text-muted-foreground mt-2">{pack1.description || ''}</div>
						<div class="text-xs text-muted-foreground mt-2">
							{pack1.pubkeys.length} {pack1.pubkeys.length === 1 ? 'person' : 'people'}
						</div>
					</div>
				{/if}
			</Demo>

			<Demo
				title="Full Composition"
				description="All available primitives composed together."
				code={UIFullRaw}
			>
				{#if pack1}
					<div class="bg-card rounded-xl overflow-hidden shadow-md max-w-md">
						{#if pack1.image}
							<div class="relative w-full h-48 overflow-hidden">
								<img src={pack1.image} alt={pack1.title || 'Follow pack'} class="w-full h-full object-cover" />
								<div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
							</div>
						{/if}

						<div class="p-6">
							<div class="text-xl font-bold mb-3">{pack1.title || 'Untitled Pack'}</div>
							<div class="text-sm text-muted-foreground mb-4">
								{pack1.description && pack1.description.length > 150
									? pack1.description.slice(0, 150) + '...'
									: pack1.description}
							</div>

							<div class="flex items-center justify-between pt-4 border-t border-border">
								<div class="flex items-center gap-2 text-sm">
									<svg class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
									</svg>
									<span class="text-muted-foreground">
										{pack1.pubkeys.length} {pack1.pubkeys.length === 1 ? 'person' : 'people'}
									</span>
								</div>
							</div>
						</div>
					</div>
				{/if}
			</Demo>
		</div>
	</section>

	<!-- Component API -->
	<ComponentAPI
		components={[
			{
				name: 'FollowPack.Root',
				description:
					'Context provider component that wraps all FollowPack primitives. Makes NDK instance and follow pack data available to child components.',
				importPath: "import { FollowPack } from '$lib/registry/ui/follow-pack'",
				props: [
					{
						name: 'ndk',
						type: 'NDKSvelte',
						description:
							'NDK instance for Nostr operations. Optional if already provided via Svelte context.'
					},
					{
						name: 'followPack',
						type: 'NDKFollowPack',
						required: true,
						description: 'The follow pack event (kind 39089) containing pack metadata and member list'
					},
					{
						name: 'onclick',
						type: '(e: MouseEvent) => void',
						description:
							'Optional click handler. Makes the root element interactive when provided. Use for navigation or triggering follow actions.'
					},
					{
						name: 'class',
						type: 'string',
						default: "''",
						description: 'Additional CSS classes to apply to the root element'
					}
				],
				slots: [
					{
						name: 'children',
						description: 'Child components (FollowPack primitives or custom content)'
					}
				]
			},
			{
				name: 'FollowPack.Image',
				description:
					'Displays the follow pack image. Automatically handles missing images with a fallback icon. Supports gradient overlays for better text readability.',
				importPath: "import { FollowPack } from '$lib/registry/ui/follow-pack'",
				props: [
					{
						name: 'class',
						type: 'string',
						default: "''",
						description: 'Additional CSS classes for sizing and styling the image container'
					},
					{
						name: 'showGradient',
						type: 'boolean',
						default: 'false',
						description:
							'Adds a gradient overlay from bottom to top for better text contrast when overlaying content'
					},
					{
						name: 'fallback',
						type: 'string',
						description:
							'Custom fallback image URL. If not provided and pack has no image, shows default group icon.'
					}
				]
			},
			{
				name: 'FollowPack.Title',
				description:
					'Displays the follow pack title. Shows "Untitled Pack" if no title is set. Supports line clamping for overflow control.',
				importPath: "import { FollowPack } from '$lib/registry/ui/follow-pack'",
				props: [
					{
						name: 'class',
						type: 'string',
						default: "''",
						description: 'Additional CSS classes for styling the title text'
					},
					{
						name: 'lines',
						type: 'number',
						description:
							'Number of lines to show before truncating with ellipsis. Uses Tailwind line-clamp utilities.'
					}
				]
			},
			{
				name: 'FollowPack.Description',
				description:
					'Displays the follow pack description. Automatically hidden if no description exists. Supports both character truncation and line clamping.',
				importPath: "import { FollowPack } from '$lib/registry/ui/follow-pack'",
				props: [
					{
						name: 'class',
						type: 'string',
						default: "''",
						description: 'Additional CSS classes for styling the description text'
					},
					{
						name: 'maxLength',
						type: 'number',
						description: 'Maximum character length before truncating with ellipsis'
					},
					{
						name: 'lines',
						type: 'number',
						description:
							'Number of lines to show before truncating. Uses Tailwind line-clamp utilities.'
					}
				]
			},
			{
				name: 'FollowPack.MemberCount',
				description:
					'Displays the number of people in the follow pack. Counts the pubkeys array from the event. Supports both short (number only) and long (formatted with "people") formats.',
				importPath: "import { FollowPack } from '$lib/registry/ui/follow-pack'",
				props: [
					{
						name: 'class',
						type: 'string',
						default: "''",
						description: 'Additional CSS classes for styling the count display'
					},
					{
						name: 'format',
						type: "'short' | 'long'",
						default: "'short'",
						description:
							'Display format. "short" shows number only (e.g., "23"). "long" shows formatted text (e.g., "23 people").'
					}
				]
			}
		]}
	/>
</div>
