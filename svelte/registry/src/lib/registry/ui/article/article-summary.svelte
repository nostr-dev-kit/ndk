<script lang="ts">
  import { getContext } from 'svelte';
  import { ARTICLE_CONTEXT_KEY, type ArticleContext } from './context.svelte.js';

  interface Props {
    /** Maximum character length */
    maxLength?: number;

    /** Additional CSS classes */
    class?: string;
  }

  let {
    maxLength = 150,
    class: className = ''
  }: Props = $props();

  const context = getContext<ArticleContext>(ARTICLE_CONTEXT_KEY);
  if (!context) {
    throw new Error('Article.Summary must be used within Article.Root');
  }

  const excerpt = $derived.by(() => {
    const text = context.article.summary || context.article.content || '';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  });
</script>

<p class={className}>
  {excerpt}
</p>
