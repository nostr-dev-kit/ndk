<script lang="ts">
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import type { NDKEvent } from '@nostr-dev-kit/ndk';
	import { EventCard } from '$lib/registry/components/event-card';
	import ClickableEventContent from './clickable-event-content.svelte';
	import { ContentRenderer } from '$lib/registry/ui/content-renderer.svelte.js';
	import ClickableMention from './clickable-mention.svelte';
	import ClickableHashtag from './clickable-hashtag.svelte';
	import GenericCard from '$lib/registry/components/generic-card/generic-card.svelte';
	import { setContext } from 'svelte';

	interface Props {
		ndk: NDKSvelte;
		event: NDKEvent;
	}

	let { ndk, event }: Props = $props();

	type EmbedType =
		| 'chrome'
		| 'mention'
		| 'hashtag'
		| 'embedded-note'
		| 'embedded-article'
		| 'embedded-highlight'
		| 'embedded-generic'
		| 'embedded-event';

	let selectedEmbed = $state<EmbedType | null>(null);
	let selectedKind = $state<number | undefined>(undefined);
	let variants = $state<Record<EmbedType, string>>({
		chrome: 'composable',
		mention: 'mention',
		hashtag: 'hashtag',
		'embedded-note': 'card',
		'embedded-article': 'card',
		'embedded-highlight': 'card',
		'embedded-generic': 'card',
		'embedded-event': 'card'
	});

	const chromeVariants = [
		{
			key: 'composable',
			label: 'Composable (Root + Header + Content + Actions)',
			description: 'Build custom layouts by composing EventCard primitives'
		}
	];

	const mentionVariants = [
		{ key: 'raw', label: 'Raw', description: 'Unprocessed bech32 string' },
		{ key: 'mention', label: 'Mention', description: 'Basic inline mention with @name' },
		{
			key: 'mention-modern',
			label: 'Mention Modern',
			description: 'With avatar and popover user card'
		}
	];

	const hashtagVariants = [
		{ key: 'raw', label: 'Raw', description: 'Plain #hashtag text' },
		{ key: 'hashtag', label: 'Hashtag', description: 'Basic clickable hashtag' },
		{
			key: 'hashtag-modern',
			label: 'Hashtag Modern',
			description: 'With gradient dot and popover card'
		}
	];

	const embeddedVariants = [
		{ key: 'raw', label: 'Raw', description: 'Unprocessed nostr: reference' },
		{ key: 'card', label: 'Card', description: 'Full event card preview' },
		{ key: 'inline', label: 'Inline', description: 'Compact inline preview' },
		{ key: 'compact', label: 'Compact', description: 'Minimal preview' }
	];

	const articleCardVariants = [
		{ key: 'raw', label: 'Raw', description: 'Unprocessed nostr: reference' },
		{ key: 'card', label: 'ArticleCardMedium', description: 'Horizontal layout with image' },
		{ key: 'inline', label: 'ArticleCardInline', description: 'Compact inline preview' },
		{ key: 'compact', label: 'ArticleCardCompact', description: 'Minimal preview' },
		{ key: 'medium', label: 'ArticleCardMedium', description: 'Horizontal layout with image' },
		{ key: 'hero', label: 'ArticleCardHero', description: 'Large featured card' },
		{ key: 'neon', label: 'ArticleCardNeon', description: 'Neon-themed card' },
		{ key: 'portrait', label: 'ArticleCardPortrait', description: 'Portrait orientation card' }
	];

	// Generate variants with actual component names
	const currentEmbeddedVariants = $derived.by(() => {
		if (!selectedEmbed) return embeddedVariants;

		if (selectedEmbed === 'embedded-article') {
			return articleCardVariants;
		}

		const componentPrefix =
			selectedEmbed === 'embedded-note'
				? 'Note'
				: selectedEmbed === 'embedded-highlight'
					? 'Highlight'
					: selectedEmbed === 'embedded-generic'
						? 'Generic'
						: null;

		if (!componentPrefix) return embeddedVariants;

		return embeddedVariants.map((v) =>
			v.key === 'raw'
				? v
				: {
						...v,
						label: `${componentPrefix}Card${v.key.charAt(0).toUpperCase() + v.key.slice(1)}`
					}
		);
	});

	function selectEmbed(embedType: EmbedType, kind?: number) {
		selectedEmbed = embedType;
		selectedKind = kind;
	}

	function selectVariant(embedType: EmbedType, variantKey: string) {
		variants[embedType] = variantKey;
	}

	// Create custom renderer that uses our clickable components
	const customRenderer = new ContentRenderer();
	customRenderer.mentionComponent = ClickableMention as any;
	customRenderer.hashtagComponent = ClickableHashtag as any;
	customRenderer.fallbackComponent = GenericCard;

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
				<EventCard.Root {ndk} {event}>
					<EventCard.Header />

					<!-- Content Layer (Purple border) -->
					<div class="my-3">
						<div
							role="button"
							tabindex="0"
							class="border-2 {selectedEmbed === 'mention' || selectedEmbed === 'hashtag'
								? 'border-purple-500'
								: 'border-purple-500/30'} border-dashed rounded p-3 relative cursor-pointer transition-all"
							onclick={(e) => {
								e.stopPropagation();
								selectEmbed('mention');
							}}
							onkeydown={(e) => {
								if (e.key === 'Enter' || e.key === ' ') {
									e.preventDefault();
									e.stopPropagation();
									selectEmbed('mention');
								}
							}}
						>
							<ClickableEventContent {ndk} {event} renderer={customRenderer} />
						</div>
					</div>

					<EventCard.Actions />
				</EventCard.Root>
			</div>
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
						: 'border-orange-500 bg-orange-500/5'}"
				>
					<div class="font-semibold capitalize">{selectedEmbed.replace(/-/g, ' ')}</div>
					<div class="text-xs text-muted-foreground mt-1">
						{#if selectedEmbed === 'chrome'}
							Layer 1: Card container with metadata
						{:else if selectedEmbed === 'mention'}
							Layer 3: Inline user mention
						{:else if selectedEmbed === 'hashtag'}
							Layer 3: Inline hashtag
						{:else if selectedEmbed === 'embedded-note'}
							Layer 3: Embedded note (kind {selectedKind})
						{:else if selectedEmbed === 'embedded-article'}
							Layer 3: Embedded article (kind {selectedKind})
						{:else if selectedEmbed === 'embedded-highlight'}
							Layer 3: Embedded highlight (kind {selectedKind})
						{:else if selectedEmbed === 'embedded-generic'}
							Layer 3: Embedded event (kind {selectedKind})
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
					{:else if selectedEmbed === 'embedded-note'}
						{#each currentEmbeddedVariants as variant}
							<button
								type="button"
								class="w-full text-left p-3 rounded-lg border transition-colors {variants[
									'embedded-note'
								] === variant.key
									? 'border-orange-500 bg-orange-500/10'
									: 'border-border hover:border-orange-500/50 hover:bg-accent'}"
								onclick={() => selectVariant('embedded-note', variant.key)}
							>
								<div class="font-medium text-sm">{variant.label}</div>
								<div class="text-xs text-muted-foreground mt-1">{variant.description}</div>
							</button>
						{/each}
					{:else if selectedEmbed === 'embedded-article'}
						{#each currentEmbeddedVariants as variant}
							<button
								type="button"
								class="w-full text-left p-3 rounded-lg border transition-colors {variants[
									'embedded-article'
								] === variant.key
									? 'border-orange-500 bg-orange-500/10'
									: 'border-border hover:border-orange-500/50 hover:bg-accent'}"
								onclick={() => selectVariant('embedded-article', variant.key)}
							>
								<div class="font-medium text-sm">{variant.label}</div>
								<div class="text-xs text-muted-foreground mt-1">{variant.description}</div>
							</button>
						{/each}
					{:else if selectedEmbed === 'embedded-highlight'}
						{#each currentEmbeddedVariants as variant}
							<button
								type="button"
								class="w-full text-left p-3 rounded-lg border transition-colors {variants[
									'embedded-highlight'
								] === variant.key
									? 'border-orange-500 bg-orange-500/10'
									: 'border-border hover:border-orange-500/50 hover:bg-accent'}"
								onclick={() => selectVariant('embedded-highlight', variant.key)}
							>
								<div class="font-medium text-sm">{variant.label}</div>
								<div class="text-xs text-muted-foreground mt-1">{variant.description}</div>
							</button>
						{/each}
					{:else if selectedEmbed === 'embedded-generic' || selectedEmbed === 'embedded-event'}
						{#each currentEmbeddedVariants as variant}
							<button
								type="button"
								class="w-full text-left p-3 rounded-lg border transition-colors {variants[
									selectedEmbed
								] === variant.key
									? 'border-orange-500 bg-orange-500/10'
									: 'border-border hover:border-orange-500/50 hover:bg-accent'}"
								onclick={() => selectVariant(selectedEmbed, variant.key)}
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
