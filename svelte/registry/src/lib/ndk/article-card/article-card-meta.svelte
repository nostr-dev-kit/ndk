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
</script>

<div class={cn('article-card-meta flex items-center gap-2 text-sm text-muted-foreground', className)}>
  <Author class="font-medium" />
  <span>·</span>
  {#if showIcon}
    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  {/if}
  <Date />
</div>
