<!-- @ndk-version: highlight-embedded-compact@0.1.0 -->
<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { HighlightCard } from '$lib/ndk/highlight-card';

  interface Props {
    ndk: NDKSvelte;
    event: NDKEvent;
  }

  let { ndk, event }: Props = $props();
</script>

<div class="highlight-embedded-compact">
  <HighlightCard.Root {ndk} {event} variant="feed">
    <div class="highlight-container">
      <HighlightCard.Content fontSize="text-xs" />
      <HighlightCard.Source position="bottom-right" size="sm" />
    </div>
  </HighlightCard.Root>
</div>

<style>
  .highlight-embedded-compact {
    border-radius: 0.5rem;
    overflow: hidden;
    border: 1px solid var(--color-border);
    background: var(--color-card);
  }

  .highlight-container {
    position: relative;
    padding: 0.75rem;
    min-height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
