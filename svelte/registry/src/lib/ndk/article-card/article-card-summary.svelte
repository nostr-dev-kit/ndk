<!--
  @component ArticleCard.Summary
  Display article summary/excerpt

  @example
  ```svelte
  <ArticleCard.Summary />
  <ArticleCard.Summary maxLength={200} lines={3} />
  ```
-->
<script lang="ts">
  import { getContext } from 'svelte';
  import { ARTICLE_CARD_CONTEXT_KEY, type ArticleCardContext } from './context.svelte.js';
  import { cn } from '$lib/utils';

  interface Props {
    /** Maximum character length */
    maxLength?: number;

    /** Number of lines to clamp */
    lines?: number;

    /** Additional CSS classes */
    class?: string;
  }

  let {
    maxLength = 150,
    lines = 3,
    class: className = ''
  }: Props = $props();

  const context = getContext<ArticleCardContext>(ARTICLE_CARD_CONTEXT_KEY);

  const excerpt = $derived.by(() => {
    const text = context.article.summary || context.article.content || '';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  });

  const lineClampClass = $derived(`line-clamp-${lines}`);
</script>

<p class={cn('article-card-summary text-muted-foreground', lineClampClass, className)}>
  {excerpt}
</p>
