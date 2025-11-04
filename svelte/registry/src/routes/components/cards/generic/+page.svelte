<script lang="ts">
	import { getContext } from 'svelte';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import type { NDKEvent } from '@nostr-dev-kit/ndk';
	import EventCardClassic from '$lib/registry/components/event-card/event-card-classic.svelte';
	import EventCardMenu from '$lib/registry/components/event-card/event-card-menu.svelte';
	import { EditProps } from '$lib/site-components/edit-props';
	import ComponentsShowcase from '$site-components/ComponentsShowcase.svelte';
	import ComponentCard from '$site-components/ComponentCard.svelte';
	import ComponentPageSectionTitle from '$site-components/ComponentPageSectionTitle.svelte';
	import ComponentAPI from '$site-components/component-api.svelte';

	// Import UI examples
	import UIBasic from './examples/ui-basic.svelte';
	import UIFull from './examples/ui-full.svelte';

	// Import chrome demo
	import ChromeDemo from './examples/chrome-demo.svelte';

	const ndk = getContext<NDKSvelte>('ndk');

	let sampleEvent = $state<NDKEvent | undefined>();

	const classicCardData = {
		name: 'event-card-classic',
		title: 'EventCardClassic',
		description: 'Standard event display for feeds.',
		richDescription: 'Use for standard event displays in feeds and lists. Includes background, header with dropdown menu, content, and action buttons (repost, reaction).',
		command: 'npx shadcn@latest add event-card-classic',
		apiDocs: [
			{
				name: 'EventCardClassic',
				description: 'Pre-composed event card with complete functionality including background, dropdown menu, and all action buttons.',
				importPath: "import EventCardClassic from '$lib/registry/components/event-card/event-card-classic.svelte'",
				props: [
					{ name: 'ndk', type: 'NDKSvelte', description: 'NDK instance', required: true },
					{ name: 'event', type: 'NDKEvent', description: 'The event to display', required: true },
					{ name: 'threading', type: 'ThreadingMetadata', description: 'Threading metadata for thread views' },
					{ name: 'interactive', type: 'boolean', default: 'false', description: 'Make card clickable' },
					{ name: 'showActions', type: 'boolean', default: 'true', description: 'Show action buttons (repost, reaction)' },
					{ name: 'showDropdown', type: 'boolean', default: 'true', description: 'Show dropdown menu' },
					{ name: 'truncate', type: 'number', description: 'Maximum content length before truncation' },
					{ name: 'class', type: 'string', description: 'Additional CSS classes' }
				]
			}
		]
	};

	const menuCardData = {
		name: 'event-card-menu',
		title: 'EventCardMenu',
		description: 'Dropdown menu with event actions.',
		richDescription: 'Use for dropdown menus with event actions (mute, report, copy, view raw). Can be placed in any EventCard.Header.',
		command: 'npx shadcn@latest add event-card-menu',
		apiDocs: [
			{
				name: 'EventCardMenu',
				description: 'Fully-styled dropdown menu for event actions including mute, report, copy, and raw event viewing.',
				importPath: "import EventCardMenu from '$lib/registry/components/event-card/event-card-menu.svelte'",
				props: [
					{ name: 'ndk', type: 'NDKSvelte', description: 'NDK instance', required: true },
					{ name: 'event', type: 'NDKEvent', description: 'The event for this menu', required: true },
					{ name: 'showRelayInfo', type: 'boolean', default: 'true', description: 'Show relay information in dropdown' },
					{ name: 'class', type: 'string', description: 'Additional CSS classes' }
				]
			}
		]
	};

	const basicCardData = {
		name: 'event-card-basic',
		title: 'Basic Usage',
		description: 'Minimal example with EventCard primitives.',
		richDescription: 'Minimal example with EventCard.Root and essential primitives. Build custom layouts by composing EventCard.Header, EventCard.Content, and EventCard.Actions.',
		command: 'npx shadcn@latest add event-card',
		apiDocs: []
	};

	const fullCardData = {
		name: 'event-card-full',
		title: 'Full Composition',
		description: 'All available primitives composed together.',
		richDescription: 'All available primitives composed together with full header, content truncation, and multiple reaction options. Demonstrates the flexibility of the primitive-based approach.',
		command: 'npx shadcn@latest add event-card',
		apiDocs: []
	};

	const chromeDemoCardData = {
		name: 'event-card-chrome',
		title: 'Interactive Chrome Demo',
		description: 'See how the chrome adapts to different event kinds.',
		richDescription: 'See how the same chrome adapts to different event kinds. The header, layout, and actions stay consistent while the content changes.',
		command: 'npx shadcn@latest add event-card',
		apiDocs: []
	};
