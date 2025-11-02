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
          limit: 10
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
    // Auto-scroll animation (horizontal) - slower
    if (scrollContainer) {
      let scrollPosition = 0;
      autoScrollInterval = setInterval(() => {
        if (scrollContainer && !isPaused) {
          scrollPosition += 0.3;
          scrollContainer.scrollLeft = scrollPosition;

          // Reset to start when reaching end
          if (scrollPosition >= scrollContainer.scrollWidth - scrollContainer.clientWidth) {
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
  class="relative h-full w-full overflow-hidden min-h-[400px]"
  onmouseenter={() => isPaused = true}
  onmouseleave={() => isPaused = false}
>
  <!-- Background: Horizontal scrolling grid (grayscale) -->
  <div
    bind:this={scrollContainer}
    class="absolute inset-0 overflow-x-auto scrollbar-hide opacity-70"
  >
    <div class="flex gap-6 p-6 h-full items-center">
      {#each articles as article, i}
        <Motion
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1, duration: 0.4 }}
          let:motion
        >
          <div use:motion class="flex-shrink-0 grayscale hover:grayscale-0 transition-all duration-500">
            <div class="scale-75 w-80">
              <Article.Root {ndk} {article}>
                <div class="h-[480px] rounded-xl overflow-hidden border border-border bg-card shadow-lg flex flex-col">
                  <Article.Image class="h-64 w-full" showGradient={true} />
                  <div class="flex-1 p-6 flex flex-col gap-3">
                    <Article.Title class="text-lg font-bold line-clamp-2" />
                    <Article.Summary class="text-sm text-muted-foreground line-clamp-3" maxLength={150} />
                    <div class="mt-auto pt-4 border-t border-border">
                      <Article.ReadingTime class="text-xs text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </Article.Root>
            </div>
          </div>
        </Motion>
      {/each}
    </div>
  </div>

  <!-- Dark gradient overlay for text contrast -->
  <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none"></div>

  <!-- Text overlay -->
  <Motion
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3, duration: 0.6 }}
    let:motion
  >
    <div use:motion class="absolute bottom-0 left-0 right-0 p-6 z-10">
      <h3 class="text-3xl font-bold text-white mb-2">Article Grid</h3>
      <p class="text-white/80 text-sm">Discover content visually in a masonry layout</p>
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
