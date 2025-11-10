<script lang="ts">
	import { getContext } from 'svelte';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import type { NDKEvent } from '@nostr-dev-kit/ndk';
	import EventCardClassic from '$lib/registry/components/event-card-classic/event-card-classic.svelte';
	import EventCardBasic from '$lib/registry/components/event-card-basic/event-card-basic.svelte';
	import { EventCardInline } from '$lib/registry/components/event-card-inline';
	import { EventCardCompact } from '$lib/registry/components/event-card-compact';
	import { EventCard } from '$lib/registry/components/event-card';
	import { EditProps } from '$lib/site/components/edit-props';
	import ComponentAPI from '$site-components/component-api.svelte';
	import ComponentPageTemplate from '$lib/site/templates/ComponentPageTemplate.svelte';
	import Preview from '$site-components/preview.svelte';
	import type { ShowcaseComponent } from '$lib/site/templates/types';

	// Import example code
	import inlineReplyCode from './examples/inline-reply/index.txt?raw';
	import InlineReplyExample from './examples/inline-reply/index.svelte';

	// Import registry metadata
	import eventCardClassicCard from '$lib/registry/components/event-card-classic/metadata.json';
	import eventCardBasicCard from '$lib/registry/components/event-card-basic/metadata.json';
	import eventCardInlineCard from '$lib/registry/components/event-card-inline/metadata.json';
	import eventCardCompactCard from '$lib/registry/components/event-card-compact/metadata.json';

	const eventCardCards = [eventCardClassicCard, eventCardBasicCard, eventCardInlineCard, eventCardCompactCard];

  // Get page data
  let { data } = $props();
  const { metadata } = data;

	const ndk = getContext<NDKSvelte>('ndk');
	let sampleEvent = $state<NDKEvent | undefined>();

	// State for controlling content visibility
	let showClassicContent = $state(false);
	let showBasicContent = $state(false);
	let showFullContent = $state(false);

	// Toast state for preview feedback
	let toastMessage = $state<string>('');
	let showToast = $state(false);

	function showFeedback(msg: string) {
		toastMessage = msg;
		showToast = true;
		setTimeout(() => showToast = false, 4000);
	}

	const showcaseComponents: ShowcaseComponent[] = [
    {
      id: 'event-card-classic',
      cardData: eventCardClassicCard,
      preview: classicPreview,
      orientation: 'horizontal',
    },
    {
      id: 'event-card-basic',
      cardData: eventCardBasicCard,
      preview: basicPreview,
      orientation: 'horizontal',
    },
    {
      id: 'event-card-inline',
      cardData: eventCardInlineCard,
      preview: inlinePreview,
      orientation: 'horizontal',
    },
    {
      id: 'event-card-compact',
      cardData: eventCardCompactCard,
      preview: compactPreview,
      orientation: 'horizontal',
    }
  ];
</script>

