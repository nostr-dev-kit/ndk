<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { GenericEmbedded } from '$lib/ndk/event/content';

  interface Props {
    ndk: NDKSvelte;
    event: NDKEvent;
  }

  let { ndk, event }: Props = $props();
</script>

<div class="space-y-4">
  <div>
    <div class="text-sm font-medium mb-2">Card Variant</div>
    <GenericEmbedded {ndk} {event} variant="card" />
  </div>

  <div>
    <div class="text-sm font-medium mb-2">Inline Variant</div>
    <GenericEmbedded {ndk} {event} variant="inline" />
  </div>

  <div>
    <div class="text-sm font-medium mb-2">Compact Variant</div>
    <GenericEmbedded {ndk} {event} variant="compact" />
  </div>
</div>
