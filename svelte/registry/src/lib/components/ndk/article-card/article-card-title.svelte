<!-- @ndk-version: article-card@0.13.0 -->
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
  import { cn } from '../../../utils.js';

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
  if (!context) {
    throw new Error('ArticleCard.Title must be used within ArticleCard.Root');
  }
  const title = $derived(context.article.title || 'Untitled');

  const lineClampClass = $derived(`line-clamp-${lines}`);
</script>

<h3 class={cn(lineClampClass, className)}>
  {title}
</h3>
