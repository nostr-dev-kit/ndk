<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import EventContent from '$lib/registry/ui/event-content.svelte'; import { ContentRenderer } from '$lib/registry/ui/content-renderer.svelte.js';
  import Mention from '$lib/registry/components/mention/mention.svelte';
  import Hashtag from '$lib/registry/components/hashtag/hashtag.svelte';

  interface Props {
    ndk: NDKSvelte;
    event: NDKEvent;
  }

  let { ndk, event }: Props = $props();

  function handleHashtagClick(tag: string) {
    console.log('Hashtag clicked:', tag);
  }

  const renderer = new ContentRenderer();
  renderer.mentionComponent = Mention;
  renderer.hashtagComponent = Hashtag;
</script>

<EventContent {ndk} {event} {renderer} />
