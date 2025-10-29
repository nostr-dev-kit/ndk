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

<div class="space-y-3">
  {#each followsBookmarks.relays.slice(0, 5) as relay (relay.url)}
    <RelayCard.Root {ndk} relayUrl={relay.url}>
      <div class="card-with-description">
        <div class="card-example">
          <RelayCard.Icon size={48} />
          <div class="card-content">
            <RelayCard.Name class="card-name" />
            <RelayCard.Url class="card-url" />
          </div>
          <div class="card-actions">
            <span class="percentage-badge">
              {relay.percentage.toFixed(0)}%
            </span>
            <RelayCard.BookmarkButton bookmarks={bookmarksWithToggle} />
          </div>
        </div>
        <div class="card-description">
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

<style>
  .space-y-3 > :global(* + *) {
    margin-top: 0.75rem;
  }

  :global(.card-with-description) {
    padding: 1rem;
    background: hsl(var(--color-card));
    border: 1px solid hsl(var(--color-border));
    border-radius: 0.5rem;
  }

  :global(.card-example) {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  :global(.card-content) {
    flex: 1;
  }

  :global(.card-name) {
    font-weight: 600;
    color: hsl(var(--color-foreground));
  }

  :global(.card-url) {
    font-size: 0.875rem;
    color: hsl(var(--color-muted-foreground));
  }

  :global(.card-description) {
    margin-top: 0.75rem;
  }

  :global(.card-actions) {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  :global(.percentage-badge) {
    font-size: 0.875rem;
    font-weight: 500;
    color: hsl(var(--color-primary));
  }
</style>
