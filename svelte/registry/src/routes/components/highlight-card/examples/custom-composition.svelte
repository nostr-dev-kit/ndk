<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import { HighlightCard } from '$lib/ndk/highlight-card/index.js';

  interface Props {
    ndk: NDKSvelte;
    event: NDKEvent;
  }

  let { ndk, event }: Props = $props();
</script>

<HighlightCard.Root {ndk} {event} variant="feed">
  <div class="p-4 border border-border rounded-lg">
    <div class="bg-card p-6 rounded-lg relative">
      <HighlightCard.Content fontSize="text-lg" />
      <HighlightCard.Source position="bottom-right" />
    </div>
  </div>
</HighlightCard.Root>
