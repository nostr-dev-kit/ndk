<script lang="ts">
  import { RelayCard } from '$lib/ndk/relay-card';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { BookmarkedRelayListState } from '@nostr-dev-kit/svelte';

  interface Props {
    ndk: NDKSvelte;
    relayUrl: string;
    bookmarksWithToggle: BookmarkedRelayListState;
  }

  let { ndk, relayUrl, bookmarksWithToggle }: Props = $props();
</script>

<RelayCard.Root {ndk} {relayUrl}>
  <div class="card-with-description">
    <div class="card-example">
      <RelayCard.Icon size={48} />
      <div class="card-content">
        <RelayCard.Name class="card-name" />
        <RelayCard.Url class="card-url" />
      </div>
      <RelayCard.BookmarkButton bookmarks={bookmarksWithToggle} />
    </div>
    <div class="card-description">
      <RelayCard.Description maxLines={2} />
    </div>
  </div>
</RelayCard.Root>

<style>
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
</style>
