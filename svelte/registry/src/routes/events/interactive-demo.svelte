<script lang="ts">
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import { createEventFetcher } from '@nostr-dev-kit/svelte';
	import { EventCard } from '$lib/registry/components/event-card';
	import EventContent from '$lib/registry/ui/event-content.svelte';
	import { ContentRenderer } from '$lib/registry/ui/content-renderer.svelte.js';
	import ClickableMention from './clickable-mention.svelte';
	import ClickableHashtag from './clickable-hashtag.svelte';
	import ClickableEmbeddedEvent from './clickable-embedded-event.svelte';
	import { setContext } from 'svelte';

	interface Props {
		ndk: NDKSvelte;
	}

	let { ndk }: Props = $props();

	// Fetch the demo event
	const eventFetcher = createEventFetcher(
		() => ({
			default:
				'nevent1qvzqqqqqqypzq0mgmm0gz4yuczzyltl99rc4wj63uz27wjglg69aj6ylsamehwqaqqst6h0tdve9v0xwwpz4d4ckwfc9ksjtjjjutc4smjzewp85u7a9v0qhd8czh'
		}),
		ndk
	);

	type EmbedType = 'chrome' | 'mention' | 'hashtag' | 'embedded-event';

	let selectedEmbed = $state<EmbedType | null>(null);
	let variants = $state<Record<EmbedType, string>>({
		chrome: 'standard',
		mention: 'inline',
		hashtag: 'inline',
		'embedded-event': 'card'
	});

	const chromeVariants = [
		{ key: 'standard', label: 'Standard', description: 'Full card with all metadata and actions' },
		{ key: 'compact', label: 'Compact', description: 'Condensed layout for dense feeds' },
		{ key: 'minimal', label: 'Minimal', description: 'Just the essentials' },
		{ key: 'threaded', label: 'Threaded', description: 'Optimized for conversations' }
	];

	const mentionVariants = [
		{ key: 'raw', label: 'Raw', description: 'Unprocessed bech32 string' },
		{ key: 'inline', label: 'Inline', description: 'Inline mention with name' },
		{ key: 'badge', label: 'Badge', description: 'Pill-style badge' },
		{ key: 'avatar', label: 'Avatar', description: 'With profile picture' }
	];

	const hashtagVariants = [
		{ key: 'raw', label: 'Raw', description: 'Plain #hashtag text' },
		{ key: 'inline', label: 'Inline', description: 'Clickable inline hashtag' },
		{ key: 'badge', label: 'Badge', description: 'Pill-style badge' },
		{ key: 'chip', label: 'Chip', description: 'Rounded chip style' }
	];

	const embeddedVariants = [
		{ key: 'raw', label: 'Raw', description: 'Unprocessed nostr: reference' },
		{ key: 'card', label: 'Card', description: 'Full event card preview' },
		{ key: 'inline', label: 'Inline', description: 'Compact inline preview' },
		{ key: 'compact', label: 'Compact', description: 'Minimal preview' }
	];

	function selectEmbed(embedType: EmbedType) {
		selectedEmbed = embedType;
	}

	function selectVariant(embedType: EmbedType, variantKey: string) {
		variants[embedType] = variantKey;
	}

	// Create custom renderer that uses our clickable components
	const customRenderer = new ContentRenderer();
	customRenderer.mentionComponent = ClickableMention as any;
	customRenderer.hashtagComponent = ClickableHashtag as any;

	// Set context so child components can access the interactive state
	setContext('interactive-demo', {
		get selectedEmbed() {
			return selectedEmbed;
		},
		get variants() {
			return variants;
		},
		selectEmbed
	});
