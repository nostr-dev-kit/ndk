<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKArticle } from '@nostr-dev-kit/ndk';
  import ArticleCardNeon from '$lib/registry/blocks/article-card-neon.svelte';

  interface Props {
    ndk: NDKSvelte;
    article: NDKArticle;
  }

  let { ndk, article }: Props = $props();
</script>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <ArticleCardNeon {ndk} {article} theme="purple" />
  <ArticleCardNeon {ndk} {article} theme="blue" />
  <ArticleCardNeon {ndk} {article} theme="pink" />
  <ArticleCardNeon {ndk} {article} theme="green" />
  <ArticleCardNeon {ndk} {article} theme="orange" />
  <ArticleCardNeon {ndk} {article} theme="yellow" />
</div>
