<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKArticle } from '@nostr-dev-kit/ndk';
  import { EventContent, KindRegistry } from '$lib/components/ndk/event/content';
  import ArticleEmbeddedInline from '$lib/components/ndk/event/content/kinds/article-embedded/article-embedded-inline.svelte';
  import { EventCard } from '$lib/components/ndk/event-card';

  interface Props {
    ndk: NDKSvelte;
    event: NDKEvent;
  }

  let { ndk, event }: Props = $props();

  // Create custom registry for inline variant
  const inlineRegistry = new KindRegistry();
  inlineRegistry.add(NDKArticle, ArticleEmbeddedInline);
</script>

<div class="max-w-2xl">
  <EventCard.Root {ndk} {event}>
    <EventCard.Header variant="full" showTimestamp={true} />
    <div class="p-4">
      <EventContent {ndk} {event} kindRegistry={inlineRegistry} />
    </div>
  </EventCard.Root>
</div>
