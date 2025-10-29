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

<div class="space-y-0 border border-border rounded-lg overflow-hidden">
  {#each articles as article}
    <ArticleCard.Medium {ndk} {article} />
  {/each}
</div>
