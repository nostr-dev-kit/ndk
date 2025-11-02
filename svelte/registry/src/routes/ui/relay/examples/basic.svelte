<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { Relay } from '$lib/registry/ui';

  const ndk = getContext<NDKSvelte>('ndk');
  const relayUrl = 'wss://relay.damus.io';
</script>

<Relay.Root {ndk} {relayUrl}>
  <div class="flex items-center gap-3">
    <Relay.Icon class="w-8 h-8" />
    <div>
      <Relay.Name class="font-semibold" />
      <Relay.Url class="text-sm text-gray-500" />
    </div>
  </div>
</Relay.Root>

<style>
  .flex { display: flex; }
  .items-center { align-items: center; }
  .gap-3 { gap: 0.75rem; }
  .w-8 { width: 2rem; }
  .h-8 { height: 2rem; }
  .font-semibold { font-weight: 600; }
  .text-sm { font-size: 0.875rem; }
  .text-gray-500 { color: #6b7280; }
</style>
