<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKHighlight, NDKKind } from '@nostr-dev-kit/ndk';
  import { Highlight } from '$lib/registry/ui';

  const ndk = getContext<NDKSvelte>('ndk');

  const highlightFetcher = $state(ndk.subscribe({
    kinds: [NDKKind.Highlight],
    limit: 1
  }));

  let highlight = $state<NDKHighlight | null>(null);

  $effect(() => {
    if (highlightFetcher.events.length > 0) {
      highlight = NDKHighlight.from(highlightFetcher.events[0]);
    }
  });
</script>

{#if highlight}
  <div class="highlight-card">
    <Highlight.Root {ndk} {highlight}>
      <div class="highlight-marker"></div>
      <Highlight.Content class="highlight-content" />
      <Highlight.Source class="highlight-source" />
    </Highlight.Root>
  </div>
{:else}
  <div class="loading">Loading highlight...</div>
{/if}

<style>
  .highlight-card {
    position: relative;
    padding: 1.5rem;
    border: 1px solid #fbbf24;
    border-radius: 0.75rem;
    background: linear-gradient(135deg, #fef3c7 0%, #ffffff 100%);
  }

  .highlight-marker {
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: #f59e0b;
    border-radius: 0.75rem 0 0 0.75rem;
  }

  .highlight-card :global(.highlight-content) {
    font-size: 1.125rem;
    line-height: 1.7;
    font-style: italic;
    color: #78350f;
    margin-bottom: 0.75rem;
  }

  .highlight-card :global(.highlight-source) {
    font-size: 0.875rem;
    color: #92400e;
    opacity: 0.8;
  }

  .loading {
    color: #6b7280;
    padding: 2rem;
    text-align: center;
  }
</style>
