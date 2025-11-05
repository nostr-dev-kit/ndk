<script lang="ts">
	import { getContext } from 'svelte';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import type { NDKEvent } from '@nostr-dev-kit/ndk';
	import EventCardClassic from '$lib/registry/components/event-card/event-card-classic.svelte';
	import EventCardMenu from '$lib/registry/components/event-card/event-card-menu.svelte';
	import { EventCard } from '$lib/registry/components/event-card';
	import { EditProps } from '$lib/site-components/edit-props';
	import PageTitle from '$lib/site-components/PageTitle.svelte';
	import ComponentsShowcase from '$site-components/ComponentsShowcase.svelte';
	import SectionTitle from '$site-components/SectionTitle.svelte';
	import ComponentAPI from '$site-components/component-api.svelte';
	import ComponentPageTemplate from '$lib/templates/ComponentPageTemplate.svelte';
	import { eventCardMetadata, eventCardCards, eventCardClassicCard, eventCardMenuCard, eventCardBasicCard, eventCardFullCard } from '$lib/component-registry/event-card';
	import type { ShowcaseBlock } from '$lib/templates/types';

	// TODO: These files don't exist yet
	// import UIBasic from './generic/examples/ui-basic.example.svelte';
	// import UIFull from './generic/examples/ui-full.example.svelte';
	// import ChromeDemo from './generic/examples/chrome-demo.example.svelte';

	const ndk = getContext<NDKSvelte>('ndk');
	let sampleEvent = $state<NDKEvent | undefined>();

	const showcaseBlocks: ShowcaseBlock[] = [
		{
			name: 'Classic',
			description: 'Standard event display for feeds',
			command: 'npx shadcn@latest add event-card-classic',
			preview: classicPreview,
			cardData: eventCardClassicCard,
			orientation: 'vertical'
		},
		{
			name: 'Menu',
			description: 'Dropdown with event actions',
			command: 'npx shadcn@latest add event-card-menu',
			preview: menuPreview,
			cardData: eventCardMenuCard,
			orientation: 'vertical'
		}
	];
</script>

