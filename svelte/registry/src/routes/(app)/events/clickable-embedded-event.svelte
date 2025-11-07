<script lang="ts">
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import type { NDKEvent } from '@nostr-dev-kit/ndk';
	import { NDKArticle } from '@nostr-dev-kit/ndk';
	import { ContentRenderer } from '$lib/registry/ui/content-renderer.svelte.js';
	import { createFetchEvent } from '@nostr-dev-kit/svelte';
	import { getContext } from 'svelte';
	import NoteEmbeddedCard from '$lib/registry/components/note-embedded-card/note-embedded-card.svelte';
	import NoteEmbeddedInline from '$lib/registry/components/note-embedded-inline/note-embedded-inline.svelte';
	import NoteEmbeddedCompact from '$lib/registry/components/note-embedded-compact/note-embedded-compact.svelte';
	import ArticleEmbeddedCard from '$lib/registry/components/article-embedded-card/article-embedded-card.svelte';
	import ArticleEmbeddedInline from '$lib/registry/components/article-embedded-inline/article-embedded-inline.svelte';
	import ArticleEmbeddedCompact from '$lib/registry/components/article-embedded-compact/article-embedded-compact.svelte';
	import HighlightEmbeddedCard from '$lib/registry/components/highlight-embedded-card/highlight-embedded-card.svelte';
	import HighlightEmbeddedInline from '$lib/registry/components/highlight-embedded-inline/highlight-embedded-inline.svelte';
	import HighlightEmbeddedCompact from '$lib/registry/components/highlight-embedded-compact/highlight-embedded-compact.svelte';
	import EmbeddedEvent from '$lib/registry/ui/embedded-event.svelte';

	interface Props {
		ndk: NDKSvelte;
		bech32: string;
		renderer: ContentRenderer;
		class?: string;
	}

	let { ndk, bech32, renderer, class: className = '' }: Props = $props();

	// Fetch the event to determine its kind
	const fetcher = createFetchEvent(() => ({ bech32 }), ndk);
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
				<NoteEmbeddedCard {ndk} event={fetcher.event} />
			{:else if variant === 'inline'}
				<NoteEmbeddedInline {ndk} event={fetcher.event} />
			{:else if variant === 'compact'}
				<NoteEmbeddedCompact {ndk} event={fetcher.event} />
			{/if}
		{:else if embedType === 'embedded-article' && asArticle}
			{#if variant === 'card'}
				<ArticleEmbeddedCard {ndk} event={asArticle} />
			{:else if variant === 'inline'}
				<ArticleEmbeddedInline {ndk} event={asArticle} />
			{:else if variant === 'compact'}
				<ArticleEmbeddedCompact {ndk} event={asArticle} />
			{/if}
		{:else if embedType === 'embedded-highlight'}
			{#if variant === 'card'}
				<HighlightEmbeddedCard {ndk} event={fetcher.event} />
			{:else if variant === 'inline'}
				<HighlightEmbeddedInline {ndk} event={fetcher.event} />
			{:else if variant === 'compact'}
				<HighlightEmbeddedCompact {ndk} event={fetcher.event} />
			{/if}
		{:else}
			<EmbeddedEvent {ndk} {bech32} variant={variant as any} {renderer} />
		{/if}
	{:else}
		<div class="text-muted-foreground text-sm p-2">Loading event...</div>
	{/if}
</div>
