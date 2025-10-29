<script lang="ts">
  import { RelayCard } from '$lib/ndk/relay-card';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { BookmarkedRelayListState } from '@nostr-dev-kit/svelte';

  interface Props {
    ndk: NDKSvelte;
    followsBookmarks: BookmarkedRelayListState;
    bookmarksWithToggle: BookmarkedRelayListState;
  }

  let { ndk, followsBookmarks, bookmarksWithToggle }: Props = $props();
</script>

<div class="flex flex-col gap-3">
  {#each followsBookmarks.relays.slice(0, 5) as relay (relay.url)}
    <RelayCard.Root {ndk} relayUrl={relay.url}>
      <div class="p-4 bg-card border border-border rounded-lg">
        <div class="flex items-center gap-3">
          <RelayCard.Icon size={48} />
          <div class="flex-1">
            <RelayCard.Name class="font-semibold text-foreground" />
            <RelayCard.Url class="text-sm text-muted-foreground" />
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-primary">
              {relay.percentage.toFixed(0)}%
            </span>
            <RelayCard.BookmarkButton bookmarks={bookmarksWithToggle} />
          </div>
        </div>
        <div class="mt-3">
          <RelayCard.BookmarkedBy
            bookmarks={followsBookmarks}
            max={5}
            showCount={true}
          />
        </div>
      </div>
    </RelayCard.Root>
  {/each}
</div>
