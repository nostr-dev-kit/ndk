<script lang="ts">
  import type { NDKArticle } from '@nostr-dev-kit/ndk';
  import { MarkdownEventContent } from '$lib/registry/ui/markdown-event-rendering';

  interface Props {
    article: NDKArticle;
  }

  let { article }: Props = $props();
</script>

<MarkdownEventContent content={article.content} emojiTags={article.tags} class="text-xs" />
