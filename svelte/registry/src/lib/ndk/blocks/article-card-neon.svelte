<!--
  @component ArticleCard.Neon
  Neon-style article card with full background image and glossy top border

  Features a full background image with darkening gradient and a neon glow effect
  at the top border using radial gradients and layered inset shadows.

  @example
  ```svelte
  <ArticleCard.Neon {ndk} {article} />
  ```
-->
<script lang="ts">
  import type { NDKArticle } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import Root from '../article-card/article-card-root.svelte';
  import Title from '../article-card/article-card-title.svelte';
  import Summary from '../article-card/article-card-summary.svelte';
  import ReadingTime from '../article-card/article-card-reading-time.svelte';
  import { UserProfile } from '../user-profile';
  import { cn } from '$lib/utils';
  import { getContext } from 'svelte';
  import { ARTICLE_CARD_CONTEXT_KEY, type ArticleCardContext } from '../article-card/context.svelte.js';

  interface Props {
    /** NDK instance */
    ndk: NDKSvelte;

    /** Article to display */
    article: NDKArticle;

    /** Card width (default: w-[320px]) */
    width?: string;

    /** Card height (default: h-[480px]) */
    height?: string;

    /** Click handler */
    onclick?: (e: MouseEvent) => void;

    /** Additional CSS classes */
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

  function handleClick(e: MouseEvent) {
    if (onclick) {
      onclick(e);
    } else {
      const naddr = article.encode();
      window.location.href = `/a/${naddr}`;
    }
  }
</script>

<Root {ndk} {article}>
  {@const context = getContext<ArticleCardContext>(ARTICLE_CARD_CONTEXT_KEY)}
  {@const imageUrl = context.article.image}

  <button
    type="button"
    onclick={handleClick}
    class={cn(
      'article-card-neon',
      'group relative flex flex-col flex-shrink-0 overflow-hidden rounded-2xl',
      'text-left',
      width,
      height,
      className
    )}
  >
    <!-- Glossy neon top border effect -->
    <div class="neon-border"></div>

    <!-- Full Background Image -->
    <div class="absolute inset-0 z-0">
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
        <div class="w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-black"></div>
      {/if}
    </div>

    <!-- Content Overlay -->
    <div class="relative z-10 flex flex-col h-full p-6">
      <!-- Top badges -->
      <div class="flex items-start justify-between mb-auto">
        <div class="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
          <i class="hugeicons-stroke-rounded text-xl text-white leading-none">&#985549;</i>
        </div>

        <div class="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <svg width="14" height="14" class="text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      <!-- Bottom content -->
      <div class="mt-auto space-y-4">
        <!-- Title & Summary -->
        <div>
          <Title class="text-xl font-bold text-white mb-2 leading-tight" lines={2} />
          <Summary class="text-sm text-white/80 leading-relaxed" maxLength={100} lines={2} />
        </div>

        <!-- Author & Reading Time -->
        <div class="pt-4 border-t border-white/10">
          <UserProfile.AvatarName
            {ndk}
            user={context.article.author}
            avatarSize={36}
            class="text-white [&_.text-muted-foreground]:text-white/70 [&_img]:ring-2 [&_img]:ring-white/20 [&_.bg-muted]:bg-white/10 [&_.bg-muted]:backdrop-blur-sm [&_.bg-muted]:ring-2 [&_.bg-muted]:ring-white/20"
          >
            {#snippet meta()}
              <ReadingTime class="text-xs text-white/70" />
            {/snippet}
          </UserProfile.AvatarName>
        </div>
      </div>
    </div>
  </button>
</Root>

<style>
  .neon-border {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: radial-gradient(
      ellipse at top,
      rgba(255, 255, 255, 0.4) 0%,
      rgba(255, 255, 255, 0.15) 50%,
      transparent 100%
    );
    box-shadow:
      /* Bright narrow shadow right at top */
      inset 0 1px 1px 0 rgba(255, 255, 255, 0.6),
      inset 0 2px 3px 0 rgba(255, 255, 255, 0.3),
      /* Softer wide shadows below for depth */
      inset 0 4px 6px 0 rgba(255, 255, 255, 0.15),
      inset 0 6px 10px 0 rgba(255, 255, 255, 0.1);
  }

  .article-card-neon:hover .neon-border {
    background: radial-gradient(
      ellipse at top,
      rgba(255, 255, 255, 0.5) 0%,
      rgba(255, 255, 255, 0.2) 50%,
      transparent 100%
    );
    box-shadow:
      inset 0 1px 1px 0 rgba(255, 255, 255, 0.8),
      inset 0 2px 3px 0 rgba(255, 255, 255, 0.4),
      inset 0 4px 6px 0 rgba(255, 255, 255, 0.2),
      inset 0 6px 10px 0 rgba(255, 255, 255, 0.15);
  }
</style>
