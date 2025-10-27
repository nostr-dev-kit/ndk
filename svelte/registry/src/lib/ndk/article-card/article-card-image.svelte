<!--
  @component ArticleCard.Image
  Display article cover image with fallback

  @example
  ```svelte
  <ArticleCard.Image class="h-48" />
  <ArticleCard.Image showGradient={false} />
  ```
-->
<script lang="ts">
  import { getContext } from 'svelte';
  import { ARTICLE_CARD_CONTEXT_KEY, type ArticleCardContext } from './context.svelte.js';
  import { cn } from '$lib/utils';

  interface Props {
    /** Additional CSS classes */
    class?: string;

    /** Show gradient overlay (for better text readability) */
    showGradient?: boolean;

    /** Fallback icon size */
    iconSize?: string;
  }

  let {
    class: className = '',
    showGradient = false,
    iconSize = 'w-16 h-16'
  }: Props = $props();

  const context = getContext<ArticleCardContext>(ARTICLE_CARD_CONTEXT_KEY);
  const imageUrl = $derived(context.article.image);
</script>

<div class={cn('article-card-image relative overflow-hidden bg-muted', className)}>
  {#if imageUrl}
    <img
      src={imageUrl}
      alt={context.article.title || 'Article cover'}
      class="w-full h-full object-cover"
      loading="lazy"
    />
    {#if showGradient}
      <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
    {/if}
  {:else}
    <div class="w-full h-full flex items-center justify-center bg-primary/10">
      <svg class="{iconSize} text-primary/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    </div>
  {/if}
</div>
