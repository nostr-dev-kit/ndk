<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKArticle } from '@nostr-dev-kit/ndk';
  import ArticleCardPortrait from '$lib/registry/components/blocks/article-card-portrait.svelte';

  interface Props {
    ndk: NDKSvelte;
    articles: NDKArticle[];
  }

  let { ndk, articles }: Props = $props();
</script>

<div class="flex gap-6 overflow-x-auto pb-4">
  {#each articles as article}
    <ArticleCardPortrait {ndk} {article} />
  {/each}
</div>
