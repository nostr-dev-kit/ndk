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
  <Highlight.Root {ndk} event={highlight}>
    <Highlight.Content class="text-lg italic border-l-4 border-primary pl-4" />
    <Highlight.Source class="text-sm text-gray-500 mt-2" />
  </Highlight.Root>
{:else}
  <div class="text-gray-500">Loading highlight...</div>
{/if}
