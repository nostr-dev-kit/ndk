<!--
  @component Relay.BookmarkedBy
  Headless component that exposes bookmark data via snippet.

  @example
  ```svelte
<script>
    const bookmarks = createBookmarkedRelayList(() => ({ authors: follows }), ndk);
  </script>

  <Relay.Root {ndk} {relayUrl}>
    <Relay.BookmarkedBy {bookmarks}>
      {#snippet children({ pubkeys, count })}
        <div class="flex items-center gap-2">
          <AvatarGroup {pubkeys} max={5} />
          <span>{count} bookmarks</span>
        </div>
      {/snippet}
    </Relay.BookmarkedBy>
  </Relay.Root>
  ```
-->
<script lang="ts">
  import { getContext } from 'svelte';
  import { RELAY_CONTEXT_KEY, type RelayContext } from './relay.context.js';
  import type { BookmarkedRelayListState } from '@nostr-dev-kit/svelte';
  import type { Snippet } from 'svelte';

  interface Props {
    /** Bookmarked relay list state */
    bookmarks: BookmarkedRelayListState;

    /** Child snippet with bookmark data */
    children: Snippet<[{ pubkeys: string[]; count: number }]>;
  }

  let { bookmarks, children }: Props = $props();

  const context = getContext<RelayContext>(RELAY_CONTEXT_KEY);
  if (!context) {
    throw new Error('Relay.BookmarkedBy must be used within Relay.Root');
  }

  const stats = $derived(bookmarks.getRelayStats(context.relayInfo.url));
  const pubkeys = $derived(stats?.pubkeys || []);
  const count = $derived(stats?.count || 0);
</script>

{#if pubkeys.length > 0}
  {@render children({ pubkeys, count })}
{/if}
