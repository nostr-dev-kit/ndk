<script lang="ts">
  import { getContext } from 'svelte';
  import { ARTICLE_CONTEXT_KEY, type ArticleContext } from './article.context.js';
  import { cn } from "../../utils/cn.js";

  interface Props {
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
    class={cn(className, "object-cover")}
    loading="lazy"
  />
{/if}
