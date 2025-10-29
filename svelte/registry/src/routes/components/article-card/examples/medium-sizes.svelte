<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKArticle } from '@nostr-dev-kit/ndk';
  import { ArticleCardMedium } from '$lib/ndk/blocks';

  interface Props {
    ndk: NDKSvelte;
    article: NDKArticle;
  }

  let { ndk, article }: Props = $props();
</script>

<div class="space-y-0 border border-border rounded-lg overflow-hidden">
  <ArticleCardMedium {ndk} {article} imageSize="small" />
  <ArticleCardMedium {ndk} {article} imageSize="medium" />
  <ArticleCardMedium {ndk} {article} imageSize="large" />
</div>
