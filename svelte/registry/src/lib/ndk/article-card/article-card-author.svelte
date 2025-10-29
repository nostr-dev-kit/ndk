<!-- @ndk-version: article-card@0.0.0 -->
<!--
  @component ArticleCard.Author
  Display article author name

  @example
  ```svelte
  <ArticleCard.Author />
  <ArticleCard.Author fallback="Unknown Author" />
  ```
-->
<script lang="ts">
  import { getContext } from 'svelte';
  import { ARTICLE_CARD_CONTEXT_KEY, type ArticleCardContext } from './context.svelte.js';
  import { cn } from '$lib/utils';

  interface Props {
    /** Fallback text when profile not loaded */
    fallback?: string;

    /** Additional CSS classes */
    class?: string;
  }

  let {
    fallback = 'Anonymous',
    class: className = ''
  }: Props = $props();

  const context = getContext<ArticleCardContext>(ARTICLE_CARD_CONTEXT_KEY);
  if (!context) {
    throw new Error('ArticleCard.Author must be used within ArticleCard.Root');
  }
  const profile = $derived(context.authorProfile?.profile);

  const authorName = $derived(
    profile?.displayName || profile?.name || fallback
  );
</script>

<span class={cn('article-card-author', className)}>
  {authorName}
</span>
