<script lang="ts">
  import type { NDKArticle } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { Article } from '../../ui/article';

  interface Props {
    ndk: NDKSvelte;
    article: NDKArticle;
  }

  let { ndk, article }: Props = $props();
</script>

<div data-article-card-compact="" class="rounded-lg overflow-hidden border border-border bg-card">
  <Article.Root {ndk} {article}>
    <div class="flex flex-row gap-3 p-2">
      <Article.Image class="h-24" />

      <div class="flex-1 flex flex-col gap-1 min-w-0">
        <Article.Title class="text-sm font-semibold" />
        <Article.Summary class="text-xs text-muted-foreground" />
        <div class="mt-auto">
          <Article.ReadingTime class="text-xs" />
        </div>
      </div>
    </div>
  </Article.Root>
</div>