{#snippet beforeShowcase()}
	{#if sampleEvent}
		<section class="mb-16">
			<h2 class="text-3xl font-bold mb-4">EventCard Primitives</h2>
			<p class="text-muted-foreground mb-6">
				EventCard provides composable building blocks for displaying Nostr events. Use these primitives
				to build custom card layouts, or use pre-built blocks like EventCardClassic for common patterns.
			</p>

			<div class="bg-muted/30 border border-border rounded-lg p-6 mb-8">
				<h3 class="text-lg font-semibold mb-3">Core Components</h3>
				<ul class="space-y-2 text-muted-foreground">
					<li class="flex items-start gap-2">
						<span class="text-primary">•</span>
						<span><strong>EventCard.Root</strong> — Container providing context to child components</span>
					</li>
					<li class="flex items-start gap-2">
						<span class="text-primary">•</span>
						<span><strong>EventCard.Header</strong> — Author avatar, name, and timestamp</span>
					</li>
					<li class="flex items-start gap-2">
						<span class="text-primary">•</span>
						<span><strong>EventCard.Content</strong> — Event content renderer</span>
					</li>
					<li class="flex items-start gap-2">
						<span class="text-primary">•</span>
						<span><strong>EventCard.Actions</strong> — Interaction buttons (reply, repost, reactions)</span>
					</li>
					<li class="flex items-start gap-2">
						<span class="text-primary">•</span>
						<span><strong>EventCard.Dropdown</strong> — Menu for additional actions</span>
					</li>
				</ul>
			</div>

			<div class="mt-6 p-4 bg-primary/5 border-l-4 border-primary rounded">
				<p class="text-sm text-muted-foreground">
					<strong class="text-foreground">Composable-first approach:</strong> Use the primitives for full control,
					or use pre-built blocks for speed. Both use the same underlying components, so you can start with blocks
					and refactor to primitives as your needs evolve.
				</p>
			</div>
		</section>

		<section class="mb-16">
			<h2 class="text-3xl font-bold mb-4">Specialized Cards</h2>
			<p class="text-muted-foreground mb-6">
				For specific event kinds, the registry provides specialized card components with optimized
				layouts and metadata display.
			</p>

			<div class="grid gap-4 md:grid-cols-3">
				<a href="/events/cards/article" class="group p-6 border rounded-lg hover:bg-accent/50 transition-colors">
					<h3 class="font-semibold mb-2 group-hover:text-primary">ArticleCard</h3>
					<p class="text-sm text-muted-foreground mb-3">
						Long-form article layouts with hero images and reading time.
					</p>
					<span class="text-sm text-primary">View variants →</span>
				</a>

				<a href="/events/cards/highlight" class="group p-6 border rounded-lg hover:bg-accent/50 transition-colors">
					<h3 class="font-semibold mb-2 group-hover:text-primary">HighlightCard</h3>
					<p class="text-sm text-muted-foreground mb-3">
						Text highlight displays with source context and attribution.
					</p>
					<span class="text-sm text-primary">View variants →</span>
				</a>

				<a href="/events/cards/voice-message" class="group p-6 border rounded-lg hover:bg-accent/50 transition-colors">
					<h3 class="font-semibold mb-2 group-hover:text-primary">VoiceMessageCard</h3>
					<p class="text-sm text-muted-foreground mb-3">
						Audio message players with waveform visualization.
					</p>
					<span class="text-sm text-primary">View variants →</span>
				</a>
			</div>
		</section>
	{/if}
{/snippet}

{#snippet classicPreview()}
	{#if sampleEvent}
		<div class="max-w-2xl mx-auto">
			<EventCardClassic {ndk} event={sampleEvent} />
		</div>
	{/if}
{/snippet}

{#snippet menuPreview()}
	{#if sampleEvent}
		<div class="flex items-center justify-center p-8">
			<EventCardMenu {ndk} event={sampleEvent} />
		</div>
	{/if}
{/snippet}

{#snippet basicPreview()}
	{#if sampleEvent}
		<div class="max-w-2xl mx-auto">
			<!-- TODO: UIBasic component not yet created -->
			<p>Basic preview placeholder</p>
		</div>
	{/if}
{/snippet}

{#snippet fullPreview()}
	{#if sampleEvent}
		<div class="max-w-2xl mx-auto">
			<!-- TODO: UIFull component not yet created -->
			<p>Full preview placeholder</p>
		</div>
	{/if}
{/snippet}

{#snippet afterShowcase()}
	{#if sampleEvent}
		<SectionTitle
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
					preview: basicPreview,
					cardData: eventCardBasicCard
				},
				{
					name: 'Full',
					description: 'All primitives together',
					command: 'npx shadcn@latest add event-card',
					preview: fullPreview,
					cardData: eventCardFullCard
				}
			]}
		/>
	{/if}
{/snippet}

{#snippet customSections()}
	<ComponentAPI
		components={[
			{
				name: 'EventCard.Root',
				description:
					'Root container that provides event context to all child components. Handles interactive states and threading metadata.',
				importPath: "import { EventCard } from '$lib/registry/components/event-card'",
				props: [
					{ name: 'ndk', type: 'NDKSvelte', default: 'from context', description: 'NDK instance (optional if provided via context)' },
					{ name: 'event', type: 'NDKEvent', description: 'The event to display', required: true },
					{ name: 'threading', type: 'ThreadingMetadata', description: 'Threading metadata for thread views' },
					{ name: 'interactive', type: 'boolean', default: 'false', description: 'Make card clickable' },
					{ name: 'class', type: 'string', description: 'Additional CSS classes' }
				],
				slots: [
					{ name: 'children', description: 'Card content (Header, Content, Actions, etc.)' }
				]
			},
			{
				name: 'EventCard.Header',
				description: 'Displays event author information with avatar, name, and timestamp. Supports custom actions slot.',
				importPath: "import { EventCard } from '$lib/registry/components/event-card'",
				props: [
					{ name: 'variant', type: "'full' | 'compact' | 'minimal'", default: "'full'", description: 'Display variant' },
					{ name: 'showAvatar', type: 'boolean', default: 'true', description: 'Show author avatar' },
					{ name: 'showTimestamp', type: 'boolean', default: 'true', description: 'Show event timestamp' },
					{ name: 'avatarSize', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Avatar size' },
					{ name: 'class', type: 'string', description: 'Additional CSS classes' }
				],
				slots: [
					{ name: 'children', description: 'Custom actions (e.g., EventCardMenu)' }
				]
			},
			{
				name: 'EventCard.Content',
				description: 'Displays event content with optional truncation and media preview support.',
				importPath: "import { EventCard } from '$lib/registry/components/event-card'",
				props: [
					{ name: 'truncate', type: 'number', description: 'Maximum content length before truncation' },
					{ name: 'class', type: 'string', description: 'Additional CSS classes' }
				]
			},
			{
				name: 'EventCard.Actions',
				description: 'Container for action buttons (reactions, reposts, etc.).',
				importPath: "import { EventCard } from '$lib/registry/components/event-card'",
				props: [
					{ name: 'class', type: 'string', description: 'Additional CSS classes' }
				],
				slots: [
					{ name: 'children', description: 'Action components (ReactionAction, RepostButton, etc.)' }
				]
			},
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
			},
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
		]}
	/>
{/snippet}

{#if sampleEvent}
	<ComponentPageTemplate
		metadata={eventCardMetadata}
		{ndk}
		{showcaseBlocks}
		{beforeShowcase}
		{afterShowcase}
		componentsSection={{
			cards: eventCardCards,
			previews: {
				'event-card-classic': classicPreview,
				'event-card-menu': menuPreview,
				'event-card-basic': basicPreview,
				'event-card-full': fullPreview
			}
		}}
		{customSections}
	>
		<EditProps.Prop
			name="Sample Event"
			type="event"
			bind:value={sampleEvent}
			default="nevent1qvzqqqqqqypzp75cf0tahv5z7plpdeaws7ex52nmnwgtwfr2g3m37r844evqrr6jqyxhwumn8ghj7e3h0ghxjme0qyd8wumn8ghj7urewfsk66ty9enxjct5dfskvtnrdakj7qpqn35mrh4hpc53m3qge6m0exys02lzz9j0sxdj5elwh3hc0e47v3qqpq0a0n"
		/>
	</ComponentPageTemplate>
{:else}
	<div class="px-8">
		<PageTitle title={eventCardMetadata.title} subtitle={eventCardMetadata.description}>
			<EditProps.Prop
				name="Sample Event"
				type="event"
				bind:value={sampleEvent}
				default="nevent1qvzqqqqqqypzp75cf0tahv5z7plpdeaws7ex52nmnwgtwfr2g3m37r844evqrr6jqyxhwumn8ghj7e3h0ghxjme0qyd8wumn8ghj7urewfsk66ty9enxjct5dfskvtnrdakj7qpqn35mrh4hpc53m3qge6m0exys02lzz9j0sxdj5elwh3hc0e47v3qqpq0a0n"
			/>
		</PageTitle>
		<div class="py-16 text-center text-muted-foreground">
			Loading sample event...
		</div>
	</div>
{/if}