</script>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
	<!-- Main Event Display -->
	<div class="lg:col-span-2">
		<div class="rounded-lg border-2 border-border overflow-hidden bg-card">
			{#if eventFetcher.loading}
				<div class="p-8 text-center text-muted-foreground">
					<div
						class="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"
					></div>
					Loading event...
				</div>
			{:else if eventFetcher.event}
				<!-- Chrome Layer (Clickable) -->
				<div
					role="button"
					tabindex="0"
					class="cursor-pointer border-2 {selectedEmbed === 'chrome'
						? 'border-blue-500'
						: 'border-blue-500/30'} border-dashed transition-colors p-4 relative"
					onclick={() => selectEmbed('chrome')}
					onkeydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault();
			selectEmbed('chrome');
						}
					}}
				>
					<div class="absolute top-2 left-2 bg-card px-2 py-1 rounded border-2 border-blue-500 text-blue-500 text-xs font-bold uppercase">
						Layer 1: Chrome
					</div>

					<EventCard.Root {ndk} event={eventFetcher.event}>
						<EventCard.Header />

						<!-- Content Layer (Purple border) -->
						<div class="my-3">
							<div class="border-2 border-purple-500/30 border-dashed rounded p-3 relative">
								<div class="absolute top-2 left-2 bg-card px-2 py-1 rounded border-2 border-purple-500 text-purple-500 text-xs font-bold uppercase z-10">
									Layer 2: Content
								</div>
								<div class="pt-6">
									<EventContent {ndk} event={eventFetcher.event} renderer={customRenderer} />
								</div>
							</div>
						</div>

						<EventCard.Actions />
					</EventCard.Root>
				</div>
			{:else}
				<div class="p-8 text-center text-destructive">Failed to load event</div>
			{/if}
		</div>
	</div>

	<!-- Variant Selector Sidebar -->
	<div class="space-y-4">
		<div>
			<h3 class="font-semibold mb-2 text-sm uppercase tracking-wide text-muted-foreground">
				Selected Layer
			</h3>
			{#if selectedEmbed}
				<div
					class="p-3 rounded-lg border-2 {selectedEmbed === 'chrome'
						? 'border-blue-500 bg-blue-500/5'
						: selectedEmbed === 'mention' || selectedEmbed === 'hashtag'
							? 'border-purple-500 bg-purple-500/5'
							: 'border-orange-500 bg-orange-500/5'}"
				>
					<div class="font-semibold capitalize">{selectedEmbed.replace('-', ' ')}</div>
					<div class="text-xs text-muted-foreground mt-1">
						{#if selectedEmbed === 'chrome'}
							Layer 1: Card container with metadata
						{:else if selectedEmbed === 'mention'}
							Layer 2: Inline user mention
						{:else if selectedEmbed === 'hashtag'}
							Layer 2: Inline hashtag
						{:else if selectedEmbed === 'embedded-event'}
							Layer 3: Embedded event preview
						{/if}
					</div>
				</div>
			{:else}
				<div class="p-3 rounded-lg border border-border bg-muted/50 text-sm text-muted-foreground">
					Click on any layer to select it
				</div>
			{/if}
		</div>

		{#if selectedEmbed}
			<div>
				<h3 class="font-semibold mb-2 text-sm uppercase tracking-wide text-muted-foreground">
					Available Variants
				</h3>
				<div class="space-y-2">
					{#if selectedEmbed === 'chrome'}
						{#each chromeVariants as variant}
							<button
								type="button"
								class="w-full text-left p-3 rounded-lg border transition-colors {variants.chrome ===
								variant.key
									? 'border-blue-500 bg-blue-500/10'
									: 'border-border hover:border-blue-500/50 hover:bg-accent'}"
								onclick={() => selectVariant('chrome', variant.key)}
							>
								<div class="font-medium text-sm">{variant.label}</div>
								<div class="text-xs text-muted-foreground mt-1">{variant.description}</div>
							</button>
						{/each}
					{:else if selectedEmbed === 'mention'}
						{#each mentionVariants as variant}
							<button
								type="button"
								class="w-full text-left p-3 rounded-lg border transition-colors {variants.mention ===
								variant.key
									? 'border-purple-500 bg-purple-500/10'
									: 'border-border hover:border-purple-500/50 hover:bg-accent'}"
								onclick={() => selectVariant('mention', variant.key)}
							>
								<div class="font-medium text-sm">{variant.label}</div>
								<div class="text-xs text-muted-foreground mt-1">{variant.description}</div>
							</button>
						{/each}
					{:else if selectedEmbed === 'hashtag'}
						{#each hashtagVariants as variant}
							<button
								type="button"
								class="w-full text-left p-3 rounded-lg border transition-colors {variants.hashtag ===
								variant.key
									? 'border-purple-500 bg-purple-500/10'
									: 'border-border hover:border-purple-500/50 hover:bg-accent'}"
								onclick={() => selectVariant('hashtag', variant.key)}
							>
								<div class="font-medium text-sm">{variant.label}</div>
								<div class="text-xs text-muted-foreground mt-1">{variant.description}</div>
							</button>
						{/each}
					{:else if selectedEmbed === 'embedded-event'}
						{#each embeddedVariants as variant}
							<button
								type="button"
								class="w-full text-left p-3 rounded-lg border transition-colors {variants[
									'embedded-event'
								] === variant.key
									? 'border-orange-500 bg-orange-500/10'
									: 'border-border hover:border-orange-500/50 hover:bg-accent'}"
								onclick={() => selectVariant('embedded-event', variant.key)}
							>
								<div class="font-medium text-sm">{variant.label}</div>
								<div class="text-xs text-muted-foreground mt-1">{variant.description}</div>
							</button>
						{/each}
					{/if}
				</div>
			</div>
		{/if}

		<div class="text-xs text-muted-foreground space-y-2 pt-4 border-t border-border">
			<div class="flex items-center gap-2">
				<div class="w-3 h-3 border-2 border-blue-500 border-dashed rounded"></div>
				<span>Chrome (Card container)</span>
			</div>
			<div class="flex items-center gap-2">
				<div class="w-3 h-3 border-2 border-purple-500 border-dashed rounded"></div>
				<span>Content (Event body)</span>
			</div>
			<div class="flex items-center gap-2">
				<div class="w-3 h-3 border-2 border-orange-500 border-dashed rounded"></div>
				<span>Embeds (References)</span>
			</div>
		</div>
	</div>
</div>
