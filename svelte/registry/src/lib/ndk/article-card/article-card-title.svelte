<!--
  @component ArticleCard.Title
  Display article title with optional line clamping

  @example
  ```svelte
  <ArticleCard.Title />
  <ArticleCard.Title lines={3} />
  ```
-->
<script lang="ts">
  import { getContext } from 'svelte';
  import { ARTICLE_CARD_CONTEXT_KEY, type ArticleCardContext } from './context.svelte.js';
  import { cn } from '$lib/utils';

  interface Props {
    /** Number of lines to clamp (2, 3, etc.) */
    lines?: number;

    /** Additional CSS classes */
    class?: string;
  }

  let {
    lines = 2,
    class: className = ''
  }: Props = $props();

  const context = getContext<ArticleCardContext>(ARTICLE_CARD_CONTEXT_KEY);
  const title = $derived(context.article.title || 'Untitled');

  const lineClampClass = $derived(`line-clamp-${lines}`);
</script>

<h3 class={cn('article-card-title font-bold text-foreground', lineClampClass, className)}>
  {title}
</h3>
