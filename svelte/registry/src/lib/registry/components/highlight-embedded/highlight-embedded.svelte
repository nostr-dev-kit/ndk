<!-- @ndk-version: highlight-embedded@0.1.0 -->
<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { Highlight } from '../../ui/highlight/index.js';

  interface Props {
    ndk: NDKSvelte;
    event: NDKEvent;
    variant?: 'inline' | 'card' | 'compact';
  }

  let { ndk, event, variant = 'card' }: Props = $props();
</script>

<div class="highlight-embedded" data-variant={variant}>
  <Highlight.Root {ndk} {event} variant="feed">
    <div class="highlight-container">
      <Highlight.Content
        class={variant === 'compact' ? 'text-sm' : 'text-base'}
      />

      <Highlight.Source
        class="flex items-center gap-1.5 {variant === 'compact' ? 'px-2 py-1 text-[10px]' : 'px-3 py-1.5 text-xs'} bg-background/80 backdrop-blur-sm border border-border rounded text-muted-foreground hover:bg-background transition-colors absolute bottom-2 right-2"
      >
        {#snippet children({ source })}
          {#if source.type === 'web'}
            <svg class={variant === 'compact' ? 'w-2.5 h-2.5' : 'w-3 h-3'} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          {:else}
            <svg class={variant === 'compact' ? 'w-2.5 h-2.5' : 'w-3 h-3'} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          {/if}
          <span class="truncate {variant === 'compact' ? 'max-w-[100px]' : 'max-w-[200px]'}">{source.displayText}</span>
        {/snippet}
      </Highlight.Source>
    </div>
  </Highlight.Root>
</div>

<style>
  .highlight-embedded {
    border-radius: 0.5rem;
    overflow: hidden;
    border: 1px solid var(--color-border);
    background: var(--color-card);
  }

  .highlight-container {
    position: relative;
    padding: 1rem;
    min-height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  [data-variant='compact'] .highlight-container {
    padding: 0.75rem;
    min-height: 60px;
  }

  [data-variant='compact'] :global(.highlight-content) {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  [data-variant='inline'] .highlight-container {
    max-width: 500px;
  }

  [data-variant='inline'] :global(.highlight-content) {
    display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  [data-variant='card'] :global(.highlight-content) {
    display: -webkit-box;
    -webkit-line-clamp: 6;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
