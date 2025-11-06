<!-- @ndk-version: article-embedded-card@0.1.0 -->
<script lang="ts">
  import type { NDKArticle } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { Article } from '../../ui/article';

  interface Props {
    ndk: NDKSvelte;
    event: NDKArticle;
  }

  let { ndk, event }: Props = $props();

  const article = event;
</script>

<div data-article-embedded-card="" class="article-embedded-card">
  <Article.Root {ndk} {article}>
    <div class="article-layout">
      <Article.Image class="h-40" />
      
      <div class="article-content">
        <Article.Title class="text-sm font-semibold" />
        <Article.Summary class="text-xs text-muted-foreground" maxLength={120} />

        <div class="article-meta">
          <Article.ReadingTime class="text-xs" />
        </div>
      </div>
    </div>
  </Article.Root>
</div>

<style>
  .article-embedded-card {
    border-radius: 0.5rem;
    overflow: hidden;
    border: 1px solid var(--border);
    background: var(--card);
  }

  .article-layout {
    display: flex;
    flex-direction: column;
  }

  .article-content {
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .article-meta {
    margin-top: auto;
    padding-top: 0.5rem;
    border-top: 1px solid var(--border);
  }
</style>
