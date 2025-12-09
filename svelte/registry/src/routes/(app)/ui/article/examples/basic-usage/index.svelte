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
  import { NDKArticle, NDKKind } from '@nostr-dev-kit/ndk';
  import { Article } from '$lib/registry/ui/article';
  // Fetch a sample article
  const articleFetcher = ndk.$subscribe(() => ({
    filters: [{ kinds: [NDKKind.Article], limit: 1 }]
  }));

  let article = $state<NDKArticle | null>(null);

  $effect(() => {
    if (articleFetcher.events.length > 0) {
      article = NDKArticle.from(articleFetcher.events[0]);
    }
  });
</script>

{#if article}
  <Article.Root {ndk} {article} class="flex flex-col items-start">
    <Article.Title class="text-2xl font-bold mb-2" />
    <Article.Summary class="text-muted-foreground mb-4" />
    <Article.ReadingTime class="text-sm text-muted-foreground" />
  </Article.Root>
{:else}
  <div class="text-gray-500">Loading article...</div>
{/if}

<style>
  /* Custom styling for your application */
</style>
