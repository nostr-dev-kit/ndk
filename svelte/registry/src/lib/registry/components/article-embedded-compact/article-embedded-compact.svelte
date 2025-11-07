<script lang="ts">
  import type { NDKArticle } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { Article } from '../../ui/article';

  interface Props {
    ndk: NDKSvelte;
    event: NDKArticle;
  }

  let { ndk, event }: Props = $props();

  const article = event as NDKArticle;
</script>

<div data-article-embedded-compact="" class="article-embedded-compact">
  <Article.Root {ndk} {article}>
    <div class="article-layout">
      <Article.Image class="h-24" />

      <div class="article-content">
        <Article.Title class="text-sm font-semibold" />
        <Article.Summary class="text-xs text-muted-foreground" />
        <div class="article-meta">
          <Article.ReadingTime class="text-xs" />
        </div>
      </div>
    </div>
  </Article.Root>
</div>

<style>
  .article-embedded-compact {
    border-radius: 0.5rem;
    overflow: hidden;
    border: 1px solid var(--border);
    background: var(--card);
  }

  .article-layout {
    display: flex;
    flex-direction: row;
    gap: 0.75rem;
    padding: 0.5rem;
  }

  .article-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 0;
  }

  .article-meta {
    margin-top: auto;
  }
</style>
