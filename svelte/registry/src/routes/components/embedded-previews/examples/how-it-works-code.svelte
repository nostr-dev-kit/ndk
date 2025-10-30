<script lang="ts">
  import type { Component } from 'svelte';
  import { NDKEvent, NDKArticle, NDKHighlight } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createEmbeddedEvent } from '@nostr-dev-kit/svelte';
  import GenericEmbedded from '$lib/ndk/event/content/event/generic-embedded.svelte';

  // Import kind handlers
  import ArticleEmbedded from '$lib/ndk/event/content/kinds/article-embedded.svelte';
  import NoteEmbedded from '$lib/ndk/event/content/kinds/note-embedded.svelte';
  import HighlightEmbedded from '$lib/ndk/event/content/kinds/highlight-embedded.svelte';

  /**
   * KIND_HANDLERS Registry
   *
   * Maps NDK wrapper classes to components.
   * Benefits:
   * - Automatic kind mapping from NDK classes
   * - Type-safe event wrapping with .from()
   * - No manual kind number management
   */
  const CLASS_HANDLERS = [
    [NDKArticle, ArticleEmbedded],
    [NDKHighlight, HighlightEmbedded],
    [{ kinds: [1, 1111] }, NoteEmbedded],
  ];

  // Build kind mapping
  const KIND_HANDLERS: Record<number, any> = {};
  for (const [wrapper, component] of CLASS_HANDLERS) {
    for (const kind of wrapper.kinds || []) {
      KIND_HANDLERS[kind] = { component, wrapper };
    }
  }

  interface Props {
    ndk: NDKSvelte;
    bech32: string;
    variant?: 'inline' | 'card' | 'compact';
  }

  let { ndk, bech32, variant = 'card' }: Props = $props();

  const embedded = createEmbeddedEvent(() => ({ bech32 }), ndk);

  let handlerInfo = $derived(
    embedded.event ? KIND_HANDLERS[embedded.event.kind] : null
  );
  let Handler = $derived(handlerInfo?.component ?? GenericEmbedded);

  // Wrap event using NDK wrapper class
  let wrappedEvent = $derived(
    embedded.event && handlerInfo?.wrapper?.from
      ? handlerInfo.wrapper.from(embedded.event)
      : embedded.event
  );
</script>

{#if embedded.loading}
  <div class="loading">Loading...</div>
{:else if embedded.error}
  <div class="error">Failed to load event</div>
{:else if wrappedEvent && Handler}
  <Handler {ndk} event={wrappedEvent} {variant} />
{/if}
