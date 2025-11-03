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
  <div class="relative p-6 border border-amber-400 rounded-xl bg-gradient-to-br from-amber-50 to-white">
    <Highlight.Root {ndk} {highlight}>
      <div class="absolute top-0 left-0 w-1 h-full bg-amber-500 rounded-l-xl"></div>
      <Highlight.Content class="text-lg leading-relaxed italic text-amber-950 mb-3" />
      <Highlight.Source class="text-sm text-amber-900 opacity-80" />
    </Highlight.Root>
  </div>
{:else}
  <div class="text-gray-500 p-8 text-center">Loading highlight...</div>
{/if}
