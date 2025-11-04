<script lang="ts">
	import { getContext } from 'svelte';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import type { NDKEvent } from '@nostr-dev-kit/ndk';
	import EventCardClassic from '$lib/registry/components/event-card/event-card-classic.svelte';
	import EventCardMenu from '$lib/registry/components/event-card/event-card-menu.svelte';
	import { EditProps } from '$lib/site-components/edit-props';
  import PageTitle from '$lib/site-components/PageTitle.svelte';
	import ComponentsShowcase from '$site-components/ComponentsShowcase.svelte';
	import ComponentCard from '$site-components/ComponentCard.svelte';
	import ComponentPageSectionTitle from '$site-components/ComponentPageSectionTitle.svelte';
	import ComponentAPI from '$site-components/component-api.svelte';
	import ComponentPageTemplate from '$lib/templates/ComponentPageTemplate.svelte';
	import { eventCardMetadata, eventCardCards, eventCardClassicCard, eventCardMenuCard, eventCardBasicCard, eventCardFullCard } from '$lib/component-registry/event-card';
	import type { ShowcaseBlock } from '$lib/templates/types';

	import UIBasic from './examples/ui-basic.example.svelte';
	import UIFull from './examples/ui-full.example.svelte';
	import ChromeDemo from './examples/chrome-demo.example.svelte';

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

			<ComponentCard data={{ name: 'chrome-demo', title: 'Interactive Chrome Demo', description: 'See how the chrome adapts to different event kinds', richDescription: 'See how the same chrome adapts to different event kinds. The header, layout, and actions stay consistent while the content changes.', command: 'npx shadcn@latest add event-card', apiDocs: [] }}>
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
			<UIBasic {ndk} event={sampleEvent} />
		</div>
	{/if}
{/snippet}

{#snippet fullPreview()}
	{#if sampleEvent}
		<div class="max-w-2xl mx-auto">
			<UIFull {ndk} event={sampleEvent} />
		</div>
	{/if}
{/snippet}

{#snippet afterShowcase()}
	{#if sampleEvent}
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
		{showcaseBlocks}{beforeShowcase}
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
