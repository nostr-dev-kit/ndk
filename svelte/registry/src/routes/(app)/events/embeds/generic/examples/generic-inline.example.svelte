<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { GenericEmbedded } from '$lib/registry/components/generic-embedded';

  interface Props {
    ndk: NDKSvelte;
    event: NDKEvent;
  }

  let { ndk, event }: Props = $props();
</script>

<div class="max-w-2xl">
  <GenericEmbedded {ndk} {event} variant="inline" />
</div>
