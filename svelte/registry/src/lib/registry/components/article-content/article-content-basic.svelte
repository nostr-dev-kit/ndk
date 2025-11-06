<!-- @ndk-version: article-content-basic@0.1.0 -->
<script lang="ts">
  import type { NDKArticle } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import ArticleContent from './article-content.svelte';

  interface Props {
    article: NDKArticle;
    ndk?: NDKSvelte;
    class?: string;
  }

  let {
    article,
    ndk,
    class: className = ''
  }: Props = $props();
</script>

<div data-article-content-basic="" class={className}>
  <ArticleContent {ndk} {article} class="text-xs" />
</div>

