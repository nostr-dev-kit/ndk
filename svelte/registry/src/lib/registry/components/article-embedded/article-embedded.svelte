<!-- @ndk-version: article-embedded@0.1.0 -->
<script lang="ts">
  import type { NDKArticle } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { Article } from '../../ui/article';

  interface Props {
    ndk: NDKSvelte;
    event: NDKArticle;
    variant?: 'inline' | 'card' | 'compact';
  }

  let { ndk, event, variant = 'card' }: Props = $props();

  // Convert to NDKArticle if needed
  const article = event as NDKArticle;
</script>

<div data-article-embedded="" class="rounded-lg overflow-hidden border border-border bg-card">
  <Article.Root {ndk} {article}>
    <div class="flex {variant === 'compact' ? 'flex-row gap-3 p-2' : 'flex-col'} {variant === 'inline' ? 'max-w-[400px]' : ''}">
      <Article.Image
        class={variant === 'compact' ? 'h-24' : variant === 'inline' ? 'h-32' : 'h-40'}
      />

      <div class="flex flex-col gap-2 {variant === 'compact' ? 'flex-1 p-0' : 'p-3'}">
        <Article.Title
          class="text-sm font-semibold"
        />

        {#if variant !== 'compact'}
          <Article.Summary
            class="text-xs text-muted-foreground"
            maxLength={variant === 'inline' ? 80 : 120}
          />
        {/if}

        <div class="mt-auto {variant === 'compact' ? 'pt-0' : 'pt-2 border-t border-border'}">
          <Article.ReadingTime class="text-xs" />
        </div>
      </div>
    </div>
  </Article.Root>
</div>
