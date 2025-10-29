<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKArticle } from '@nostr-dev-kit/ndk';
  import { ArticleCard } from '$lib/ndk/article-card';

  interface Props {
    ndk: NDKSvelte;
    article: NDKArticle;
  }

  let { ndk, article }: Props = $props();
</script>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <ArticleCard.Neon {ndk} {article} theme="purple" />
  <ArticleCard.Neon {ndk} {article} theme="blue" />
  <ArticleCard.Neon {ndk} {article} theme="pink" />
  <ArticleCard.Neon {ndk} {article} theme="green" />
  <ArticleCard.Neon {ndk} {article} theme="orange" />
  <ArticleCard.Neon {ndk} {article} theme="yellow" />
</div>
