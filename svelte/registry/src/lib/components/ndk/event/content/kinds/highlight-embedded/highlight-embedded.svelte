<!-- @ndk-version: highlight-embedded@0.1.0 -->
<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { HighlightCard } from '../../../../highlight-card';

  interface Props {
    ndk: NDKSvelte;
    event: NDKEvent;
    variant?: 'inline' | 'card' | 'compact';
  }

  let { ndk, event, variant = 'card' }: Props = $props();
</script>

<div class="highlight-embedded" data-variant={variant}>
  <HighlightCard.Root {ndk} {event} variant="feed">
    <div class="highlight-container">
      <HighlightCard.Content
        fontSize={variant === 'compact' ? 'text-sm' : 'text-base'}
      />

      <HighlightCard.Source
        position="bottom-right"
        size={variant === 'compact' ? 'sm' : 'md'}
      />
    </div>
  </HighlightCard.Root>
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
