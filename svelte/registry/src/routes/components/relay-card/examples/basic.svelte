<script lang="ts">
  import { RelayCard } from '$lib/components/ndk/relay-card';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';

  interface Props {
    ndk: NDKSvelte;
    relayUrl: string;
  }

  let { ndk, relayUrl }: Props = $props();
</script>

<RelayCard.Root {ndk} {relayUrl}>
  <div class="flex items-center gap-3 p-4 bg-card border border-border rounded-lg">
    <RelayCard.Icon size={48} />
    <div class="flex-1">
      <RelayCard.Name class="font-semibold text-foreground" />
      <RelayCard.Url class="text-sm text-muted-foreground" />
    </div>
  </div>
</RelayCard.Root>
