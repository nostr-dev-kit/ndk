<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKArticle, NDKKind } from '@nostr-dev-kit/ndk';
  import { Article } from '$lib/registry/ui/article';
  import { Motion } from 'svelte-motion';

  const ndk = getContext<NDKSvelte>('ndk');

  let articles = $state<NDKArticle[]>([]);

  $effect(() => {
    (async () => {
      try {
        const events = await ndk.fetchEvents({
          kinds: [NDKKind.Article],
          authors: [
            '6e468422dfb74a5738702a8823b9b28168abab8655faacb6853cd0ee15deee93',
            ...ndk.$follows
          ],
          limit: 4
        });

        articles = Array.from(events)
          .map((event) => NDKArticle.from(event))
          .filter((a) => a.title && a.image)
          .slice(0, 4);
      } catch (error) {
        console.error('Failed to fetch articles:', error);
      }
    })();
  });
</script>

<div class="relative h-full w-full overflow-hidden">
  <!-- Background: Stacked hero cards with tilted container (grayscale) -->
  <div class="absolute inset-0 flex flex-col justify-center items-center p-8 opacity-70">
    <div style="transform: rotate(-8deg); transform-origin: center center;">
      <div class="flex flex-col gap-[10rem] scale-[0.5] origin-center w-[1200px]">
        {#each articles as article, i (article.id)}
          <Motion
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15, duration: 0.6 }}
            let:motion
          >
            <div use:motion class="grayscale hover:grayscale-0 transition-all duration-500">
              <Article.Root {ndk} {article}>
                <div class="h-[400px] rounded-2xl overflow-hidden border border-border bg-card shadow-2xl relative">
                  <Article.Image class="h-full w-full absolute inset-0" />
                  <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <div class="absolute bottom-0 left-0 right-0 p-8 text-white">
                    {#if i === 0}
                      <span class="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-semibold uppercase mb-3">
                        Featured
                      </span>
                    {/if}
                    <Article.Title class="text-3xl font-bold mb-3 line-clamp-2" />
                    <Article.Summary class="text-sm text-white/90 line-clamp-2" maxLength={120} />
                  </div>
                </div>
              </Article.Root>
            </div>
          </Motion>
        {/each}
      </div>
    </div>
  </div>

  <!-- Dark gradient overlay for text contrast -->
  <div class="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/40 pointer-events-none"></div>

  <!-- Text overlay -->
  <Motion
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.6, duration: 0.6 }}
    let:motion
  >
    <div use:motion class="absolute bottom-0 left-0 right-0 p-6 z-10">
      <div class="mb-2">
        <span class="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-semibold uppercase">
          Stacked
        </span>
      </div>
      <h3 class="text-3xl font-bold text-white mb-2">Hero Stack</h3>
      <p class="text-white/80 text-sm">Layered hero cards with 3D depth effect</p>
    </div>
  </Motion>
</div>
