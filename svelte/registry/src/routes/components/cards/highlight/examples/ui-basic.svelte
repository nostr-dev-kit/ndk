<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import { HighlightCard } from '$lib/registry/components/highlight-card/index.js';

  interface Props {
    ndk: NDKSvelte;
    event: NDKEvent;
  }

  let { ndk, event }: Props = $props();
</script>

<HighlightCard.Root {ndk} {event}>
  <div class="border border-border rounded-lg p-4 bg-card">
    <HighlightCard.Content />
    <HighlightCard.Source class="mt-4" />
  </div>
</HighlightCard.Root>
