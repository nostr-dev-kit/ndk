<script lang="ts">
  import { RelayCard } from '$lib/registry/components/relay-card';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { BookmarkedRelayListState } from '@nostr-dev-kit/svelte';

  interface Props {
    ndk: NDKSvelte;
    relayUrl: string;
    followsBookmarks: BookmarkedRelayListState;
    bookmarksWithToggle: BookmarkedRelayListState;
  }

  let { ndk, relayUrl, followsBookmarks, bookmarksWithToggle }: Props = $props();
</script>

<RelayCard.Root {ndk} {relayUrl}>
  <div class="p-4 bg-card border border-border rounded-lg">
    <div class="flex items-center gap-3 mb-3">
      <RelayCard.Icon size={64} />
      <div class="flex-1">
        <RelayCard.Name class="font-semibold text-foreground" />
        <RelayCard.Url class="text-sm text-muted-foreground" />
      </div>
      <RelayCard.BookmarkButton bookmarks={bookmarksWithToggle} size="lg" />
    </div>
    <RelayCard.Description maxLines={3} class="mt-3" />
    <RelayCard.BookmarkedBy bookmarks={followsBookmarks} />
  </div>
</RelayCard.Root>
