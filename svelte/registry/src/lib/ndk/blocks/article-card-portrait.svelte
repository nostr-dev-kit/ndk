<!-- @ndk-version: article-card-portrait@0.0.0 -->
<!--
  @component ArticleCard.Portrait
  Portrait-style article card preset (vertical layout with image on top)

  Ideal for grid layouts and featured content displays.

  @example
  ```svelte
  <ArticleCard.Portrait {ndk} {article} />
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
  import { cn } from '$lib/utils';

  interface Props {
    /** NDK instance */
    ndk: NDKSvelte;

    /** Article to display */
    article: NDKArticle;

    /** Card width (default: 280px) */
    width?: string;

    /** Card height (default: 360px) */
    height?: string;

    /** Image height (default: 192px/12rem) */
    imageHeight?: string;

    /** Click handler */
    onclick?: (e: MouseEvent) => void;

    /** Additional CSS classes */
    class?: string;
  }

  let {
    ndk,
    article,
    width = 'w-[320px]',
    height = 'h-[420px]',
    imageHeight = 'h-56',
    onclick,
    class: className = ''
  }: Props = $props();

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
      'article-card-portrait',
      'group flex flex-col flex-shrink-0',
      'rounded-2xl overflow-hidden',
      'bg-card hover:bg-muted',
      'transition-all duration-300',
      'hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/10',
      'text-left',
      width,
      height,
      className
    )}
  >
    <!-- Cover Image -->
    <Image class={imageHeight} showGradient={true} />

    <!-- Content -->
    <div class="p-4 flex flex-col flex-1 min-h-0 text-left">
      <!-- Title -->
      <Title class="text-base mb-2 leading-snug font-serif text-left" lines={2} />

      <!-- Summary -->
      <Summary class="text-xs mb-3 leading-relaxed flex-1 text-left" maxLength={100} lines={3} />

      <!-- Meta -->
      <div class="mt-auto pt-2 border-t border-border">
        <div class="flex items-center justify-between">
          <Meta class="text-xs" />
          <svg width="16" height="16" class="text-primary opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  </button>
</Root>
