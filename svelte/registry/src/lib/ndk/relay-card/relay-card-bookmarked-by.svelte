<!--
  @component RelayCard.BookmarkedBy
  Shows avatars of users who have bookmarked this relay.

  @example
  ```svelte
  <script>
    const bookmarks = createBookmarkedRelayList({ ndk, authors: follows });
  </script>

  <RelayCard.Root {ndk} {relayUrl}>
    <RelayCard.BookmarkedBy {bookmarks} max={5} />
  </RelayCard.Root>
  ```
-->
<script lang="ts">
  import { getContext } from 'svelte';
  import { RELAY_CARD_CONTEXT_KEY, type RelayCardContext } from './context.svelte.js';
  import type { BookmarkedRelayListState } from '@nostr-dev-kit/svelte';
  import { UserProfile } from '$lib/ndk/user-profile';
  import { cn } from '$lib/utils';

  interface Props {
    /** Bookmarked relay list state */
    bookmarks: BookmarkedRelayListState;

    /** Maximum number of avatars to show */
    max?: number;

    /** Show count label */
    showCount?: boolean;

    /** Avatar size in pixels */
    size?: number;

    /** Avatar spacing */
    spacing?: 'tight' | 'normal' | 'loose';

    /** Additional CSS classes */
    class?: string;
  }

  let {
    bookmarks,
    max = 5,
    showCount = true,
    size = 32,
    spacing = 'normal',
    class: className = ''
  }: Props = $props();

  const { ndk, relayInfo } = getContext<RelayCardContext>(RELAY_CARD_CONTEXT_KEY);

  const stats = $derived(bookmarks.getRelayStats(relayInfo.url));
  const pubkeys = $derived(stats?.pubkeys || []);
</script>

{#if pubkeys.length > 0}
  <div class={cn('relay-card-bookmarked-by', className)}>
    <UserProfile.AvatarGroup {ndk} {pubkeys} {max} {size} {spacing} />
    {#if showCount && stats}
      <span class="relay-card-bookmarked-by-count">
        {stats.count} {stats.count === 1 ? 'follow' : 'follows'}
        {#if stats.percentage > 0}
          <span class="relay-card-bookmarked-by-percentage">
            ({stats.percentage.toFixed(0)}%)
          </span>
        {/if}
      </span>
    {/if}
  </div>
{/if}

<style>
  .relay-card-bookmarked-by {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .relay-card-bookmarked-by-count {
    font-size: 0.875rem;
    color: var(--foreground, #111827);
    font-weight: 500;
  }

  .relay-card-bookmarked-by-percentage {
    color: var(--muted-foreground, #6b7280);
    font-weight: 400;
  }
</style>
