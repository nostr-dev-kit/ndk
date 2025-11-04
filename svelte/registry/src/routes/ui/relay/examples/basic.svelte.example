<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { Relay } from '$lib/registry/ui';

  const ndk = getContext<NDKSvelte>('ndk');
  const relayUrl = 'wss://relay.damus.io';
</script>

<Relay.Root {ndk} {relayUrl}>
  <div class="flex items-center gap-3">
    <Relay.Icon />
    <div>
      <Relay.Name />
      <Relay.Url />
    </div>
  </div>
</Relay.Root>

<style>
  .flex { display: flex; }
  .items-center { align-items: center; }
  .gap-3 { gap: 0.75rem; }
</style>
