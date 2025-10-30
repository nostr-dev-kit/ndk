<script lang="ts">
  import type { Component } from 'svelte';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
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
   * Simple map defining which component renders each event kind.
   * To add a new kind:
   * 1. Import the handler component
   * 2. Add an entry: [kind]: HandlerComponent
   */
  const KIND_HANDLERS: Record<number, Component<any>> = {
    30023: ArticleEmbedded,    // Long-form articles
    1: NoteEmbedded,           // Short text notes
    1111: NoteEmbedded,        // Generic replies
    9802: HighlightEmbedded,   // Highlights
    // Add your kind handlers here
  };

  interface Props {
    ndk: NDKSvelte;
    bech32: string;
    variant?: 'inline' | 'card' | 'compact';
  }

  let { ndk, bech32, variant = 'card' }: Props = $props();

  const embedded = createEmbeddedEvent(() => ({ bech32 }), ndk);

  // Lookup handler, fallback to generic
  let Handler = $derived(
    embedded.event
      ? (KIND_HANDLERS[embedded.event.kind] ?? GenericEmbedded)
      : null
  );
</script>

{#if embedded.loading}
  <div class="loading">Loading...</div>
{:else if embedded.error}
  <div class="error">Failed to load event</div>
{:else if embedded.event && Handler}
  <Handler {ndk} event={embedded.event} {variant} />
{/if}
