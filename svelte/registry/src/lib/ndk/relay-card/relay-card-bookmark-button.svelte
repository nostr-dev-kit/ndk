<!--
  @component RelayCard.BookmarkButton
  Toggle button to bookmark/unbookmark relay (requires bookmarks prop with includesCurrentUser=true).

  @example
  ```svelte
  <script>
    const bookmarks = createBookmarkedRelayList(() => ({
      authors: [...follows, ndk.$currentUser.pubkey]
    }), ndk);
  </script>

  <RelayCard.Root {ndk} {relayUrl}>
    <RelayCard.BookmarkButton {bookmarks} />
  </RelayCard.Root>
  ```
-->
<script lang="ts">
  import { getContext } from 'svelte';
  import { RELAY_CARD_CONTEXT_KEY, type RelayCardContext } from './context.svelte.js';
  import type { BookmarkedRelayListState } from '@nostr-dev-kit/svelte';
  import { cn } from '$lib/utils';
  import LoadingIcon from '../icons/loading.svelte';
  import BookmarkIcon from '../icons/bookmark.svelte';

  interface Props {
    /** Bookmarked relay list state (must include current user) */
    bookmarks: BookmarkedRelayListState;

    /** Button size */
    size?: 'sm' | 'md' | 'lg';

    /** Additional CSS classes */
    class?: string;
  }

  let {
    bookmarks,
    size = 'md',
    class: className = ''
  }: Props = $props();

  const context = getContext<RelayCardContext>(RELAY_CARD_CONTEXT_KEY);
  if (!context) {
    throw new Error('RelayCard.BookmarkButton must be used within RelayCard.Root');
  }

  const isBookmarked = $derived(bookmarks.isBookmarked(context.relayInfo.url));
  const canToggle = $derived(bookmarks.includesCurrentUser);

  let isLoading = $state(false);

  async function handleToggle(e: MouseEvent) {
    e.stopPropagation();

    if (!canToggle) {
      console.warn('Cannot toggle bookmark: current user not in authors list');
      return;
    }

    isLoading = true;
    try {
      await bookmarks.toggleBookmark(context.relayInfo.url);
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
    } finally {
      isLoading = false;
    }
  }
</script>

<button
  onclick={handleToggle}
  disabled={!canToggle || isLoading}
  class={cn(
    'relay-card-bookmark-button',
    `relay-card-bookmark-button--${size}`,
    isBookmarked && 'relay-card-bookmark-button--bookmarked',
    className
  )}
  title={isBookmarked ? 'Remove bookmark' : 'Bookmark relay'}
  aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark relay'}
>
  {#if isLoading}
    <LoadingIcon class="relay-card-bookmark-spinner" />
  {:else}
    <BookmarkIcon filled={isBookmarked} />
  {/if}
</button>

<style>
  .relay-card-bookmark-button {
    padding: 0.5rem;
    border-radius: 0.5rem;
    border: none;
    background: transparent;
    color: var(--muted-foreground);
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .relay-card-bookmark-button:hover:not(:disabled) {
    background: var(--muted);
    color: var(--primary);
  }

  .relay-card-bookmark-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .relay-card-bookmark-button--bookmarked {
    color: var(--primary);
  }

  .relay-card-bookmark-button--sm i {
    font-size: 1rem;
  }

  .relay-card-bookmark-button--md i {
    font-size: 1.25rem;
  }

  .relay-card-bookmark-button--lg i {
    font-size: 1.5rem;
  }

  .relay-card-bookmark-spinner {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>
