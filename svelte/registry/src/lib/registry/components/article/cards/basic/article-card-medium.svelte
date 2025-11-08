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

    imageSize?: 'small' | 'medium' | 'large';

    onclick?: (e: MouseEvent) => void;

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

  const baseClasses = cn(
    'bg-background',
    'group block w-full',
    'p-4 sm:p-6',
    'transition-colors',
    'border-b border-border last:border-b-0',
    'text-left',
    className
  );

  const interactiveClasses = onclick ? 'hover:bg-card/30 cursor-pointer' : '';
</script>

<Root {ndk} {article}>
  <svelte:element
    data-article-card-medium=""
    data-image-size={imageSize}
    this={onclick ? 'button' : 'div'}
    type={onclick ? 'button' : undefined}
    {onclick}
    class={cn(baseClasses, interactiveClasses)}
  >
    <div class="flex items-start gap-4 sm:gap-6">
      <!-- Content -->
      <div class="flex-1 min-w-0">
        <Title class="text-xl sm:text-2xl mb-2 font-serif line-clamp-2" />
        <Summary class="text-sm text-foreground/80 mb-4 leading-relaxed line-clamp-3" maxLength={150} />
        <ReadingTime class="text-xs sm:text-sm" />
      </div>

      <!-- Image -->
      <div class={cn('flex-shrink-0 rounded-lg overflow-hidden', imageSizeClass)}>
        <Image class="w-full h-full object-cover" />
      </div>
    </div>
  </svelte:element>
</Root>
