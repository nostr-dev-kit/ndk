<!-- @ndk-version: embedded-event@0.5.0 -->
<script lang="ts">
  import type { Component } from 'svelte';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createEmbeddedEvent } from '@nostr-dev-kit/svelte';
  import GenericEmbedded from './generic-embedded.svelte';

  // Import kind handlers here
  // When you install a new kind handler via shadcn-svelte, add its import below
  import ArticleEmbedded from '../kinds/article-embedded.svelte';
  import NoteEmbedded from '../kinds/note-embedded.svelte';
  import HighlightEmbedded from '../kinds/highlight-embedded.svelte';

  /**
   * Kind Handlers Registry
   *
   * This map defines which component renders each Nostr event kind.
   * To add support for a new kind:
   * 1. Import the handler component above
   * 2. Add an entry to this map: [kind]: HandlerComponent
   *
   * Example:
   *   import VideoEmbedded from '../kinds/video-embedded.svelte';
   *   const KIND_HANDLERS: Record<number, Component<any>> = {
   *     ...existing entries...
   *     34235: VideoEmbedded,  // Video events
   *   };
   */
  const KIND_HANDLERS: Record<number, Component<any>> = {
    30023: ArticleEmbedded,    // Long-form articles
    1: NoteEmbedded,           // Short text notes
    1111: NoteEmbedded,        // Generic replies
    9802: HighlightEmbedded,   // Highlights
    // Add your kind handlers here when installing new components
  };

  interface EmbeddedEventProps {
    ndk: NDKSvelte;
    bech32: string;
    variant?: 'inline' | 'card' | 'compact';
    class?: string;
  }

  let {
    ndk,
    bech32,
    variant = 'card',
    class: className = ''
  }: EmbeddedEventProps = $props();

  const embedded = createEmbeddedEvent(() => ({ bech32 }), ndk);

  // Lookup the appropriate handler for the event's kind, fallback to generic
  let Handler = $derived(
    embedded.event
      ? (KIND_HANDLERS[embedded.event.kind] ?? GenericEmbedded)
      : null
  );
</script>

{#if embedded.loading}
  <div class="embedded-loading {className}">
    <div class="loading-spinner"></div>
    <span>Loading event...</span>
  </div>
{:else if embedded.error}
  <div class="embedded-error {className}">
    <span>Failed to load event</span>
  </div>
{:else if embedded.event && Handler}
  <Handler {ndk} event={embedded.event} {variant} />
{/if}

<style>
  .embedded-loading,
  .embedded-error {
    padding: 1rem;
    border-radius: 0.5rem;
    border: 1px solid var(--border);
    background: var(--muted);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
  }

  .loading-spinner {
    width: 1rem;
    height: 1rem;
    border: 2px solid var(--primary);
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .embedded-error {
    color: var(--destructive);
  }
</style>
