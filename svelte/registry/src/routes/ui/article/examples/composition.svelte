<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKArticle, NDKKind } from '@nostr-dev-kit/ndk';
  import { Article } from '$lib/registry/ui';

  const ndk = getContext<NDKSvelte>('ndk');

  // Fetch a sample article
  const articleFetcher = $state(ndk.subscribe({
    kinds: [NDKKind.Article],
    limit: 1
  }));

  let article = $state<NDKArticle | null>(null);

  $effect(() => {
    if (articleFetcher.events.length > 0) {
      article = NDKArticle.from(articleFetcher.events[0]);
    }
  });
</script>

{#if article}
  <div class="border border-gray-200 rounded-xl overflow-hidden bg-white">
    <Article.Root {ndk} {article}>
      <!-- Hero layout with image -->
      <Article.Image class="w-full h-[200px] object-cover" />

      <div class="p-6">
        <Article.Title class="text-2xl font-bold mb-2 text-gray-900" />
        <Article.ReadingTime class="text-sm text-gray-500 mb-3" />
        <Article.Summary class="text-base leading-relaxed text-gray-600 mb-3" />
        <Article.ReadingTime class="text-sm text-gray-400" />
      </div>
    </Article.Root>
  </div>
{:else}
  <div class="text-gray-500 p-8 text-center">Loading article...</div>
{/if}
