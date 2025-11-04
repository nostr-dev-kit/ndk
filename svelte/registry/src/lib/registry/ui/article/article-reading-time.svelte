<script lang="ts">
  import { getContext } from 'svelte';
  import { ARTICLE_CONTEXT_KEY, type ArticleContext } from './article.context.js';

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

  const context = getContext<ArticleContext>(ARTICLE_CONTEXT_KEY);
  if (!context) {
    throw new Error('Article.ReadingTime must be used within Article.Root');
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
  <span class={className}>
    {readingTime}
  </span>
{/if}