</script>

<div class="px-8">
	<!-- Header -->
	<div class="mb-12 pt-8">
		<div class="flex items-start justify-between gap-4 mb-4">
			<h1 class="text-4xl font-bold">EventCard</h1>
		</div>
		<p class="text-lg text-muted-foreground mb-6">
			Composable components for displaying any NDKEvent type with flexible layouts and
			interactions. Perfect for feeds, threads, and social content.
		</p>

		<EditProps.Root>
			<EditProps.Prop
				name="Sample Event"
				type="event"
				bind:value={sampleEvent}
				default="nevent1qvzqqqqqqypzp75cf0tahv5z7plpdeaws7ex52nmnwgtwfr2g3m37r844evqrr6jqyxhwumn8ghj7e3h0ghxjme0qyd8wumn8ghj7urewfsk66ty9enxjct5dfskvtnrdakj7qpqn35mrh4hpc53m3qge6m0exys02lzz9j0sxdj5elwh3hc0e47v3qqpq0a0n"
			/>
			<EditProps.Button>Change Sample Event</EditProps.Button>
		</EditProps.Root>
	</div>

	<!-- Concept: The Chrome -->
	{#if sampleEvent}
		<section class="mb-16">
			<h2 class="text-3xl font-bold mb-4">Understanding the Chrome</h2>
			<p class="text-muted-foreground mb-6">
				EventCard provides the <strong>chrome</strong> — the consistent visual frame around your content.
				Think of it as the picture frame that stays the same while the artwork inside changes.
			</p>

			<div class="bg-muted/30 border border-border rounded-lg p-6 mb-6">
				<h3 class="text-lg font-semibold mb-3">The chrome includes:</h3>
				<ul class="space-y-2 text-muted-foreground">
					<li class="flex items-start gap-2">
						<span class="text-primary">•</span>
						<span><strong>Header</strong> — Author info, avatar, timestamp, and actions menu</span>
					</li>
					<li class="flex items-start gap-2">
						<span class="text-primary">•</span>
						<span><strong>Content slot</strong> — Where any event kind renders (notes, articles, videos, etc.)</span>
					</li>
					<li class="flex items-start gap-2">
						<span class="text-primary">•</span>
						<span><strong>Actions</strong> — Interaction buttons (reply, repost, reactions)</span>
					</li>
					<li class="flex items-start gap-2">
						<span class="text-primary">•</span>
						<span><strong>Thread indicators</strong> — Visual lines connecting related events</span>
					</li>
				</ul>
			</div>

			<ComponentCard inline data={chromeDemoCardData}>
				{#snippet preview()}
					<div class="max-w-2xl mx-auto">
						<ChromeDemo {ndk} event={sampleEvent} />
					</div>
				{/snippet}
			</ComponentCard>

			<div class="mt-6 p-4 bg-primary/5 border-l-4 border-primary rounded">
				<p class="text-sm text-muted-foreground">
					<strong class="text-foreground">Why this matters:</strong> By separating the chrome from the content,
					you can display any Nostr event kind (kind 1 notes, kind 30023 articles, kind 30040 videos, etc.)
					with a consistent, familiar interface. Your users always know where to find the author, how to interact,
					and how events relate to each other — regardless of content type.
				</p>
			</div>
		</section>
	{/if}

	{#if sampleEvent}
		<!-- Blocks Section -->
		{#snippet classicPreview()}
			<div class="max-w-2xl mx-auto">
				<EventCardClassic {ndk} event={sampleEvent} />
			</div>
		{/snippet}

		{#snippet menuPreview()}
			<div class="flex items-center justify-center p-8">
				<EventCardMenu {ndk} event={sampleEvent} />
			</div>
		{/snippet}

		<ComponentPageSectionTitle
			title="Blocks"
			description="Pre-composed layouts ready to use."
		/>

		<ComponentsShowcase
			class="-mx-8 px-8"
			blocks={[
				{
					name: 'Classic',
					description: 'Standard event display for feeds',
					command: 'npx shadcn@latest add event-card-classic',
					codeSnippet:
						'<span class="text-gray-500">&lt;</span><span class="text-blue-400">EventCardClassic</span> <span class="text-cyan-400">event</span><span class="text-gray-500">=</span><span class="text-green-400">{event}</span> <span class="text-gray-500">/&gt;</span>',
					preview: classicPreview,
					cardData: classicCardData
				},
				{
					name: 'Menu',
					description: 'Dropdown with event actions',
					command: 'npx shadcn@latest add event-card-menu',
					codeSnippet:
						'<span class="text-gray-500">&lt;</span><span class="text-blue-400">EventCardMenu</span> <span class="text-cyan-400">event</span><span class="text-gray-500">=</span><span class="text-green-400">{event}</span> <span class="text-gray-500">/&gt;</span>',
					preview: menuPreview,
					cardData: menuCardData
				}
			]}
		/>

		<!-- UI Primitives Section -->
		{#snippet basicPreview()}
			<div class="max-w-2xl mx-auto">
				<UIBasic {ndk} event={sampleEvent} />
			</div>
		{/snippet}

		{#snippet fullPreview()}
			<div class="max-w-2xl mx-auto">
				<UIFull {ndk} event={sampleEvent} />
			</div>
		{/snippet}

		<ComponentPageSectionTitle
			title="UI Primitives"
			description="Primitive components for building custom event card layouts."
		/>

		<ComponentsShowcase
			class="-mx-8 px-8"
			blocks={[
				{
					name: 'Basic',
					description: 'Minimal primitives composition',
					command: 'npx shadcn@latest add event-card',
					codeSnippet:
						'<span class="text-gray-500">&lt;</span><span class="text-blue-400">EventCard.Root</span><span class="text-gray-500">&gt;</span>...<span class="text-gray-500">&lt;/</span><span class="text-blue-400">EventCard.Root</span><span class="text-gray-500">&gt;</span>',
					preview: basicPreview,
					cardData: basicCardData
				},
				{
					name: 'Full',
					description: 'All primitives together',
					command: 'npx shadcn@latest add event-card',
					codeSnippet:
						'<span class="text-gray-500">&lt;</span><span class="text-blue-400">EventCard.Root</span><span class="text-gray-500">&gt;</span>...<span class="text-gray-500">&lt;/</span><span class="text-blue-400">EventCard.Root</span><span class="text-gray-500">&gt;</span>',
					preview: fullPreview,
					cardData: fullCardData
				}
			]}
		/>

		<!-- Components Section -->
		<ComponentPageSectionTitle title="Components" description="Explore each variant in detail" />

		<section class="py-12 space-y-16">
			<ComponentCard inline data={classicCardData}>
				{#snippet preview()}
					<div class="max-w-2xl mx-auto">
						<EventCardClassic {ndk} event={sampleEvent} />
					</div>
				{/snippet}
			</ComponentCard>

			<ComponentCard inline data={menuCardData}>
				{#snippet preview()}
					<div class="flex items-center justify-center p-8">
						<EventCardMenu {ndk} event={sampleEvent} />
					</div>
				{/snippet}
			</ComponentCard>

			<ComponentCard inline data={basicCardData}>
				{#snippet preview()}
					<div class="max-w-2xl mx-auto">
						<UIBasic {ndk} event={sampleEvent} />
					</div>
				{/snippet}
			</ComponentCard>

			<ComponentCard inline data={fullCardData}>
				{#snippet preview()}
					<div class="max-w-2xl mx-auto">
						<UIFull {ndk} event={sampleEvent} />
					</div>
				{/snippet}
			</ComponentCard>
		</section>
	{/if}

	<!-- Component API -->
	<ComponentAPI
				components={[
					{
						name: 'EventCard.Root',
						description:
							'Root container that provides event context to all child components. Handles interactive states and threading metadata.',
						importPath: "import { EventCard } from '$lib/registry/components/event-card'",
						props: [
							{
								name: 'ndk',
								type: 'NDKSvelte',
								default: 'from context',
								description: 'NDK instance (optional if provided via context)',
								required: false
							},
							{
								name: 'event',
								type: 'NDKEvent',
								description: 'The event to display',
								required: true
							},
							{
								name: 'threading',
								type: 'ThreadingMetadata',
								description: 'Threading metadata for thread views',
								required: false
							},
							{
								name: 'interactive',
								type: 'boolean',
								default: 'false',
								description: 'Make card clickable',
								required: false
							},
							{
								name: 'class',
								type: 'string',
								description: 'Additional CSS classes',
								required: false
							}
						],
						slots: [
							{
								name: 'children',
								description: 'Card content (Header, Content, Actions, etc.)'
							}
						]
					},
					{
						name: 'EventCard.Header',
						description:
							'Displays event author information with avatar, name, and timestamp. Supports custom actions slot.',
						importPath: "import { EventCard } from '$lib/registry/components/event-card'",
						props: [
							{
								name: 'variant',
								type: "'full' | 'compact' | 'minimal'",
								default: "'full'",
								description: 'Display variant',
								required: false
							},
							{
								name: 'showAvatar',
								type: 'boolean',
								default: 'true',
								description: 'Show author avatar',
								required: false
							},
							{
								name: 'showTimestamp',
								type: 'boolean',
								default: 'true',
								description: 'Show event timestamp',
								required: false
							},
							{
								name: 'avatarSize',
								type: "'sm' | 'md' | 'lg'",
								default: "'md'",
								description: 'Avatar size',
								required: false
							},
							{
								name: 'class',
								type: 'string',
								description: 'Additional CSS classes',
								required: false
							}
						],
						slots: [
							{
								name: 'children',
								description: 'Custom actions (e.g., EventCardMenu)'
							}
						]
					},
					{
						name: 'EventCard.Content',
						description:
							'Displays event content with optional truncation and media preview support.',
						importPath: "import { EventCard } from '$lib/registry/components/event-card'",
						props: [
							{
								name: 'truncate',
								type: 'number',
								description: 'Maximum content length before truncation',
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
						name: 'EventCard.Actions',
						description: 'Container for action buttons (reactions, reposts, etc.).',
						importPath: "import { EventCard } from '$lib/registry/components/event-card'",
						props: [
							{
								name: 'class',
								type: 'string',
								description: 'Additional CSS classes',
								required: false
							}
						],
						slots: [
							{
								name: 'children',
								description: 'Action components (ReactionAction, RepostButton, etc.)'
							}
						]
					},
					{
						name: 'ReactionAction',
						description:
							'Action button for reacting to events with emoji. Tracks reaction state and count.',
						importPath: "import { ReactionAction } from '$lib/registry/components/reaction'",
						props: [
							{
								name: 'emoji',
								type: 'string',
								default: "'+'",
								description: 'Emoji to use for reaction',
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
						name: 'EventCardClassic',
						description:
							'Pre-composed event card with complete functionality including background, dropdown menu, and all action buttons.',
						importPath: "import { EventCardClassic } from '$lib/registry/blocks'",
						props: [
							{
								name: 'ndk',
								type: 'NDKSvelte',
								description: 'NDK instance',
								required: true
							},
							{
								name: 'event',
								type: 'NDKEvent',
								description: 'The event to display',
								required: true
							},
							{
								name: 'threading',
								type: 'ThreadingMetadata',
								description: 'Threading metadata for thread views',
								required: false
							},
							{
								name: 'interactive',
								type: 'boolean',
								default: 'false',
								description: 'Make card clickable',
								required: false
							},
							{
								name: 'showActions',
								type: 'boolean',
								default: 'true',
								description: 'Show action buttons (repost, reaction)',
								required: false
							},
							{
								name: 'showDropdown',
								type: 'boolean',
								default: 'true',
								description: 'Show dropdown menu',
								required: false
							},
							{
								name: 'truncate',
								type: 'number',
								description: 'Maximum content length before truncation',
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
						name: 'EventCardMenu',
						description:
							'Fully-styled dropdown menu for event actions including mute, report, copy, and raw event viewing.',
						importPath: "import { EventCardMenu } from '$lib/registry/blocks'",
						props: [
							{
								name: 'ndk',
								type: 'NDKSvelte',
								description: 'NDK instance',
								required: true
							},
							{
								name: 'event',
								type: 'NDKEvent',
								description: 'The event for this menu',
								required: true
							},
							{
								name: 'showRelayInfo',
								type: 'boolean',
								default: 'true',
								description: 'Show relay information in dropdown',
								required: false
							},
							{
								name: 'class',
								type: 'string',
								description: 'Additional CSS classes',
								required: false
							}
						]
					}
				]}
			/>
</div>
