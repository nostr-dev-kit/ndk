<!-- @ndk-version: article-card@0.13.0 -->
<!--
  @component ArticleCard.Date
  Display article published date

  @example
  ```svelte
  <ArticleCard.Date />
  <ArticleCard.Date format="relative" />
  <ArticleCard.Date format="short" />
  ```
-->
<script lang="ts">
  import { getContext } from 'svelte';
  import { ARTICLE_CARD_CONTEXT_KEY, type ArticleCardContext } from './context.svelte.js';
  import { cn } from '../../../utils.js';

  interface Props {
    /** Date format: 'relative' (3d ago), 'short' (Jan 1), 'full' */
    format?: 'relative' | 'short' | 'full';

    /** Additional CSS classes */
    class?: string;
  }

  let {
    format = 'relative',
    class: className = ''
  }: Props = $props();

  const context = getContext<ArticleCardContext>(ARTICLE_CARD_CONTEXT_KEY);
  if (!context) {
    throw new Error('ArticleCard.Date must be used within ArticleCard.Root');
  }
  const timestamp = $derived(context.article.published_at || context.article.created_at);

  const formattedDate = $derived.by(() => {
    if (!timestamp) return '';

    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (format === 'relative') {
      if (diffDays > 7) {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
      if (diffDays > 0) return `${diffDays}d ago`;
      if (diffHours > 0) return `${diffHours}h ago`;
      if (diffMins > 0) return `${diffMins}m ago`;
      return 'Just now';
    } else if (format === 'short') {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  });
</script>

<time class={cn('article-card-date', className)} datetime={timestamp ? new Date(timestamp * 1000).toISOString() : ''}>
  {formattedDate}
</time>
