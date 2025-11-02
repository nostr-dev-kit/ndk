<!-- @ndk-version: article@0.14.0 -->
<!--
  @component Article.Image
  Display article cover image

  @example
  ```svelte
  <Article.Image class="h-48" />
  ```
-->
<script lang="ts">
  import { getContext } from 'svelte';
  import { ARTICLE_CONTEXT_KEY, type ArticleContext } from './context.svelte.js';

  interface Props {
    /** Additional CSS classes */
    class?: string;
  }

  let {
    class: className = ''
  }: Props = $props();

  const context = getContext<ArticleContext>(ARTICLE_CONTEXT_KEY);
  if (!context) {
    throw new Error('Article.Image must be used within Article.Root');
  }
  const imageUrl = $derived(context.article.image);
</script>

{#if imageUrl}
  <img
    src={imageUrl}
    alt={context.article.title || 'Article cover'}
    class={className}
    loading="lazy"
  />
{/if}
