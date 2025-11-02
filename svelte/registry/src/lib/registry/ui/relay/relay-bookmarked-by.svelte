<!--
  @component Relay.BookmarkedBy
  Shows avatars of users who have bookmarked this relay.

  @example
  ```svelte
  <script>
    const bookmarks = createBookmarkedRelayList(() => ({ authors: follows }), ndk);
  </script>

  <Relay.Root {ndk} {relayUrl}>
    <Relay.BookmarkedBy {bookmarks} max={5} />
  </Relay.Root>
  ```
-->
<script lang="ts">
  import { getContext } from 'svelte';
  import { RELAY_CONTEXT_KEY, type RelayContext } from './context.svelte.js';
  import type { BookmarkedRelayListState } from '@nostr-dev-kit/svelte';
  import { AvatarGroup } from '../avatar-group';
  import { cn } from '../../../utils.js';

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

  const context = getContext<RelayContext>(RELAY_CONTEXT_KEY);
  if (!context) {
    throw new Error('Relay.BookmarkedBy must be used within Relay.Root');
  }

  const stats = $derived(bookmarks.getRelayStats(context.relayInfo.url));
  const pubkeys = $derived(stats?.pubkeys || []);
</script>

{#if pubkeys.length > 0}
  <div class={cn('flex items-center gap-3', className)}>
    <AvatarGroup ndk={context.ndk} {pubkeys} {max} {size} {spacing} />
    {#if showCount && stats}
      <span class="text-sm text-muted-foreground">
        {stats.count} {stats.count === 1 ? 'follow' : 'follows'}
      </span>
    {/if}
  </div>
{/if}
