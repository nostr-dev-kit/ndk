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

  // Only show highlights from followed users
  function highlightFilter(highlight: NDKHighlight) {
    return ndk.$follows.has(highlight.pubkey);
  }
</script>

<ArticleContent {ndk} {article} {highlightFilter} />
