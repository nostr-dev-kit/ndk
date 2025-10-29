<!-- @ndk-version: article-card@0.12.0 -->
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
  import CalendarIcon from '../icons/calendar.svelte';

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

<div class={cn('flex items-center gap-2', className)}>
  <Author />
  <span>·</span>
  {#if showIcon}
    <CalendarIcon class="w-4 h-4" />
  {/if}
  <Date />
</div>
