<script lang="ts">
  import { getContext } from 'svelte';
  import { ARTICLE_CONTEXT_KEY, type ArticleContext } from './article.context.js';

  interface Props {
    /** Additional CSS classes */
    class?: string;
  }

  let {
    class: className = ''
  }: Props = $props();

  const context = getContext<ArticleContext>(ARTICLE_CONTEXT_KEY);
  if (!context) {
    throw new Error('Article.Title must be used within Article.Root');
  }
  const title = $derived(context.article.title || 'Untitled');
</script>

<h3 class={className}>
  {title}
</h3>
