<!-- @ndk-version: article-card-hero@0.4.0 -->
<!--
  @component ArticleCard.Hero
  Hero-style article card preset with prominent gradient background and featured badge

  Ideal for featured/hero sections and landing pages.

  @example
  ```svelte
  <ArticleCard.Hero {ndk} {article} />
  ```
-->
<script lang="ts">
  import type { NDKArticle } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import Root from '../ui/article/article-root.svelte';
  import Title from '../ui/article/article-title.svelte';
  import Summary from '../ui/article/article-summary.svelte';
  import ReadingTime from '../ui/article/article-reading-time.svelte';
  import { cn } from '../../../utils.js';
  import { getContext } from 'svelte';
  import { ARTICLE_CONTEXT_KEY, type ArticleContext } from '../ui/article/context.svelte.js';
  import TimeAgo from '../time-ago/time-ago.svelte';

  interface Props {
    /** NDK instance */
    ndk: NDKSvelte;

    /** Article to display */
    article: NDKArticle;

    /** Height of the hero section (default: h-[500px]) */
    height?: string;

    /** Badge text (if provided, badge will be shown) */
    badgeText?: string;

    /** Click handler */
    onclick?: (e: MouseEvent) => void;

    /** Additional CSS classes */
    class?: string;
  }

  let {
    ndk,
    article,
    height = 'h-[500px]',
    badgeText,
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
  {@const context = getContext<ArticleContext>(ARTICLE_CONTEXT_KEY)}
  {@const authorProfile = context.authorProfile}
  {@const publishedAt = context.article.published_at}
  {@const articleImage = context.article.image}

  <button
    type="button"
    onclick={handleClick}
    class={cn(
      'article-card-hero',
      'group relative w-full rounded-3xl overflow-hidden',
      'bg-gradient-to-br from-purple-500 via-purple-600 to-blue-600',
      'transition-all duration-300',
      'hover:shadow-2xl hover:shadow-purple-500/20',
      'text-left',
      height,
      className
    )}
  >
    <!-- Background Image -->
    {#if articleImage}
      <div class="absolute inset-0">
        <img
          src={articleImage}
          alt={context.article.title || 'Article'}
          class="w-full h-full object-cover"
        />
      </div>
    {/if}

    <!-- Dark overlay for better text contrast -->
    <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20"></div>

    <!-- Content Container -->
    <div class="relative h-full flex flex-col justify-end p-4 md:p-6 lg:p-8">
      <!-- Badge -->
      {#if badgeText}
        <div class="mb-4">
          <span class="inline-block px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-semibold tracking-wider uppercase">
            {badgeText}
          </span>
        </div>
      {/if}

      <!-- Title -->
      <Title class="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight" lines={3} />

      <!-- Summary -->
      <Summary class="text-base md:text-lg text-white/90 mb-6 leading-relaxed max-w-3xl" maxLength={200} lines={2} />

      <!-- Author & Meta -->
      <div class="flex items-center gap-3 text-white/80">
        <!-- Avatar -->
        {#if authorProfile?.profile?.image}
          <img
            src={authorProfile.profile.image}
            alt={authorProfile.profile?.name || 'Author'}
            class="w-10 h-10 rounded-full object-cover bg-white/10"
          />
        {:else}
          <div class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
        {/if}

        <!-- Author Name & Meta Info -->
        <div class="flex flex-col">
          <span class="font-semibold text-white">
            {authorProfile?.profile?.name || authorProfile?.profile?.displayName || 'Anonymous'}
          </span>
          <div class="flex items-center gap-2 text-sm">
            {#if publishedAt}
              <span>Published <TimeAgo timestamp={publishedAt} element="time" /></span>
              <span>•</span>
            {/if}
            <ReadingTime />
          </div>
        </div>
      </div>
    </div>
  </button>
</Root>
