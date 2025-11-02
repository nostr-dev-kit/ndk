/**
 * Relay - Composable relay display components
 *
 * A flexible system for displaying relay information with NIP-11 data,
 * bookmark functionality, and connection status.
 *
 * The `ndk` prop is optional on Root components - if not provided, it will be retrieved from Svelte context.
 *
 * @example Basic usage (ndk from context):
 * ```svelte
 * <Relay.Root relayUrl="wss://relay.damus.io">
 *   <Relay.Icon />
 *   <Relay.Name />
 *   <Relay.Description />
 *   <Relay.ConnectionStatus showLabel />
 * </Relay.Root>
 * ```
 *
 * @example With bookmarks:
 * ```svelte
 * <script>
 *   const follows = ndk.$follows;
 *   const bookmarks = createBookmarkedRelayList(() => ({
 *     authors: [...follows, ndk.$currentUser.pubkey]
 *   }), ndk);
 * </script>
 *
 * <Relay.Root {relayUrl}>
 *   <Relay.Icon />
 *   <Relay.Name />
 *   <Relay.BookmarkedBy {bookmarks} />
 *   <Relay.BookmarkButton {bookmarks} />
 * </Relay.Root>
 * ```
 */

// Core components
import Root from './relay-root.svelte';
import Icon from './relay-icon.svelte';
import Name from './relay-name.svelte';
import Url from './relay-url.svelte';
import Description from './relay-description.svelte';
import BookmarkButton from './relay-bookmark-button.svelte';
import BookmarkedBy from './relay-bookmarked-by.svelte';
import ConnectionStatus from './relay-connection-status.svelte';
import Input from './relay-input.svelte';

// Selector primitives
import { Selector } from '../../relay-selector/index.js';

// Export as namespace for dot notation
export const Relay = {
  Root,
  Icon,
  Name,
  Url,
  Description,
  BookmarkButton,
  BookmarkedBy,
  ConnectionStatus,
  Input,
  Selector,
};

// Export types
export type { RelayContext } from './context.svelte.js';
export type { RelaySelectorContext } from '../../relay-selector/index.js';
