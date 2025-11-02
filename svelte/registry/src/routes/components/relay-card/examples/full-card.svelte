<script lang="ts">
  import { Relay } from '$lib/registry/ui/relay';
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
    <Relay.BookmarkedBy bookmarks={followsBookmarks}>
      {#snippet children({ pubkeys, count })}
        <div class="flex items-center gap-3 mt-3">
          <div class="flex -space-x-2">
            {#each pubkeys.slice(0, 5) as pubkey}
              <img
                src="https://api.dicebear.com/7.x/identicon/svg?seed={pubkey}"
                alt="Avatar"
                class="w-8 h-8 rounded-full border-2 border-background"
              />
            {/each}
          </div>
          <span class="text-sm text-muted-foreground">
            {count} {count === 1 ? 'follow' : 'follows'}
          </span>
        </div>
      {/snippet}
    </Relay.BookmarkedBy>
  </div>
</Relay.Root>
