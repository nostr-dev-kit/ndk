// @ndk-version: highlight-card@0.7.0
/**
 * HighlightCard components for displaying Nostr highlight events (kind 9802)
 *
 * The `ndk` prop is optional on Root components - if not provided, it will be retrieved from Svelte context.
 *
 * @example Using preset blocks (import separately from blocks)
 * ```svelte
 * <script>
 *   import { HighlightCardFeed, HighlightCardCompact } from '../blocks';
 * </script>
 *
 * <HighlightCardFeed {ndk} event={highlightEvent} />
 * <HighlightCardCompact {ndk} event={highlightEvent} />
 * <HighlightCardGrid {ndk} event={highlightEvent} />
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

export const HighlightCard = {
  Root,
  Content,
  Source,
};

export { Root, Content, Source };
