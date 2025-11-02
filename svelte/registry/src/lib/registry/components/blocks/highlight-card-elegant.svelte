<!-- @ndk-version: highlight-card-elegant@0.2.0 -->
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
  import { cn } from '../../../utils.js';
  import { Highlight } from '../../ui/highlight/index.js';
  import { getContext } from 'svelte';
  import {
    HIGHLIGHT_CONTEXT_KEY,
    type HighlightContext,
  } from '../../ui/highlight/context.svelte.js';

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

<Highlight.Root {ndk} {event} variant="grid" class={cn(className)}>
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
      <Highlight.Source class="flex items-center gap-1.5 px-2 py-1 bg-background/80 backdrop-blur-sm border border-border rounded text-[10px] text-muted-foreground hover:bg-background transition-colors absolute bottom-2 right-2">
        {#snippet children({ source })}
          {#if source.type === 'web'}
            <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          {:else}
            <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          {/if}
          <span class="truncate max-w-[100px]">{source.displayText}</span>
        {/snippet}
      </Highlight.Source>
    </div>
  </article>
</Highlight.Root>

<!-- Internal component for styled content -->
{#snippet ElegantContent()}
  {@const context = getContext<HighlightContext>(HIGHLIGHT_CONTEXT_KEY)}

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
