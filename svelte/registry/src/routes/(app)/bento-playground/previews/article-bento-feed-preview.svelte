<script lang="ts">
  import { getContext, onMount } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKArticle, NDKKind } from '@nostr-dev-kit/ndk';
  import { Article } from '$lib/registry/ui/article';
  import { Motion } from 'svelte-motion';

  const ndk = getContext<NDKSvelte>('ndk');

  let articles = $state<NDKArticle[]>([]);
  let scrollContainer = $state<HTMLDivElement>();
  let containerElement = $state<HTMLDivElement>();
  let autoScrollInterval: ReturnType<typeof setInterval>;
  let isPaused = $state(false);

  $effect(() => {
    (async () => {
      try {
        const events = await ndk.fetchEvents({
          kinds: [NDKKind.Article],
          authors: [
            '6e468422dfb74a5738702a8823b9b28168abab8655faacb6853cd0ee15deee93',
            ...ndk.$follows
          ],
          limit: 8
        });

        articles = Array.from(events)
          .map((event) => NDKArticle.from(event))
          .filter((a) => a.title);
      } catch (error) {
        console.error('Failed to fetch articles:', error);
      }
    })();
  });

  onMount(() => {
    // Auto-scroll animation
    if (scrollContainer) {
      let scrollPosition = 0;
      autoScrollInterval = setInterval(() => {
        if (scrollContainer && !isPaused) {
          scrollPosition += 0.5;
          scrollContainer.scrollTop = scrollPosition;

          // Reset to top when reaching bottom
          if (scrollPosition >= scrollContainer.scrollHeight - scrollContainer.clientHeight) {
            scrollPosition = 0;
          }
        }
      }, 30);
    }

    return () => {
      if (autoScrollInterval) clearInterval(autoScrollInterval);
    };
  });
</script>

<div
  bind:this={containerElement}
  class="relative h-full w-full overflow-hidden"
  role="region"
  aria-label="Article feed preview"
  onmouseenter={() => isPaused = true}
  onmouseleave={() => isPaused = false}
>
  <!-- Background: Scrolling feed (grayscale) -->
  <div
    bind:this={scrollContainer}
    class="absolute inset-0 overflow-y-auto scrollbar-hide opacity-70"
  >
    <div class="space-y-0">
      {#each articles as article (article.id)}
        <div class="grayscale hover:grayscale-0 transition-all duration-500">
          <Article.Root {ndk} {article}>
            <div class="flex gap-4 p-4 border-b border-border bg-card hover:bg-muted/50 transition-colors">
              <Article.Image class="h-24 w-32 flex-shrink-0 rounded-lg" />
              <div class="flex-1 flex flex-col gap-2 min-w-0">
                <Article.Title class="text-base font-semibold line-clamp-2" />
                <Article.Summary class="text-xs text-muted-foreground line-clamp-2" maxLength={100} />
                <Article.ReadingTime class="text-xs text-muted-foreground mt-auto" />
              </div>
            </div>
          </Article.Root>
        </div>
      {/each}
    </div>
  </div>

  <!-- Dark gradient overlay for text contrast -->
  <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none"></div>

  <!-- Text overlay -->
  <Motion
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2, duration: 0.6 }}
    let:motion
  >
    <div use:motion class="absolute bottom-0 left-0 right-0 p-6 z-10">
      <h3 class="text-3xl font-bold text-white mb-2">Article Feed</h3>
      <p class="text-white/80 text-sm">Browse your reading list with infinite scroll</p>
    </div>
  </Motion>
</div>

<style>
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
</style>
