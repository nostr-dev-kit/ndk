<!-- @ndk-version: highlight-embedded-card@0.1.0 -->
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

<div class="highlight-embedded-card">
  <HighlightCard.Root {ndk} {event} variant="feed">
    <div class="highlight-container">
      <HighlightCard.Content fontSize="text-base" />
      <HighlightCard.Source position="bottom-right" size="md" />
    </div>
  </HighlightCard.Root>
</div>

<style>
  .highlight-embedded-card {
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
</style>
