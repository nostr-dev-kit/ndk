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
  import { createProfileFetcher } from '@nostr-dev-kit/svelte';
  import Root from '../../ui/article/article-root.svelte';
  import Title from '../../ui/article/article-title.svelte';
  import Summary from '../../ui/article/article-summary.svelte';
  import ReadingTime from '../../ui/article/article-reading-time.svelte';
  import { cn } from '../../utils/index.js';
  import { getContext } from 'svelte';
  import { ARTICLE_CONTEXT_KEY, type ArticleContext } from '../../ui/article/context.svelte.js';
  import { createTimeAgo } from '../../utils/time-ago.svelte.js';

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

  // Fetch author profile for avatar/name display
  const profileFetcher = $derived.by(() => {
    const user = article.author;
    if (!user) return null;
    return createProfileFetcher(() => ({ user }), ndk);
  });

  const authorProfile = $derived(profileFetcher?.profile);

  const publishedAt = $derived(article.published_at);
  const articleImage = $derived(article.image);

  // Create reactive time ago string
  const timeAgo = $derived(publishedAt ? createTimeAgo(publishedAt) : null);

  const baseClasses = cn(
    'article-card-hero',
    'group relative w-full rounded-3xl overflow-hidden',
    'bg-gradient-to-br from-purple-500 via-purple-600 to-blue-600',
    'transition-all duration-300',
    'text-left',
    height,
    className
  );

  const interactiveClasses = onclick ? 'hover:shadow-2xl hover:shadow-purple-500/20 cursor-pointer' : '';
</script>

<Root {ndk} {article}>
  <svelte:element
    this={onclick ? 'button' : 'div'}
    type={onclick ? 'button' : undefined}
    {onclick}
    class={cn(baseClasses, interactiveClasses)}
  >
    <!-- Background Image -->
    {#if articleImage}
      <div class="absolute inset-0">
        <img
          src={articleImage}
          alt={article.title || 'Article'}
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
      <Title class="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight line-clamp-3" />

      <!-- Summary -->
      <Summary class="text-base md:text-lg text-white/90 mb-6 leading-relaxed max-w-3xl line-clamp-2" maxLength={200} />

      <!-- Author & Meta -->
      <div class="flex items-center gap-3 text-white/80">
        <!-- Avatar -->
        {#if authorProfile?.image}
          <img
            src={authorProfile.image}
            alt={authorProfile.name || 'Author'}
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
            {authorProfile?.name || authorProfile?.displayName || 'Anonymous'}
          </span>
          <div class="flex items-center gap-2 text-sm">
            {#if timeAgo}
              <time>Published {timeAgo}</time>
              <span>•</span>
            {/if}
            <ReadingTime />
          </div>
        </div>
      </div>
    </div>
  </svelte:element>
</Root>
