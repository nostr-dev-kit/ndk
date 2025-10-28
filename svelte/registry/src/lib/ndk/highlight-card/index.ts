/**
 * HighlightCard components for displaying Nostr highlight events (kind 9802)
 *
 * @example Basic usage
 * ```svelte
 * <script>
 *   import { HighlightCard } from '$lib/ndk/highlight-card';
 * </script>
 *
 * <!-- Feed variant -->
 * <HighlightCard.Feed {ndk} event={highlightEvent} />
 *
 * <!-- Compact variant -->
 * <HighlightCard.Compact {ndk} event={highlightEvent} />
 *
 * <!-- Grid variant -->
 * <HighlightCard.Grid {ndk} event={highlightEvent} />
 * ```
 *
 * @example Custom composition
 * ```svelte
 * <HighlightCard.Root {ndk} {event} variant="feed">
 *   <HighlightCard.Content />
 *   <HighlightCard.Source />
 * </HighlightCard.Root>
 * ```
 */

import Root from './highlight-card-root.svelte';
import Content from './highlight-card-content.svelte';
import Source from './highlight-card-source.svelte';
import Feed from './highlight-card-feed.svelte';
import Compact from './highlight-card-compact.svelte';
import Grid from './highlight-card-grid.svelte';

export const HighlightCard = {
  Root,
  Content,
  Source,
  Feed,
  Compact,
  Grid,
};

export { Root, Content, Source, Feed, Compact, Grid };
