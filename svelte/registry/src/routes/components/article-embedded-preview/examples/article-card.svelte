<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKArticle } from '@nostr-dev-kit/ndk';
  import { EventContent, KindRegistry } from '$lib/ndk/event/content';
  import ArticleEmbeddedCard from '$lib/ndk/event/content/kinds/article-embedded/article-embedded-card.svelte';
  import { EventCard } from '$lib/ndk/event-card';

  interface Props {
    ndk: NDKSvelte;
    event: NDKEvent;
  }

  let { ndk, event }: Props = $props();

  // Create custom registry for card variant
  const cardRegistry = new KindRegistry();
  cardRegistry.add(NDKArticle, ArticleEmbeddedCard);
</script>

<div class="max-w-2xl">
  <EventCard.Root {ndk} {event}>
    <EventCard.Header variant="full" showTimestamp={true} />
    <div class="p-4">
      <EventContent {ndk} {event} kindRegistry={cardRegistry} />
    </div>
  </EventCard.Root>
</div>
