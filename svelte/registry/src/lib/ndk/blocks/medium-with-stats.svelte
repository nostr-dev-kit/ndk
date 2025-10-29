<!--
  @component ArticleCard.MediumWithStats
  Medium-style article card with engagement stats (horizontal layout with image and stats footer)

  Displays article in horizontal layout with reactions and reply counts.

  @example
  ```svelte
  <ArticleCard.MediumWithStats {ndk} {article} />
  <ArticleCard.MediumWithStats {ndk} {article} imageSize="large" />
  ```
-->
<script lang="ts">
  import type { NDKArticle } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import Root from '../article-card/article-card-root.svelte';
  import Image from '../article-card/article-card-image.svelte';
  import Title from '../article-card/article-card-title.svelte';
  import Summary from '../article-card/article-card-summary.svelte';
  import Meta from '../article-card/article-card-meta.svelte';
  import { ReactionAction, ReplyAction } from '$lib/ndk/actions';
  import { cn } from '$lib/utils';

  interface Props {
    /** NDK instance */
    ndk: NDKSvelte;

    /** Article to display */
    article: NDKArticle;

    /** Image size variant */
    imageSize?: 'small' | 'medium' | 'large';

    /** Click handler for card (not for stats) */
    onclick?: (e: MouseEvent) => void;

    /** Additional CSS classes */
    class?: string;
  }

  let {
    ndk,
    article,
    imageSize = 'medium',
    onclick,
    class: className = ''
  }: Props = $props();

  const imageSizeClass = $derived.by(() => {
    switch (imageSize) {
      case 'small':
        return 'w-32 h-24 sm:w-36 sm:h-28';
      case 'large':
        return 'w-48 h-36 sm:w-56 sm:h-40';
      default: // medium
        return 'w-40 h-32 sm:w-48 sm:h-36';
    }
  });

  function handleCardClick(e: MouseEvent) {
    if (onclick) {
      onclick(e);
    } else {
      // Default: navigate to article
      const naddr = article.encode();
      window.location.href = `/a/${naddr}`;
    }
  }

  // Stop propagation for stats section to prevent card navigation
  function stopPropagation(e: Event) {
    e.stopPropagation();
  }
</script>

<Root {ndk} {article}>
  <div
    class={cn(
      'article-card-medium-stats',
      'group block w-full',
      'hover:bg-card/30 transition-colors',
      'border-b border-border last:border-b-0',
      'text-left',
      className
    )}
  >
    <!-- Main content area (clickable) -->
    <button
      type="button"
      onclick={handleCardClick}
      class="w-full p-4 sm:p-6 text-left"
    >
      <div class="flex items-start gap-4 sm:gap-6">
        <!-- Content -->
        <div class="flex-1 min-w-0">
          <Title class="text-xl sm:text-2xl mb-2 font-serif" lines={2} />
          <Summary class="text-sm sm:text-base mb-4 leading-relaxed" maxLength={150} lines={3} />
          <Meta class="text-xs sm:text-sm" showIcon={true} />
        </div>

        <!-- Image -->
        <div class={cn('flex-shrink-0 rounded-lg overflow-hidden', imageSizeClass)}>
          <Image class="w-full h-full" iconSize="w-8 h-8 sm:w-10 sm:h-10" />
        </div>
      </div>
    </button>

    <!-- Stats footer (non-clickable for card navigation) -->
    <div
      class="stats-footer flex items-center gap-6 px-4 sm:px-6 pb-4 border-t border-border/50"
      onclick={stopPropagation}
    >
      <ReactionAction {ndk} event={article} showCount={true} />
      <ReplyAction {ndk} event={article} showCount={true} showComposer="dialog" />
    </div>
  </div>
</Root>

<style>
  .stats-footer {
    user-select: none;
  }

  /* Consistent styling for action buttons */
  .stats-footer :global(button) {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    transition: color 0.2s ease-in-out;
    font-size: 0.8125rem;
    font-weight: 400;
    color: #666;
    background: transparent;
    border: none;
    cursor: pointer;
  }

  .stats-footer :global(button:hover) {
    color: #8b5cf6;
  }

  .stats-footer :global(button:active) {
    transform: scale(0.98);
  }

  /* Icon sizing */
  .stats-footer :global(svg) {
    width: 1.25rem;
    height: 1.25rem;
    flex-shrink: 0;
  }

  /* Count text */
  .stats-footer :global(.reply-count),
  .stats-footer :global(.reaction-count) {
    font-variant-numeric: tabular-nums;
    min-width: 1rem;
    text-align: left;
    font-weight: 500;
  }
</style>
