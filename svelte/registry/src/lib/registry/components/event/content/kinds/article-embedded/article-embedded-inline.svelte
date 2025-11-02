<!-- @ndk-version: article-embedded-inline@0.1.0 -->
<script lang="ts">
  import type { NDKArticle } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { Article } from '../../../../ui/article';

  interface Props {
    ndk: NDKSvelte;
    event: NDKArticle;
  }

  let { ndk, event }: Props = $props();

  const article = event as NDKArticle;
</script>

<div class="article-embedded-inline">
  <Article.Root {ndk} {article}>
    <div class="article-layout">
      <Article.Image class="h-32" showGradient={true} />

      <div class="article-content">
        <Article.Title class="text-sm font-semibold" lines={2} />
        <Article.Summary class="text-xs text-muted-foreground" maxLength={80} lines={2} />

        <div class="article-meta">
          <Article.Meta class="text-xs" />
        </div>
      </div>
    </div>
  </Article.Root>
</div>

<style>
  .article-embedded-inline {
    border-radius: 0.5rem;
    overflow: hidden;
    border: 1px solid var(--color-border);
    background: var(--color-card);
    max-width: 400px;
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
    border-top: 1px solid var(--color-border);
  }
</style>
