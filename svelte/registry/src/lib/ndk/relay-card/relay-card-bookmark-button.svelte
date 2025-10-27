<!--
  @component RelayCard.BookmarkButton
  Toggle button to bookmark/unbookmark relay (requires bookmarks prop with includesCurrentUser=true).

  @example
  ```svelte
  <script>
    const bookmarks = createBookmarkedRelayList({
      ndk,
      authors: [...follows, ndk.$currentUser.pubkey]
    });
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

  const { relayInfo } = getContext<RelayCardContext>(RELAY_CARD_CONTEXT_KEY);

  const isBookmarked = $derived(bookmarks.isBookmarked(relayInfo.url));
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
      await bookmarks.toggleBookmark(relayInfo.url);
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
    <svg class="relay-card-bookmark-spinner" viewBox="0 0 24 24" fill="none">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  {:else if isBookmarked}
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  {:else}
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  {/if}
</button>

<style>
  .relay-card-bookmark-button {
    padding: 0.5rem;
    border-radius: 0.5rem;
    border: none;
    background: transparent;
    color: var(--muted-foreground, #6b7280);
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .relay-card-bookmark-button:hover:not(:disabled) {
    background: var(--muted, #f3f4f6);
    color: var(--primary, #8b5cf6);
  }

  .relay-card-bookmark-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .relay-card-bookmark-button--bookmarked {
    color: var(--primary, #8b5cf6);
  }

  .relay-card-bookmark-button--sm svg {
    width: 1rem;
    height: 1rem;
  }

  .relay-card-bookmark-button--md svg {
    width: 1.25rem;
    height: 1.25rem;
  }

  .relay-card-bookmark-button--lg svg {
    width: 1.5rem;
    height: 1.5rem;
  }

  .relay-card-bookmark-spinner {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>
