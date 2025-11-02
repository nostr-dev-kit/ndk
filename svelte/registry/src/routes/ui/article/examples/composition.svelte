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
  <div class="article-card">
    <Article.Root {ndk} {article}>
      <!-- Hero layout with image -->
      <Article.Image class="article-image" />

      <div class="article-content">
        <Article.Title class="article-title" />
        <Article.Meta class="article-meta" />
        <Article.Summary class="article-summary" />
        <Article.ReadingTime class="article-reading-time" />
      </div>
    </Article.Root>
  </div>
{:else}
  <div class="loading">Loading article...</div>
{/if}

<style>
  .article-card {
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    overflow: hidden;
    background: white;
  }

  .article-card :global(.article-image) {
    width: 100%;
    height: 200px;
    object-fit: cover;
  }

  .article-content {
    padding: 1.5rem;
  }

  .article-card :global(.article-title) {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    color: #111827;
  }

  .article-card :global(.article-meta) {
    font-size: 0.875rem;
    color: #6b7280;
    margin-bottom: 0.75rem;
  }

  .article-card :global(.article-summary) {
    font-size: 1rem;
    line-height: 1.6;
    color: #4b5563;
    margin-bottom: 0.75rem;
  }

  .article-card :global(.article-reading-time) {
    font-size: 0.875rem;
    color: #9ca3af;
  }

  .loading {
    color: #6b7280;
    padding: 2rem;
    text-align: center;
  }
</style>
