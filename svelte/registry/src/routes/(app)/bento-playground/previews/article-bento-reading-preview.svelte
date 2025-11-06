<script lang="ts">
  import { getContext, onMount } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKArticle, NDKKind } from '@nostr-dev-kit/ndk';
  import { Motion } from 'svelte-motion';

  const ndk = getContext<NDKSvelte>('ndk');

  let article = $state<NDKArticle | undefined>();
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
          limit: 1
        });

        const articlesArray = Array.from(events)
          .map((event) => NDKArticle.from(event))
          .filter((a) => a.title && a.content);

        if (articlesArray.length > 0) {
          article = articlesArray[0];
        }
      } catch (error) {
        console.error('Failed to fetch article:', error);
      }
    })();
  });

  onMount(() => {
    // Slow auto-scroll animation
    if (scrollContainer) {
      let scrollPosition = 0;
      autoScrollInterval = setInterval(() => {
        if (scrollContainer && !isPaused) {
          scrollPosition += 0.3;
          scrollContainer.scrollTop = scrollPosition;

          // Reset to top when reaching bottom
          if (scrollPosition >= scrollContainer.scrollHeight - scrollContainer.clientHeight) {
            scrollPosition = 0;
          }
        }
      }, 50);
    }

    return () => {
      if (autoScrollInterval) clearInterval(autoScrollInterval);
    };
  });
</script>

<div
  bind:this={containerElement}
  class="relative h-full w-full overflow-hidden"
  onmouseenter={() => isPaused = true}
  onmouseleave={() => isPaused = false}
>
  <!-- Background: Reading view (grayscale) -->
  <div
    bind:this={scrollContainer}
    class="absolute inset-0 overflow-y-auto scrollbar-hide grayscale opacity-60"
  >
    {#if article}
      <div class="max-w-2xl mx-auto px-8 py-12">
        <h1 class="text-4xl font-serif font-bold mb-4 text-foreground">{article.title}</h1>
        {#if article.summary}
          <p class="text-xl text-muted-foreground mb-8 italic">{article.summary}</p>
        {/if}
        <div class="prose prose-lg max-w-none">
          <p class="text-foreground leading-relaxed">
            {article.content.slice(0, 1000)}...
          </p>
        </div>
      </div>
    {:else}
      <div class="flex items-center justify-center h-full">
        <div class="text-muted-foreground">Loading article...</div>
      </div>
    {/if}
  </div>

  <!-- Dark gradient overlay for text contrast -->
  <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent pointer-events-none"></div>

  <!-- Text overlay -->
  <Motion
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.25, duration: 0.6 }}
    let:motion
  >
    <div use:motion class="absolute bottom-0 left-0 right-0 p-6 z-10">
      <h3 class="text-3xl font-bold text-white mb-2">Reading Experience</h3>
      <p class="text-white/80 text-sm">Clean, focused reading with beautiful typography</p>
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
