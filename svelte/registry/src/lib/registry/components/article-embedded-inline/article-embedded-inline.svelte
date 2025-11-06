<!-- @ndk-version: article-embedded-inline@0.1.0 -->
<script lang="ts">
  import type { NDKArticle } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { Article } from '../../ui/article';

  interface Props {
    ndk: NDKSvelte;
    event: NDKArticle;
  }

  let { ndk, event }: Props = $props();

  const article = event as NDKArticle;
</script>

<div data-article-embedded-inline="" class="rounded-lg overflow-hidden border border-border bg-card max-w-[400px]">
  <Article.Root {ndk} {article}>
    <div class="flex flex-col">
      <Article.Image class="h-32" />

      <div class="p-3 flex flex-col gap-2">
        <Article.Title class="text-sm font-semibold" />
        <Article.Summary class="text-xs text-muted-foreground" maxLength={80} />

        <div class="mt-auto pt-2 border-t border-border">
          <Article.ReadingTime class="text-xs" />
        </div>
      </div>
    </div>
  </Article.Root>
</div>
