<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKArticle } from '@nostr-dev-kit/ndk';
  import { ArticleCardMedium } from '$lib/ndk/blocks';

  interface Props {
    ndk: NDKSvelte;
    articles: NDKArticle[];
  }

  let { ndk, articles }: Props = $props();
</script>

<div class="space-y-0 border border-border rounded-lg overflow-hidden">
  {#each articles as article}
    <ArticleCardMedium {ndk} {article} />
  {/each}
</div>
