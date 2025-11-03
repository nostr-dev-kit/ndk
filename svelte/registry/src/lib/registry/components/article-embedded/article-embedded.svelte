<!-- @ndk-version: article-embedded@0.1.0 -->
<script lang="ts">
  import type { NDKArticle } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { Article } from '../../ui/article';

  interface Props {
    ndk: NDKSvelte;
    event: NDKArticle;
    variant?: 'inline' | 'card' | 'compact';
  }

  let { ndk, event, variant = 'card' }: Props = $props();

  // Convert to NDKArticle if needed
  const article = event as NDKArticle;
</script>

<div class="article-embedded" data-variant={variant}>
  <Article.Root {ndk} {article}>
    <div class="article-layout">
      <Article.Image
        class={variant === 'compact' ? 'h-24' : variant === 'inline' ? 'h-32' : 'h-40'}
      />

      <div class="article-content">
        <Article.Title
          class="text-sm font-semibold"
        />

        {#if variant !== 'compact'}
          <Article.Summary
            class="text-xs text-muted-foreground"
            maxLength={variant === 'inline' ? 80 : 120}
          />
        {/if}

        <div class="article-meta">
          <Article.ReadingTime class="text-xs" />
        </div>
      </div>
    </div>
  </Article.Root>
</div>

<style>
  .article-embedded {
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

  [data-variant='inline'] .article-layout {
    max-width: 400px;
  }

  [data-variant='compact'] .article-layout {
    flex-direction: row;
    gap: 0.75rem;
    padding: 0.5rem;
  }

  [data-variant='compact'] .article-content {
    flex: 1;
    padding: 0;
  }

  [data-variant='compact'] .article-meta {
    border-top: none;
    padding-top: 0;
  }
</style>
