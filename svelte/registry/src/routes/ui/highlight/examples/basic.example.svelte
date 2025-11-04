<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKHighlight, NDKKind } from '@nostr-dev-kit/ndk';
  import { Highlight } from '$lib/registry/ui';

  const ndk = getContext<NDKSvelte>('ndk');

  const highlightFetcher = ndk.$subscribe(() => ({
    filters: [{ kinds: [NDKKind.Highlight], limit: 1 }]
  }));

  let highlight = $state<NDKHighlight | null>(null);

  $effect(() => {
    if (highlightFetcher.events.length > 0) {
      highlight = NDKHighlight.from(highlightFetcher.events[0]);
    }
  });
</script>

{#if highlight}
  <Highlight.Root {ndk} event={highlight}>
    <Highlight.Content class="text-lg italic border-l-4 border-primary pl-4" />
    <Highlight.Source class="text-sm text-gray-500 mt-2" />
  </Highlight.Root>
{:else}
  <div class="text-gray-500">Loading highlight...</div>
{/if}
