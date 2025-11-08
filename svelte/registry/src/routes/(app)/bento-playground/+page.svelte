<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { BentoGrid, BentoGridItem } from '$lib/site/components/bento';
  import ArticleBentoGridPreview from './previews/article-bento-grid-preview.svelte';
  import ArticleBentoHeroPreview from './previews/article-bento-hero-preview.svelte';
  import ArticleBentoFeedPreview from './previews/article-bento-feed-preview.svelte';
  import ArticleBentoReadingPreview from './previews/article-bento-reading-preview.svelte';

  const ndk = getContext<NDKSvelte>('ndk');
</script>

<div class="container mx-auto px-4 py-12">
  <div class="mb-12">
    <h1 class="text-4xl font-bold mb-4">Bento Grid Playground</h1>
    <p class="text-muted-foreground text-lg">
      Interactive showcase of article display variations using the bento grid layout.
      Hover over cards to see animations and interactions.
    </p>
  </div>

  <BentoGrid>
    <!-- Article Grid Preview (Top Left - Spans 2 columns) -->
    <BentoGridItem class="md:col-span-2 md:row-span-2">
      {#snippet header()}
        <ArticleBentoGridPreview />
      {/snippet}
    </BentoGridItem>

    <!-- Hero Stack Preview (Top Right) -->
    <BentoGridItem class="md:col-span-1 md:row-span-2">
      {#snippet header()}
        <ArticleBentoHeroPreview />
      {/snippet}
    </BentoGridItem>

    <!-- Article Feed Preview (Bottom Left) -->
    <BentoGridItem class="md:col-span-1 md:row-span-1">
      {#snippet header()}
        <ArticleBentoFeedPreview />
      {/snippet}
    </BentoGridItem>

    <!-- Reading Experience Preview (Bottom Middle/Right - Spans 2 columns) -->
    <BentoGridItem class="md:col-span-2 md:row-span-1">
      {#snippet header()}
        <ArticleBentoReadingPreview />
      {/snippet}
    </BentoGridItem>
  </BentoGrid>
</div>
