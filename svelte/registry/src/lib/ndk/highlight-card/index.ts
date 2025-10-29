/**
 * HighlightCard components for displaying Nostr highlight events (kind 9802)
 *
 * The `ndk` prop is optional on Root components - if not provided, it will be retrieved from Svelte context.
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
 * @example Custom composition (ndk from context)
 * ```svelte
 * <HighlightCard.Root {event} variant="feed">
 *   <HighlightCard.Content />
 *   <HighlightCard.Source />
 * </HighlightCard.Root>
 * ```
 */

import Root from './highlight-card-root.svelte';
import Content from './highlight-card-content.svelte';
import Source from './highlight-card-source.svelte';
import Feed from '../blocks/highlight-card-feed.svelte';
import Compact from '../blocks/highlight-card-compact.svelte';
import Grid from '../blocks/highlight-card-grid.svelte';

export const HighlightCard = {
  Root,
  Content,
  Source,
  Feed,
  Compact,
  Grid,
};

export { Root, Content, Source, Feed, Compact, Grid };
