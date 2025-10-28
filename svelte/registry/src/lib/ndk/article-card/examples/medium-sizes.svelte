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

<div class="space-y-0 border border-border rounded-lg overflow-hidden">
  <ArticleCard.Medium {ndk} {article} imageSize="small" />
  <ArticleCard.Medium {ndk} {article} imageSize="medium" />
  <ArticleCard.Medium {ndk} {article} imageSize="large" />
</div>
