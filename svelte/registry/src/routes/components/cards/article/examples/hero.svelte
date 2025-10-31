<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKArticle } from '@nostr-dev-kit/ndk';
  import { ArticleCardHero } from '$lib/components/ndk/blocks';

  interface Props {
    ndk: NDKSvelte;
    article: NDKArticle;
  }

  let { ndk, article }: Props = $props();
</script>

<ArticleCardHero {ndk} {article} />
