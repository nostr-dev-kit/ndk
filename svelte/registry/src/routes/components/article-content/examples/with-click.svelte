<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKArticle, NDKHighlight } from '@nostr-dev-kit/ndk';
  import { ArticleContent } from '$lib/ndk/article-content';

  interface Props {
    article: NDKArticle;
  }

  let { article }: Props = $props();

  const ndk = getContext<NDKSvelte>('ndk');

  function handleHighlightClick(highlight: NDKHighlight) {
    console.log('Highlight clicked:', highlight);
    // Show highlight details, drawer, etc.
  }
</script>

<ArticleContent {ndk} {article} onHighlightClick={handleHighlightClick} />
