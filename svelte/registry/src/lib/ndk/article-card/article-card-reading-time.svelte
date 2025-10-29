<!--
  @component ArticleCard.ReadingTime
  Display estimated reading time for the article

  @example
  ```svelte
  <ArticleCard.ReadingTime />
  <ArticleCard.ReadingTime showSuffix={false} />
  <ArticleCard.ReadingTime wordsPerMinute={250} />
  ```
-->
<script lang="ts">
  import { getContext } from 'svelte';
  import { ARTICLE_CARD_CONTEXT_KEY, type ArticleCardContext } from './context.svelte.js';
  import { cn } from '$lib/utils';

  interface Props {
    /** Words per minute reading speed (default: 200) */
    wordsPerMinute?: number;

    /** Show "min read" suffix (default: true) */
    showSuffix?: boolean;

    /** Additional CSS classes */
    class?: string;
  }

  let {
    wordsPerMinute = 200,
    showSuffix = true,
    class: className = ''
  }: Props = $props();

  const context = getContext<ArticleCardContext>(ARTICLE_CARD_CONTEXT_KEY);
  if (!context) {
    throw new Error('ArticleCard.ReadingTime must be used within ArticleCard.Root');
  }

  const readingTime = $derived.by(() => {
    const content = context.article.content || '';
    const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);

    if (minutes === 0) return '';

    return showSuffix ? `${minutes} min read` : `${minutes}`;
  });
</script>

{#if readingTime}
  <span class={cn('article-card-reading-time', className)}>
    {readingTime}
  </span>
{/if}
