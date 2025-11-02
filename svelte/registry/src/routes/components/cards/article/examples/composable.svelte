<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKArticle } from '@nostr-dev-kit/ndk';
  import { Article } from '$lib/registry/ui/article';

  interface Props {
    ndk: NDKSvelte;
    article: NDKArticle;
  }

  let { ndk, article }: Props = $props();
</script>

<Article.Root {ndk} {article}>
  <div class="border border-border rounded-xl overflow-hidden bg-card max-w-2xl">
    <div class="relative">
      <Article.Image class="h-64 w-full object-cover" />
      <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
    </div>
    <div class="p-6">
      <Article.Title class="text-3xl mb-3 line-clamp-3" />
      <Article.Summary class="text-base mb-4 line-clamp-4" maxLength={250} />
      <div class="flex items-center justify-between pt-4 border-t border-border">
        <Article.ReadingTime />
        <button class="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
          Read Article
        </button>
      </div>
    </div>
  </div>
</Article.Root>