{#snippet overview()}
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
						<span><strong>EventCard.ReplyIndicator</strong> — Shows reply context with parent event author</span>
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

{#snippet fullControl()}
	<div class="flex gap-2" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()} role="presentation">
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
			<EventCardBasic
				{ndk}
				event={sampleEvent}
				onReplyIntent={(event) => showFeedback('📝 Reply clicked – here you\'d show one of the Reply components')}
				onQuoteIntent={(event) => showFeedback('💬 Quote clicked – here you\'d show a Quote composer')}
				onZapIntent={(event, zapFn) => showFeedback('⚡ Zap clicked – here you\'d show the ZapSend component, then call zapFn(amount, comment)')}
			/>
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

{#snippet basicComponentPreview()}
	{#if sampleEvent}
		<div class="max-w-2xl mx-auto">
			<EventCardBasic {ndk} event={sampleEvent} />
		</div>
	{/if}
{/snippet}

{#snippet inlinePreview()}
	{#if sampleEvent}
		<div class="max-w-2xl mx-auto">
			<EventCardInline {ndk} event={sampleEvent} />
		</div>
	{/if}
{/snippet}

{#snippet inlineComponentPreview()}
	{#if sampleEvent}
		<div class="max-w-2xl mx-auto">
			<EventCardInline {ndk} event={sampleEvent} />
		</div>
	{/if}
{/snippet}

{#snippet compactPreview()}
	{#if sampleEvent}
		<div class="max-w-2xl mx-auto">
			<EventCardCompact {ndk} event={sampleEvent} />
		</div>
	{/if}
{/snippet}

{#snippet compactComponentPreview()}
	{#if sampleEvent}
		<div class="max-w-2xl mx-auto">
			<EventCardCompact {ndk} event={sampleEvent} />
		</div>
	{/if}
{/snippet}

{#snippet anatomy()}
	<ComponentAPI
		component={{
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
		}}
	/>

	<ComponentAPI
		component={{
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
				{ name: 'children', description: 'Custom actions (e.g., EventDropdown)' }
			]
		}}
	/>

	<ComponentAPI
		component={{
			name: 'EventCard.Content',
			description: 'Displays event content with optional truncation and media preview support.',
			importPath: "import { EventCard } from '$lib/registry/components/event-card'",
			props: [
				{ name: 'truncate', type: 'number', description: 'Maximum content length before truncation' },
				{ name: 'class', type: 'string', description: 'Additional CSS classes' }
			]
		}}
	/>

	<h3 class="text-xl font-bold">EventCard.ReplyIndicator</h3>
	<ComponentAPI
		component={{
			name: 'EventCard.ReplyIndicator',
			description: 'Shows when the event is a reply, displaying "Replying to @author" with the parent event author information.',
			importPath: "import { EventCard } from '$lib/registry/components/event-card'",
			props: [
				{ name: 'class', type: 'string', description: 'Additional CSS classes' },
				{ name: 'onclick', type: '(event: NDKEvent) => void', description: 'Click handler for the parent event' }
			],
			slots: [
				{ name: 'children', description: 'Custom render function for reply indicator (receives { event: NDKEvent | null; loading: boolean })' }
			]
		}}
	/>

	<ComponentAPI
		component={{
			name: 'EventCard.Actions',
			description: 'Container for action buttons (reactions, reposts, etc.).',
			importPath: "import { EventCard } from '$lib/registry/components/event-card'",
			props: [
				{ name: 'class', type: 'string', description: 'Additional CSS classes' }
			],
			slots: [
				{ name: 'children', description: 'Action components (ReactionButton, ReactionLongpress, RepostButton, etc.)' }
			]
		}}
	/>

	<ComponentAPI
		component={{
			name: 'EventCardClassic',
			description: 'Pre-composed event card with classic styling: rounded corners, card background, and hover effects. Always shows dropdown menu and all action buttons (reply, repost, reaction, zap). Supports callbacks for user interactions (reply, quote, zap) while reaction and repost are auto-handled.',
			importPath: "import EventCardClassic from '$lib/registry/components/event-card-classic/event-card-classic.svelte'",
			props: [
				{ name: 'ndk', type: 'NDKSvelte', description: 'NDK instance', required: true },
				{ name: 'event', type: 'NDKEvent', description: 'The event to display', required: true },
				{ name: 'truncate', type: 'number', description: 'Maximum content length before truncation' },
				{ name: 'onReplyIntent', type: 'ReplyIntentCallback', description: 'Callback when user wants to reply. Receives the event to reply to. Use this to show a reply composer UI.' },
				{ name: 'onQuoteIntent', type: 'QuoteIntentCallback', description: 'Callback when user wants to quote. Receives the event to quote. Use this to show a quote composer UI.' },
				{ name: 'onZapIntent', type: 'ZapIntentCallback', description: 'Callback when user wants to zap. Receives the event and zap function. Show a zap UI to collect amount/comment, then call zapFn(amount, comment).' },
				{ name: 'class', type: 'string', description: 'Additional CSS classes' }
			]
		}}
	/>

	<ComponentAPI
		component={{
			name: 'EventCardBasic',
			description: 'Pre-composed event card with minimal flat design: no rounded corners, flat background, and subtle hover effects. Always shows dropdown menu and all action buttons (reply, repost, reaction, zap). Supports callbacks for user interactions (reply, quote, zap) while reaction and repost are auto-handled. Optional avatar variants show who engaged with the event.',
			importPath: "import EventCardBasic from '$lib/registry/components/event-card-basic/event-card-basic.svelte'",
			props: [
				{ name: 'ndk', type: 'NDKSvelte', description: 'NDK instance', required: true },
				{ name: 'event', type: 'NDKEvent', description: 'The event to display', required: true },
				{ name: 'truncate', type: 'number', description: 'Maximum content length before truncation' },
				{ name: 'withAvatars', type: 'boolean', default: 'false', description: 'Use avatar button variants showing who engaged with the event (filtered to only show follows)' },
				{ name: 'onReplyIntent', type: 'ReplyIntentCallback', description: 'Callback when user wants to reply. Receives the event to reply to. Use this to show a reply composer UI.' },
				{ name: 'onQuoteIntent', type: 'QuoteIntentCallback', description: 'Callback when user wants to quote. Receives the event to quote. Use this to show a quote composer UI.' },
				{ name: 'onZapIntent', type: 'ZapIntentCallback', description: 'Callback when user wants to zap. Receives the event and zap function. Show a zap UI to collect amount/comment, then call zapFn(amount, comment).' },
				{ name: 'class', type: 'string', description: 'Additional CSS classes' }
			]
		}}
	/>
{/snippet}

{#snippet recipes()}
	<section>
		<h2 class="text-2xl font-bold mb-4">Reply Composition</h2>
		<p class="text-muted-foreground mb-6">
			Instead of just showing "Replying to @user", you can use any other card, like EventCardInline to display something else.
		</p>

		<Preview code={inlineReplyCode}>
			{#if sampleEvent}
				<InlineReplyExample {ndk} event={sampleEvent} />
			{/if}
		</Preview>

		<div class="mt-6 p-4 bg-muted/30 border border-border rounded-lg">
			<h3 class="text-lg font-semibold mb-2">How it works</h3>
			<ul class="space-y-2 text-sm text-muted-foreground">
				<li class="flex items-start gap-2">
					<span class="text-primary">•</span>
					<span>
						<code class="px-1.5 py-0.5 bg-muted rounded text-xs">EventCard.ReplyIndicator</code> accepts a
						<code class="px-1.5 py-0.5 bg-muted rounded text-xs">children</code> snippet that receives the replied-to event
					</span>
				</li>
				<li class="flex items-start gap-2">
					<span class="text-primary">•</span>
					<span>
						The snippet receives <code class="px-1.5 py-0.5 bg-muted rounded text-xs">{'{ event, loading }'}</code> —
						render EventCardInline when the event is loaded
					</span>
				</li>
			</ul>
		</div>
	</section>
{/snippet}

<!-- Toast notification -->
{#if showToast}
	<div class="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
		<div class="bg-card border border-primary/20 shadow-lg rounded-lg p-4 max-w-sm">
			<p class="text-sm text-foreground">{toastMessage}</p>
		</div>
	</div>
{/if}

<ComponentPageTemplate
	metadata={metadata}
	{ndk}
	{showcaseComponents}
	{overview}
	componentsSection={{
		cards: eventCardCards,
		previews: {
			'event-card-classic': classicComponentPreview,
			'event-card-basic': basicComponentPreview,
			'event-card-inline': inlineComponentPreview,
			'event-card-compact': compactComponentPreview
		}
	}}
	{recipes}
	{anatomy}
>
	<EditProps.Prop
		name="Sample Event"
		type="event"
		bind:value={sampleEvent}
		default="nevent1qgsxu35yyt0mwjjh8pcz4zprhxegz69t4wr9t74vk6zne58wzh0waycpzamhxue69uhhyetvv9ujuurjd9kkzmpwdejhgtcqyrn4zsz2k54283whepmvmnkgxfqg4rwf2vgvmhlffvmsy8t8kk0hzgy4uh8"
	/>
</ComponentPageTemplate>
