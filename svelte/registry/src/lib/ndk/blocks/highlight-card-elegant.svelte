<!-- @ndk-version: highlight-card-elegant@0.1.0 -->
<!--
  @component HighlightCard.Elegant
  Square-sized elegant card with gradient background and styled highlight/context text.

  @example
  ```svelte
  <HighlightCard.Elegant {ndk} {event} />
  ```
-->
<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { cn } from '$lib/utils';
  import Root from '../highlight-card/highlight-card-root.svelte';
  import Source from '../highlight-card/highlight-card-source.svelte';
  import { getContext } from 'svelte';
  import {
    HIGHLIGHT_CARD_CONTEXT_KEY,
    type HighlightCardContext,
  } from '../highlight-card/context.svelte.js';

  interface Props {
    /** NDK instance */
    ndk: NDKSvelte;

    /** Highlight event (kind 9802) */
    event: NDKEvent;

    /** Additional CSS classes */
    class?: string;
  }

  let { ndk, event, class: className = '' }: Props = $props();
</script>

<Root {ndk} {event} variant="grid" class={cn(className)}>
  <article class="w-full">
    <!-- Square elegant card with gradient -->
    <div
      class="relative aspect-square rounded-lg overflow-hidden border border-border shadow-lg w-full bg-gradient-to-br from-card to-card/70"
    >
      <!-- Content with custom styling -->
      <div class="relative flex flex-col items-center justify-center p-6 h-full">
        {@render ElegantContent()}
      </div>

      <!-- Source badge -->
      <Source position="bottom-right" size="sm" />
    </div>
  </article>
</Root>

<!-- Internal component for styled content -->
{#snippet ElegantContent()}
  {@const context = getContext<HighlightCardContext>(HIGHLIGHT_CARD_CONTEXT_KEY)}

  {#if context}
    {@const { before, highlight, after } = context.state.position}
    {@const totalLength = context.state.context.length}

    <!-- Calculate dynamic font size based on content length -->
    {@const fontSize = totalLength < 100 ? 'text-base' : totalLength < 200 ? 'text-sm' : 'text-xs'}

    <p class={cn('text-center leading-relaxed font-serif', fontSize)}>
      <!-- Context before highlight (muted) -->
      <span class="text-muted-foreground">
        {before}
      </span>

      <!-- Highlighted text (bright primary foreground) -->
      <span class="text-primary-foreground brightness-150 font-medium">
        {highlight}
      </span>

      <!-- Context after highlight (muted) -->
      <span class="text-muted-foreground">
        {after}
      </span>
    </p>
  {/if}
{/snippet}
