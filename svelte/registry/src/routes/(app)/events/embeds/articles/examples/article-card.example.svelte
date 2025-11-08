<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKArticle } from '@nostr-dev-kit/ndk';
  import EventContent from '$lib/registry/ui/event-content.svelte'; import { ContentRenderer } from '$lib/registry/ui/content-renderer.svelte.js';
  import ArticleCardMedium from '$lib/registry/components/article/cards/basic/article-card-medium.svelte';
  import { EventCard } from '$lib/registry/components/event/cards/compound';

  interface Props {
    ndk: NDKSvelte;
    event: NDKEvent;
  }

  let { ndk, event }: Props = $props();

  // Create custom renderer for card variant
  const cardRenderer = new ContentRenderer();
  cardRenderer.addKind(NDKArticle, ArticleCardMedium);
</script>

<div class="max-w-2xl">
  <EventCard.Root {ndk} {event}>
    <EventCard.Header variant="full" showTimestamp={true} />
    <div class="p-4">
      <EventContent {ndk} {event} renderer={cardRenderer} />
    </div>
  </EventCard.Root>
</div>
