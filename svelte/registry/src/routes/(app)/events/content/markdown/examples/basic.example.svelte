<script lang="ts">
    import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { ndk } from '$lib/site/ndk.svelte';
  import type { NDKArticle } from '@nostr-dev-kit/ndk';
  import { ArticleContent } from '$lib/registry/components/article-content';

  interface Props {
    article: NDKArticle;
  }

  let { article }: Props = $props();</script>

<ArticleContent {ndk} {article} />
