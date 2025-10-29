<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKArticle } from '@nostr-dev-kit/ndk';
  import { ArticleCard } from '$lib/ndk/article-card';

  interface Props {
    ndk: NDKSvelte;
    articles: NDKArticle[];
  }

  let { ndk, articles }: Props = $props();
</script>

<div class="flex gap-6 overflow-x-auto pb-4">
  {#each articles as article}
    <ArticleCard.Portrait {ndk} {article} />
  {/each}
</div>
