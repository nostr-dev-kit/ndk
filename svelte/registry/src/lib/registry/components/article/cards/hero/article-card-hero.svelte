<script lang="ts">
  import type { NDKArticle } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import Root from '../../../../ui/article/article-root.svelte';
  import Title from '../../../../ui/article/article-title.svelte';
  import Summary from '../../../../ui/article/article-summary.svelte';
  import ReadingTime from '../../../../ui/article/article-reading-time.svelte';
  import { User } from '../../../../ui/user';
  import { cn } from '../../../../utils/cn';
  import { getContext } from 'svelte';
  import { ARTICLE_CONTEXT_KEY, type ArticleContext } from '../../../../ui/article/article.context.js';
  import { createTimeAgo } from '../../../../utils/time-ago.svelte.js';

  interface Props {
    ndk: NDKSvelte;

    article: NDKArticle;

    height?: string;

    badgeText?: string;

    onclick?: (e: MouseEvent) => void;

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
    data-article-card-hero=""
    this={onclick ? 'button' : 'div'}
    type={onclick ? 'button' : undefined}
    role={onclick ? 'button' : undefined}
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
      <Title class="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight line-clamp-1" />

      <!-- Summary -->
      <Summary class="text-base md:text-lg text-white/90 mb-6 leading-relaxed max-w-3xl line-clamp-2" maxLength={200} />

      <!-- Author & Meta -->
      <User.Root {ndk} user={article.author}>
        <div class="flex items-center gap-3 text-white/80">
          <!-- Avatar -->
          <User.Avatar class="w-10 h-10" />

          <!-- Author Name & Meta Info -->
          <div class="flex flex-col">
            <User.Name class="font-semibold text-white" field="displayName" />
            <div class="flex items-center gap-2 text-sm">
              {#if timeAgo}
                <time>Published {timeAgo}</time>
                <span>•</span>
              {/if}
              <ReadingTime />
            </div>
          </div>
        </div>
      </User.Root>
    </div>
  </svelte:element>
</Root>
