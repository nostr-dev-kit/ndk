<script lang="ts">
	import { getContext } from 'svelte';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import type { NDKEvent } from '@nostr-dev-kit/ndk';
	import EventCardClassic from '$lib/registry/components/event-card-classic/event-card-classic.svelte';
	import { EventCard } from '$lib/registry/components/event/cards/compound';
	import { EditProps } from '$lib/site-components/edit-props';
	import PageTitle from '$lib/site-components/PageTitle.svelte';
	import ComponentsShowcase from '$site-components/ComponentsShowcase.svelte';
	import SectionTitle from '$site-components/SectionTitle.svelte';
	import ComponentAPI from '$site-components/component-api.svelte';
	import ComponentPageTemplate from '$lib/templates/ComponentPageTemplate.svelte';
	import { eventCardMetadata, eventCardCards, eventCardClassicCard, eventCardBasicCard, eventCardFullCard } from '$lib/component-registry/event-card';
	import type { ShowcaseBlock } from '$lib/templates/types';

	const ndk = getContext<NDKSvelte>('ndk');
	let sampleEvent = $state<NDKEvent | undefined>();

	// State for controlling content visibility
	let showClassicContent = $state(false);
	let showBasicContent = $state(false);
	let showFullContent = $state(false);

	const showcaseBlocks: ShowcaseBlock[] = [
		{
			name: 'Classic',
			description: 'Standard event display for feeds',
			command: 'npx jsrepo add event-card-classic',
			preview: classicPreview,
			cardData: eventCardClassicCard,
			orientation: 'horizontal',
			control: classicControl
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

{#snippet classicControl()}
	<div class="flex gap-2" onclick={(e) => e.stopPropagation()}>
		<button
			class="px-3 py-1.5 text-xs rounded-md transition-colors {!showClassicContent ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}"
			onclick={() => showClassicContent = false}
		>
			Chrome
		</button>
		<button
			class="px-3 py-1.5 text-xs rounded-md transition-colors {showClassicContent ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}"
			onclick={() => showClassicContent = true}
		>
			Content
		</button>
	</div>
{/snippet}

{#snippet classicPreview()}
	{#if sampleEvent}
		<div class="max-w-2xl mx-auto">
			{#if showClassicContent}
				<EventCardClassic {ndk} event={sampleEvent} />
			{:else}
				<EventCard.Root {ndk} event={sampleEvent} class="p-4 rounded-lg border border-border bg-card">
					<div class="flex items-start justify-between gap-2">
						<EventCard.Header />
						<EventCard.Dropdown />
					</div>

					<div class="my-4 p-8 border-2 border-dashed border-muted-foreground/20 rounded-md bg-muted/10">
						<p class="text-sm text-muted-foreground/60 text-center italic">Content area</p>
					</div>

					<EventCard.Actions>
						<div class="flex gap-4 text-muted-foreground/40">
							<div class="flex items-center gap-1">
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
								<span class="text-xs">0</span>
							</div>
							<div class="flex items-center gap-1">
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
								<span class="text-xs">0</span>
							</div>
						</div>
					</EventCard.Actions>
				</EventCard.Root>
			{/if}
		</div>
	{/if}
{/snippet}

{#snippet basicControl()}
	<div class="flex gap-2" onclick={(e) => e.stopPropagation()}>
		<button
			class="px-3 py-1.5 text-xs rounded-md transition-colors {!showBasicContent ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}"
			onclick={() => showBasicContent = false}
		>
			Chrome
		</button>
		<button
			class="px-3 py-1.5 text-xs rounded-md transition-colors {showBasicContent ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}"
			onclick={() => showBasicContent = true}
		>
			Content
		</button>
	</div>
{/snippet}

{#snippet fullControl()}
	<div class="flex gap-2" onclick={(e) => e.stopPropagation()}>
		<button
			class="px-3 py-1.5 text-xs rounded-md transition-colors {!showFullContent ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}"
			onclick={() => showFullContent = false}
		>
			Chrome
		</button>
		<button
			class="px-3 py-1.5 text-xs rounded-md transition-colors {showFullContent ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}"
			onclick={() => showFullContent = true}
		>
			Content
		</button>
	</div>
{/snippet}

{#snippet basicPreview()}
	{#if sampleEvent}
		<div class="max-w-2xl mx-auto">
			{#if showBasicContent}
				<EventCard.Root {ndk} event={sampleEvent} class="p-4 rounded-lg border border-border bg-card">
					<EventCard.Header />
					<EventCard.Content />
				</EventCard.Root>
			{:else}
				<EventCard.Root {ndk} event={sampleEvent} class="p-4 rounded-lg border border-border bg-card">
					<EventCard.Header />
					<div class="my-4 p-8 border-2 border-dashed border-muted-foreground/20 rounded-md bg-muted/10">
						<p class="text-sm text-muted-foreground/60 text-center italic">Content area</p>
					</div>
				</EventCard.Root>
			{/if}
		</div>
	{/if}
{/snippet}

{#snippet fullPreview()}
	{#if sampleEvent}
		<div class="max-w-2xl mx-auto">
			{#if showFullContent}
				<EventCard.Root {ndk} event={sampleEvent} class="p-4 rounded-lg border border-border bg-card">
					<div class="flex items-start justify-between gap-2">
						<EventCard.Header />
						<EventCard.Dropdown />
					</div>
					<EventCard.Content />
					<EventCard.Actions>
						<div class="flex gap-4 text-muted-foreground">
							<button class="flex items-center gap-1 hover:text-foreground transition-colors">
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
								<span class="text-xs">0</span>
							</button>
							<button class="flex items-center gap-1 hover:text-foreground transition-colors">
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
								<span class="text-xs">0</span>
							</button>
						</div>
					</EventCard.Actions>
				</EventCard.Root>
			{:else}
				<EventCard.Root {ndk} event={sampleEvent} class="p-4 rounded-lg border border-border bg-card">
					<div class="flex items-start justify-between gap-2">
						<EventCard.Header />
						<EventCard.Dropdown />
					</div>
					<div class="my-4 p-8 border-2 border-dashed border-muted-foreground/20 rounded-md bg-muted/10">
						<p class="text-sm text-muted-foreground/60 text-center italic">Content area</p>
					</div>
					<EventCard.Actions>
						<div class="flex gap-4 text-muted-foreground/40">
							<div class="flex items-center gap-1">
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
								<span class="text-xs">0</span>
							</div>
							<div class="flex items-center gap-1">
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
								<span class="text-xs">0</span>
							</div>
						</div>
					</EventCard.Actions>
				</EventCard.Root>
			{/if}
		</div>
	{/if}
{/snippet}

{#snippet classicComponentPreview()}
	{#if sampleEvent}
		<div class="max-w-2xl mx-auto">
			<EventCardClassic {ndk} event={sampleEvent} />
		</div>
	{/if}
{/snippet}

{#snippet customSections()}
	<ComponentAPI
		components={[
			{
				name: 'EventCard.Root',
				description:
					'Root container that provides event context to all child components. Handles interactive states and threading metadata.',
				importPath: "import { EventCard } from '$lib/registry/components/event/cards/compound'",
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
				importPath: "import { EventCard } from '$lib/registry/components/event/cards/compound'",
				props: [
					{ name: 'variant', type: "'full' | 'compact' | 'minimal'", default: "'full'", description: 'Display variant' },
					{ name: 'showAvatar', type: 'boolean', default: 'true', description: 'Show author avatar' },
					{ name: 'showTimestamp', type: 'boolean', default: 'true', description: 'Show event timestamp' },
					{ name: 'avatarSize', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Avatar size' },
					{ name: 'class', type: 'string', description: 'Additional CSS classes' }
				],
				slots: [
					{ name: 'children', description: 'Custom actions (e.g., EventDropdown)' }
				]
			},
			{
				name: 'EventCard.Content',
				description: 'Displays event content with optional truncation and media preview support.',
				importPath: "import { EventCard } from '$lib/registry/components/event/cards/compound'",
				props: [
					{ name: 'truncate', type: 'number', description: 'Maximum content length before truncation' },
					{ name: 'class', type: 'string', description: 'Additional CSS classes' }
				]
			},
			{
				name: 'EventCard.Actions',
				description: 'Container for action buttons (reactions, reposts, etc.).',
				importPath: "import { EventCard } from '$lib/registry/components/event/cards/compound'",
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
				importPath: "import EventCardClassic from '$lib/registry/components/event-card-classic/event-card-classic.svelte'",
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
		]}
	/>
{/snippet}

{#if sampleEvent}
	<ComponentPageTemplate
		metadata={eventCardMetadata}
		{ndk}
		{showcaseBlocks}
		{beforeShowcase}
		componentsSection={{
			cards: eventCardCards,
			previews: {
				'event-card-classic': classicComponentPreview
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
