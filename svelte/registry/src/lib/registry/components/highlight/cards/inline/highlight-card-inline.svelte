<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { Highlight } from '../../../ui/highlight/index.js';

  interface Props {
    ndk: NDKSvelte;
    event: NDKEvent;
  }

  let { ndk, event }: Props = $props();
</script>

<div data-highlight-card-inline="" class="highlight-card-inline">
  <Highlight.Root {ndk} {event} variant="feed">
    <div class="highlight-container">
      <Highlight.Content class="text-sm" />
      <Highlight.Source class="flex items-center gap-1.5 px-2 py-1 text-[10px] bg-background/80 backdrop-blur-sm border border-border rounded text-muted-foreground hover:bg-background transition-colors absolute bottom-2 right-2">
        {#snippet children({ source })}
          {#if source}
            {#if source.type === 'web'}
              <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" ></path>
              </svg>
            {:else}
              <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" ></path>
              </svg>
            {/if}
            <span class="truncate max-w-[100px]">{source.displayText}</span>
          {/if}
        {/snippet}
      </Highlight.Source>
    </div>
  </Highlight.Root>
</div>

<style>
  .highlight-card-inline {
    border-radius: 0.5rem;
    overflow: hidden;
    border: 1px solid var(--border);
    background: var(--card);
    max-width: 500px;
  }

  .highlight-container {
    position: relative;
    padding: 0.875rem;
    min-height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
