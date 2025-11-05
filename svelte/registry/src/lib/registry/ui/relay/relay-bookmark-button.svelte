<!--
  @component Relay.BookmarkButton
  Headless bookmark toggle button (requires bookmarks prop with includesCurrentUser=true).

  @example Basic usage:
  ```svelte
<script>
    const bookmarks = createBookmarkedRelayList(() => ({
      authors: [...follows, ndk.$currentUser.pubkey]
    }), ndk);
  </script>

  <Relay.Root {ndk} {relayUrl}>
    <Relay.BookmarkButton {bookmarks} />
  </Relay.Root>
  ```

  @example Custom button:
  ```svelte
  <Relay.BookmarkButton {bookmarks}>
    {#snippet child({ props, isBookmarked })}
      <button {...props} class="custom-bookmark-btn">
        {isBookmarked ? 'Bookmarked' : 'Bookmark'}
      </button>
    {/snippet}
  </Relay.BookmarkButton>
  ```
-->
<script lang="ts">
  import { getContext } from 'svelte';
  import { RELAY_CONTEXT_KEY, type RelayContext } from './relay.context.js';
  import type { BookmarkedRelayListState } from '@nostr-dev-kit/svelte';
  import type { Snippet } from 'svelte';
  import { mergeProps } from '../../utils/merge-props.js';

  interface BookmarkSnippetProps {
    isBookmarked: boolean;
    canToggle: boolean;
  }

  interface Props {
    /** Bookmarked relay list state (must include current user) */
    bookmarks: BookmarkedRelayListState;

    /** Additional CSS classes */
    class?: string;

    /** Child snippet for custom element rendering */
    child?: Snippet<[{ props: any } & BookmarkSnippetProps]>;

    /** Content snippet for custom content */
    children?: Snippet<[BookmarkSnippetProps]>;
  }

  let {
    bookmarks,
    class: className = '',
    child,
    children,
    ...restProps
  }: Props = $props();

  const context = getContext<RelayContext>(RELAY_CONTEXT_KEY);
  if (!context) {
    throw new Error('Relay.BookmarkButton must be used within Relay.Root');
  }

  const isBookmarked = $derived(bookmarks.isBookmarked(context.relayInfo.url));
  const canToggle = $derived(bookmarks.includesCurrentUser);

  async function handleToggle(e: MouseEvent) {
    e.stopPropagation();

    if (!canToggle) {
      console.warn('Cannot toggle bookmark: current user not in authors list');
      return;
    }

    try {
      await bookmarks.toggleBookmark(context.relayInfo.url);
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
    }
  }

  const mergedProps = $derived(mergeProps(restProps, {
    onclick: handleToggle,
    disabled: !canToggle,
    'aria-label': isBookmarked ? 'Remove bookmark' : 'Bookmark relay',
    title: isBookmarked ? 'Remove bookmark' : 'Bookmark relay',
    class: className
  }));

  const snippetProps = $derived({ isBookmarked, canToggle });
</script>

{#if child}
  {@render child({ props: mergedProps, ...snippetProps })}
{:else}
  <button {...mergedProps}>
    {#if children}
      {@render children(snippetProps)}
    {:else}
      {isBookmarked ? '★' : '☆'}
    {/if}
  </button>
{/if}
