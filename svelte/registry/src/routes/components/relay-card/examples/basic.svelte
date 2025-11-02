<script lang="ts">
  import { Relay } from '$lib/registry/ui/relay';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';

  interface Props {
    ndk: NDKSvelte;
    relayUrl: string;
  }

  let { ndk, relayUrl }: Props = $props();
</script>

<Relay.Root {ndk} {relayUrl}>
  <div class="flex items-center gap-3 p-4 bg-card border border-border rounded-lg">
    <Relay.Icon size={48} />
    <div class="flex-1">
      <Relay.Name class="font-semibold text-foreground" />
      <Relay.Url class="text-sm text-muted-foreground" />
    </div>
  </div>
</Relay.Root>
