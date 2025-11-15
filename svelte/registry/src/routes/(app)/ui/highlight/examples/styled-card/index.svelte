<!--
  IMPORTANT: Keep this file in sync with index.txt

  Rules for maintaining sync between index.svelte and index.txt:
  1. Both files must demonstrate the SAME functionality
  2. index.svelte = Full implementation (with TypeScript interfaces, all imports, complete styling)
  3. index.txt = Simplified documentation version with these changes:
     - Remove TypeScript interface definitions
     - Use inline prop destructuring: let { ndk, userPubkey } = $props();
     - Keep only essential imports (remove type imports unless needed)
     - Keep inline classes (class="...") but remove <style> blocks
     - Focus on showing component API usage, not implementation details
     - Keep the core component usage identical between both files

  When you modify this file, you MUST update index.txt to reflect the same changes
  following the simplification rules above.
-->
<script lang="ts">
    import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { ndk } from '$lib/site/ndk.svelte';
  import { NDKHighlight, NDKKind } from '@nostr-dev-kit/ndk';
  import { Highlight } from '$lib/registry/ui/highlight';
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
  <div class="relative p-6 border border-amber-400 rounded-xl bg-gradient-to-br from-amber-50 to-white">
    <Highlight.Root {ndk} event={highlight}>
      <div class="absolute top-0 left-0 w-1 h-full bg-amber-500 rounded-l-xl"></div>
      <Highlight.Content class="text-lg leading-relaxed italic text-amber-950 mb-3" />
      <Highlight.Source class="text-sm text-amber-900 opacity-80" />
    </Highlight.Root>
  </div>
{:else}
  <div class="text-gray-500 p-8 text-center">Loading highlight...</div>
{/if}
