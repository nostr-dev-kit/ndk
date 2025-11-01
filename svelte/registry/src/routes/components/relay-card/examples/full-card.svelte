<script lang="ts">
  import { Relay } from '$lib/registry/components/relay';
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

<Relay.Root {ndk} {relayUrl}>
  <div class="p-4 bg-card border border-border rounded-lg">
    <div class="flex items-center gap-3 mb-3">
      <Relay.Icon size={64} />
      <div class="flex-1">
        <Relay.Name class="font-semibold text-foreground" />
        <Relay.Url class="text-sm text-muted-foreground" />
      </div>
      <Relay.BookmarkButton bookmarks={bookmarksWithToggle} size="lg" />
    </div>
    <Relay.Description maxLines={3} class="mt-3" />
    <Relay.BookmarkedBy bookmarks={followsBookmarks} />
  </div>
</Relay.Root>
