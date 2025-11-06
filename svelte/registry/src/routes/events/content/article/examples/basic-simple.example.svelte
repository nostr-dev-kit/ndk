<script lang="ts">
  import type { NDKArticle } from '@nostr-dev-kit/ndk';
  import { ArticleContentBasic } from '$lib/registry/components/article-content';

  interface Props {
    article: NDKArticle;
  }

  let { article }: Props = $props();
</script>

<ArticleContentBasic {article} class="text-xs" />
