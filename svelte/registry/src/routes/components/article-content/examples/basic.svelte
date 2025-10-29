<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKArticle } from '@nostr-dev-kit/ndk';
  import { ArticleContent } from '$lib/ndk/article-content';

  interface Props {
    article: NDKArticle;
  }

  let { article }: Props = $props();

  const ndk = getContext<NDKSvelte>('ndk');
</script>

<ArticleContent {ndk} {article} />
