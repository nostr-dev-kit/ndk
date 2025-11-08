<script lang="ts">
  import type { NDKArticle } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import Root from '$lib/registry/ui/article/article-root.svelte';
  import Image from '$lib/registry/ui/article/article-image.svelte';
  import Title from '$lib/registry/ui/article/article-title.svelte';
  import Summary from '$lib/registry/ui/article/article-summary.svelte';
  import ReadingTime from '$lib/registry/ui/article/article-reading-time.svelte';
  import { cn } from '$lib/registry/utils/cn';

  interface Props {
    ndk: NDKSvelte;

    article: NDKArticle;

    width?: string;

    height?: string;

    imageHeight?: string;

    onclick?: (e: MouseEvent) => void;

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

  const baseClasses = cn(
    'article-card-portrait',
    'group flex flex-col flex-shrink-0',
    'rounded-2xl overflow-hidden',
    'bg-card',
    'transition-all duration-300',
    'text-left',
    width,
    height,
    className
  );

  const interactiveClasses = onclick ? 'hover:bg-muted hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/10 cursor-pointer' : '';
</script>

<Root {ndk} {article}>
  <svelte:element
    data-article-card-portrait=""
    this={onclick ? 'button' : 'div'}
    type={onclick ? 'button' : undefined}
    {onclick}
    class={cn(baseClasses, interactiveClasses)}
  >
    <!-- Cover Image -->
    <div class={cn('relative overflow-hidden', imageHeight)}>
      <Image class="w-full h-full object-cover" />
      <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
    </div>

    <!-- Content -->
    <div class="p-4 flex flex-col flex-1 min-h-0 text-left">
      <!-- Title -->
      <Title class="text-base mb-2 leading-snug font-serif text-left line-clamp-2" />

      <!-- Summary -->
      <Summary class="text-xs mb-3 leading-relaxed flex-1 text-left line-clamp-3" maxLength={100} />

      <div class="mt-auto pt-2 border-t border-border">
        <div class="flex items-center justify-between">
          <ReadingTime class="text-xs" />
          <svg width="16" height="16" class="text-primary opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" ></path>
          </svg>
        </div>
      </div>
    </div>
  </svelte:element>
</Root>
