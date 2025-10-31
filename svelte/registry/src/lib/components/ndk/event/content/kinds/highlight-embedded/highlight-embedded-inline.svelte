<!-- @ndk-version: highlight-embedded-inline@0.1.0 -->
<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { HighlightCard } from '../../../../highlight-card';

  interface Props {
    ndk: NDKSvelte;
    event: NDKEvent;
  }

  let { ndk, event }: Props = $props();
</script>

<div class="highlight-embedded-inline">
  <HighlightCard.Root {ndk} {event} variant="feed">
    <div class="highlight-container">
      <HighlightCard.Content fontSize="text-sm" />
      <HighlightCard.Source position="bottom-right" size="sm" />
    </div>
  </HighlightCard.Root>
</div>

<style>
  .highlight-embedded-inline {
    border-radius: 0.5rem;
    overflow: hidden;
    border: 1px solid var(--color-border);
    background: var(--color-card);
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
