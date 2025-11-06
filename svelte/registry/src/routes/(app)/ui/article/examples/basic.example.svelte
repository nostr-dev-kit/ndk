<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKArticle, NDKKind } from '@nostr-dev-kit/ndk';
  import { Article } from '$lib/registry/ui/article';

  const ndk = getContext<NDKSvelte>('ndk');

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
  <Article.Root {ndk} {article}>
    <Article.Title class="text-2xl font-bold mb-2" />
    <Article.Summary class="text-gray-600 mb-4" />
    <Article.ReadingTime class="text-sm text-gray-500" />
  </Article.Root>
{:else}
  <div class="text-gray-500">Loading article...</div>
{/if}

<style>
  /* Custom styling for your application */
</style>
