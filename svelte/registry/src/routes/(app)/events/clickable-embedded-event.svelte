<script lang="ts">
	import { getContext } from 'svelte';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import type { NDKEvent } from '@nostr-dev-kit/ndk';
	import { NDKArticle } from '@nostr-dev-kit/ndk';
	import { ContentRenderer } from '$lib/registry/ui/content-renderer';
	import { createFetchEvent } from '@nostr-dev-kit/svelte';
		import EventCardBasic from '$lib/registry/components/event-card-basic/event-card-basic.svelte';
	import EventCardInline from '$lib/registry/components/event-card-inline/event-card-inline.svelte';
	import EventCardCompact from '$lib/registry/components/event-card-compact/event-card-compact.svelte';
	import ArticleCardMedium from '$lib/registry/components/article-card/article-card-medium.svelte';
	import ArticleCardInline from '$lib/registry/components/article-card-inline/article-card-inline.svelte';
	import ArticleCardCompact from '$lib/registry/components/article-card-compact/article-card-compact.svelte';
	import ArticleCardHero from '$lib/registry/components/article-card-hero/article-card-hero.svelte';
	import ArticleCardNeon from '$lib/registry/components/article-card-neon/article-card-neon.svelte';
	import ArticleCardPortrait from '$lib/registry/components/article-card-portrait/article-card-portrait.svelte';
	import HighlightCardFeed from '$lib/registry/components/highlight-card-feed/highlight-card-feed.svelte';
	import HighlightCardInline from '$lib/registry/components/highlight-card-inline/highlight-card-inline.svelte';
	import HighlightCardCompact from '$lib/registry/components/highlight-card-compact/highlight-card-compact.svelte';
	import EmbeddedEvent from '$lib/registry/ui/embedded-event.svelte';

	interface Props {
		ndk: NDKSvelte;
		bech32: string;
		renderer: ContentRenderer;
		class?: string;
	}

	let { ndk, bech32, renderer, class: className = '' }: Props = $props();

	// Fetch the event to determine its kind
	const fetcher = createFetchEvent(ndk, () => ({ bech32 }));
	const eventKind = $derived(fetcher.event?.kind);

	// Determine the embed type based on kind
	const embedType = $derived.by(() => {
		if (!eventKind) return 'embedded-event';
		if (eventKind === 1 || eventKind === 1111) return 'embedded-note';
		if (eventKind === 30023) return 'embedded-article';
		if (eventKind === 9802) return 'embedded-highlight';
		return 'embedded-generic';
	});

	// Cast to NDKArticle when it's an article
	const asArticle = $derived(fetcher.event ? NDKArticle.from(fetcher.event) : undefined);

	// Get interactive state from context
	const interactiveState = getContext<{
		selectedEmbed: string | null;
		variants: Record<string, string>;
		selectEmbed: (type: string, kind?: number) => void;
	}>('interactive-demo');

	const isSelected = $derived(interactiveState && interactiveState.selectedEmbed === embedType);
	const variant = $derived(interactiveState ? interactiveState.variants[embedType] || 'card' : 'card');

	function handleSelect(e: MouseEvent | KeyboardEvent) {
		e.stopPropagation();
		if (interactiveState && eventKind !== undefined) {
			interactiveState.selectEmbed(embedType, eventKind);
		}
	}
</script>

<div
	class="cursor-pointer border-2 {isSelected
		? 'border-orange-500'
		: 'border-orange-500/30'} border-dashed rounded p-2 my-2 transition-colors {className}"
	role="button"
	tabindex="0"
	onclick={handleSelect}
	onkeydown={(e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			handleSelect(e);
		}
	}}
>
	{#if variant === 'raw'}
		<div class="text-muted-foreground font-mono text-sm break-all p-2 bg-muted rounded">
			{bech32}
		</div>
	{:else if fetcher.event}
		{#if embedType === 'embedded-note'}
			{#if variant === 'card'}
				<EventCardBasic {ndk} event={fetcher.event} />
			{:else if variant === 'inline'}
				<EventCardInline {ndk} event={fetcher.event} />
			{:else if variant === 'compact'}
				<EventCardCompact {ndk} event={fetcher.event} />
			{/if}
		{:else if embedType === 'embedded-article' && asArticle}
			{#if variant === 'inline'}
				<ArticleCardInline {ndk} event={asArticle} />
			{:else if variant === 'compact'}
				<ArticleCardCompact {ndk} event={asArticle} />
			{:else if variant === 'medium'}
				<ArticleCardMedium {ndk} event={asArticle} />
			{:else if variant === 'hero'}
				<ArticleCardHero {ndk} event={asArticle} />
			{:else if variant === 'neon'}
				<ArticleCardNeon {ndk} event={asArticle} />
			{:else if variant === 'portrait'}
				<ArticleCardPortrait {ndk} event={asArticle} />
			{/if}
		{:else if embedType === 'embedded-highlight'}
			{#if variant === 'card'}
				<HighlightCardFeed {ndk} event={fetcher.event} />
			{:else if variant === 'inline'}
				<HighlightCardInline {ndk} event={fetcher.event} />
			{:else if variant === 'compact'}
				<HighlightCardCompact {ndk} event={fetcher.event} />
			{/if}
		{:else}
			<EmbeddedEvent {ndk} {bech32} {renderer} />
		{/if}
	{:else}
		<div class="text-muted-foreground text-sm p-2">Loading event...</div>
	{/if}
</div>
