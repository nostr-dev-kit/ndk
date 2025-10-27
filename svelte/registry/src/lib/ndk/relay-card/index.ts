/**
 * RelayCard - Composable relay display components
 *
 * A flexible system for displaying relay information with NIP-11 data,
 * bookmark functionality, and follows statistics.
 *
 * @example Basic usage:
 * ```svelte
 * <RelayCard.Root {ndk} relayUrl="wss://relay.damus.io">
 *   <RelayCard.Icon />
 *   <RelayCard.Name />
 *   <RelayCard.Description />
 * </RelayCard.Root>
 * ```
 *
 * @example With bookmarks:
 * ```svelte
 * <script>
 *   const follows = Array.from(ndk.$sessions?.follows || []);
 *   const bookmarks = createBookmarkedRelayList({
 *     ndk,
 *     authors: [...follows, ndk.$currentUser.pubkey]
 *   });
 * </script>
 *
 * <RelayCard.Root {ndk} {relayUrl}>
 *   <RelayCard.Icon />
 *   <RelayCard.Name />
 *   <RelayCard.BookmarkedBy {bookmarks} />
 *   <RelayCard.BookmarkButton {bookmarks} />
 * </RelayCard.Root>
 * ```
 */

// Core components
import Root from './relay-card-root.svelte';
import Icon from './relay-card-icon.svelte';
import Name from './relay-card-name.svelte';
import Url from './relay-card-url.svelte';
import Description from './relay-card-description.svelte';
import BookmarkButton from './relay-card-bookmark-button.svelte';
import BookmarkedBy from './relay-card-bookmarked-by.svelte';

// Export as namespace for dot notation
export const RelayCard = {
  Root,
  Icon,
  Name,
  Url,
  Description,
  BookmarkButton,
  BookmarkedBy,
};

// Export types
export type { RelayCardContext } from './context.svelte.js';
