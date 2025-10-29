<script lang="ts">
  import { RelayCard } from '$lib/ndk/relay-card';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { BookmarkedRelayListState } from '@nostr-dev-kit/svelte';

  interface Props {
    ndk: NDKSvelte;
    relayUrl: string;
    followsBookmarks: BookmarkedRelayListState;
  }

  let { ndk, relayUrl, followsBookmarks }: Props = $props();
</script>

<RelayCard.Root {ndk} {relayUrl}>
  <div class="p-4 bg-card border border-border rounded-lg">
    <div class="flex items-center gap-3 mb-3">
      <RelayCard.Icon size={48} />
      <div class="flex-1">
        <RelayCard.Name class="font-semibold text-foreground" />
        <RelayCard.Url class="text-sm text-muted-foreground" />
      </div>
    </div>
    <RelayCard.BookmarkedBy bookmarks={followsBookmarks} max={5} />
  </div>
</RelayCard.Root>
