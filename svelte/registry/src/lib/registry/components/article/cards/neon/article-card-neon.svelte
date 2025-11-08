<script lang="ts">
  import type { NDKArticle } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import Root from '../../../../ui/article/article-root.svelte';
  import Title from '../../../../ui/article/article-title.svelte';
  import Summary from '../../../../ui/article/article-summary.svelte';
  import ReadingTime from '../../../../ui/article/article-reading-time.svelte';
  import { User } from '../../../../ui/user/index.js';
  import { cn } from '../../../../utils/cn';
  import { getContext } from 'svelte';
  import { ARTICLE_CONTEXT_KEY, type ArticleContext } from '../../../../ui/article/article.context.js';

  interface Props {
    ndk: NDKSvelte;

    article: NDKArticle;

    width?: string;

    height?: string;

    onclick?: (e: MouseEvent) => void;

    class?: string;
  }

  let {
    ndk,
    article,
    width = 'w-[320px]',
    height = 'h-[480px]',
    onclick,
    class: className = ''
  }: Props = $props();

  const baseClasses = cn(
    'article-card-neon',
    'group relative flex flex-col flex-shrink-0 overflow-hidden rounded-2xl',
    'text-left',
    width,
    height,
    className
  );

  const interactiveClasses = onclick ? 'cursor-pointer' : '';
</script>

<Root {ndk} {article}>
  {@const context = getContext<ArticleContext>(ARTICLE_CONTEXT_KEY)}
  {@const imageUrl = context.article.image}

  <svelte:element
    data-article-card-neon=""
    this={onclick ? 'button' : 'div'}
    type={onclick ? 'button' : undefined}
    role={onclick ? 'button' : undefined}
    {onclick}
    class={cn(baseClasses, interactiveClasses)}
  >
    <!-- Glossy neon top border effect -->
    <div class={cn("neon-border z-1", width, height)}></div>

    <!-- Full Background Image -->
    <div class="absolute inset-0 z-1 m-[1px]">
      {#if imageUrl}
        <img
          src={imageUrl}
          alt={context.article.title || 'Article cover'}
          class="w-full h-full object-cover"
          loading="lazy"
        />
        <!-- Modern darkening gradient overlay -->
        <div class="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/90"></div>
      {:else}
        <!-- Fallback gradient background -->
        <div class="w-full h-full bg-gradient-to-br from-muted via-muted-foreground to-foreground"></div>
      {/if}
    </div>

    <!-- Content Overlay -->
    <div class="relative z-10 flex flex-col h-full p-6">
      <!-- Bottom content -->
      <div class="mt-auto space-y-4">
        <!-- Title & Summary -->
        <div>
          <Title class="text-xl font-bold text-white mb-2 leading-tight line-clamp-2" />
          <Summary class="text-sm text-white/80 leading-relaxed line-clamp-2" maxLength={100} />
        </div>

        <!-- Author & Reading Time -->
        <div class="pt-4 border-t border-white/10 flex items-center justify-between">
          <User.Root {ndk} user={context.article.author}>
            <div class="text-sm text-white/80 flex items-center gap-1">
              <span>by</span>
              <User.Name />
            </div>
          </User.Root>
          <ReadingTime class="text-sm text-white/70" />
        </div>
      </div>
    </div>
  </svelte:element>
</Root>

<style>
  .neon-border {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    background: radial-gradient(
      ellipse at top,
      color-mix(in srgb, white 40%, transparent) 0%,
      color-mix(in srgb, white 15%, transparent) 50%,
      transparent 100%
    );
    
  }
</style>
