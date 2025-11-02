<!-- @ndk-version: article-card-medium@0.4.0 -->
<!--
  @component ArticleCard.Medium
  Medium-style article card preset (horizontal layout with image on right)

  Ideal for list views and feed displays.

  @example
  ```svelte
  <ArticleCard.Medium {ndk} {article} />
  <ArticleCard.Medium {ndk} {article} imageSize="large" />
  ```
-->
<script lang="ts">
  import type { NDKArticle } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import Root from '../../ui/article/article-root.svelte';
  import Image from '../../ui/article/article-image.svelte';
  import Title from '../../ui/article/article-title.svelte';
  import Summary from '../../ui/article/article-summary.svelte';
  import ReadingTime from '../../ui/article/article-reading-time.svelte';
  import { cn } from '../../utils/index.js';

  interface Props {
    /** NDK instance */
    ndk: NDKSvelte;

    /** Article to display */
    article: NDKArticle;

    /** Image size variant */
    imageSize?: 'small' | 'medium' | 'large';

    /** Click handler */
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

  function handleClick(e: MouseEvent) {
    if (onclick) {
      onclick(e);
    } else {
      // Default: navigate to article
      const naddr = article.encode();
      window.location.href = `/a/${naddr}`;
    }
  }
</script>

<Root {ndk} {article}>
  <button
    type="button"
    onclick={handleClick}
    class={cn(
      'bg-background',
      'group block w-full',
      'p-4 sm:p-6',
      'hover:bg-card/30 transition-colors',
      'border-b border-border last:border-b-0',
      'text-left',
      className
    )}
  >
    <div class="flex items-start gap-4 sm:gap-6">
      <!-- Content -->
      <div class="flex-1 min-w-0">
        <Title class="text-xl sm:text-2xl mb-2 font-serif line-clamp-2" />
        <Summary class="text-sm sm:text-base mb-4 leading-relaxed line-clamp-3" maxLength={150} />
        <ReadingTime class="text-xs sm:text-sm" />
      </div>

      <!-- Image -->
      <div class={cn('flex-shrink-0 rounded-lg overflow-hidden', imageSizeClass)}>
        <Image class="w-full h-full object-cover" />
      </div>
    </div>
  </button>
</Root>
