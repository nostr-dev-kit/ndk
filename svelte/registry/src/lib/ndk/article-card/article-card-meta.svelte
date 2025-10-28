<!--
  @component ArticleCard.Meta
  Display article metadata (author + date)

  @example
  ```svelte
  <ArticleCard.Meta />
  <ArticleCard.Meta showIcon={false} />
  ```
-->
<script lang="ts">
  import { getContext } from 'svelte';
  import { ARTICLE_CARD_CONTEXT_KEY, type ArticleCardContext } from './context.svelte.js';
  import { cn } from '$lib/utils';
  import Author from './article-card-author.svelte';
  import Date from './article-card-date.svelte';

  interface Props {
    /** Show calendar icon */
    showIcon?: boolean;

    /** Additional CSS classes */
    class?: string;
  }

  let {
    showIcon = false,
    class: className = ''
  }: Props = $props();

  const context = getContext<ArticleCardContext>(ARTICLE_CARD_CONTEXT_KEY);
  if (!context) {
    throw new Error('ArticleCard.Meta must be used within ArticleCard.Root');
  }
</script>

<div class={cn('article-card-meta flex items-center gap-2 text-sm text-muted-foreground', className)}>
  <Author class="font-medium" />
  <span>·</span>
  {#if showIcon}
    <i class="hugeicons-stroke-rounded text-base leading-none">&#984777;</i>
  {/if}
  <Date />
</div>
