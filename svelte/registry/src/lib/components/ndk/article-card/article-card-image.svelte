<!-- @ndk-version: article-card@0.13.0 -->
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
  import { cn } from '../../../utils.js';
  import FileIcon from '../icons/file.svelte';

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
  if (!context) {
    throw new Error('ArticleCard.Image must be used within ArticleCard.Root');
  }
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
      <FileIcon class="{iconSize} text-primary/30" />
    </div>
  {/if}
</div>
