<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import { EventContent } from '$lib/registry/ui';
  import Mention from '$lib/registry/components/mention/mention.svelte';
  import Hashtag from '$lib/registry/components/hashtag/hashtag.svelte';
  import EmbeddedEvent from '$lib/registry/ui/embedded-event.svelte';

  interface Props {
    ndk: NDKSvelte;
    event: NDKEvent;
  }

  let { ndk, event }: Props = $props();

  function handleHashtagClick(tag: string) {
    console.log('Hashtag clicked:', tag);
  }
</script>

<EventContent {ndk} {event}>
  {#snippet mention({ bech32 })}
    <Mention {ndk} {bech32} />
  {/snippet}
  {#snippet hashtag({ tag })}
    <Hashtag {tag} onclick={handleHashtagClick} />
  {/snippet}
  {#snippet eventRef({ bech32 })}
    <EmbeddedEvent {ndk} {bech32} />
  {/snippet}
</EventContent>
