<script lang="ts">
	import { getContext, setContext } from 'svelte';
	import type { Snippet } from 'svelte';
	import type { NDKEvent } from '@nostr-dev-kit/ndk';
	import type { NotificationContext } from './notification.context';
	import { NOTIFICATION_CONTEXT_KEY } from './notification.context';
	import EmbeddedEvent from '$lib/registry/ui/embedded-event.svelte';
	import { ContentRenderer } from '$lib/registry/ui/content-renderer.svelte';
	import { CONTENT_RENDERER_CONTEXT_KEY } from '$lib/registry/ui/content-renderer.context';
	import NoteEmbeddedCompact from '$lib/registry/components/note-card/note-card.svelte';
	import ArticleEmbedded from '$lib/registry/components/article-card/article-card-medium.svelte';
	import HighlightEmbedded from '$lib/registry/components/highlight-card/highlight-card-feed.svelte';
	import { NDKArticle, NDKHighlight } from '@nostr-dev-kit/ndk';
    import MentionModern from '$lib/registry/components/mention-modern/mention-modern.svelte';
    import { cn } from '$lib/registry/utils/cn';

	interface Props {
		renderer?: ContentRenderer;
		snippet?: Snippet<[{ event: NDKEvent }]>;
		class?: string;
	}

	let { renderer, snippet, class: className }: Props = $props();

	const context = getContext<NotificationContext>(NOTIFICATION_CONTEXT_KEY);

	// Create notification-specific renderer with compact variants
	const defaultRenderer = $derived.by(() => {
		const r = new ContentRenderer();
		r.addKind([1, 1111], NoteEmbeddedCompact);
		r.addKind(NDKArticle, ArticleEmbedded);
		r.addKind(NDKHighlight, HighlightEmbedded);
		r.mentionComponent = MentionModern
		return r;
	});

	const activeRenderer = $derived(renderer || defaultRenderer);

	// Set renderer in context so nested components inherit it
	// This is a legitimate use of prop override - notifications need compact rendering
	setContext(CONTENT_RENDERER_CONTEXT_KEY, { renderer: activeRenderer });
</script>

{#if snippet}
	{@render snippet({ event: context.targetEvent })}
{:else}
	<EmbeddedEvent
		ndk={context.ndk}
		bech32={context.targetEvent.encode()}
		class={cn(className, "text-muted-foreground")}
	/>
{/if}
