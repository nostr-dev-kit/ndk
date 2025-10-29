// @ndk-version: blocks@0.0.0
/**
 * Block Components - Preset layouts for NDK components
 *
 * Blocks are pre-composed layouts that combine UI components
 * into complete, ready-to-use designs.
 *
 * @example ArticleCard blocks:
 * ```svelte
 * <ArticleCardPortrait {ndk} {article} />
 * <ArticleCardMedium {ndk} {article} imageSize="large" />
 * <ArticleCardHero {ndk} {article} />
 * <ArticleCardNeon {ndk} {article} />
 * ```
 *
 * @example HighlightCard blocks:
 * ```svelte
 * <HighlightCardFeed {ndk} {event} />
 * <HighlightCardCompact {ndk} {event} />
 * <HighlightCardGrid {ndk} {event} />
 * ```
 *
 * @example EventCard blocks:
 * ```svelte
 * <SimpleEventCard {ndk} {event} />
 * ```
 *
 * @example RelayCard blocks:
 * ```svelte
 * <RelayCardPortrait {ndk} relayUrl="wss://relay.damus.io" />
 * <RelayCardCompact {ndk} relayUrl="wss://relay.damus.io" />
 * <RelayCardList {ndk} relayUrl="wss://relay.damus.io" />
 * ```
 */

// ArticleCard blocks
export { default as ArticleCardPortrait } from './article-card-portrait.svelte';
export { default as ArticleCardMedium } from './article-card-medium.svelte';
export { default as ArticleCardHero } from './article-card-hero.svelte';
export { default as ArticleCardNeon } from './article-card-neon.svelte';

// HighlightCard blocks
export { default as HighlightCardFeed } from './highlight-card-feed.svelte';
export { default as HighlightCardCompact } from './highlight-card-compact.svelte';
export { default as HighlightCardGrid } from './highlight-card-grid.svelte';

// EventCard blocks
export { default as SimpleEventCard } from './simple-event-card.svelte';

// RelayCard blocks
export { default as RelayCardPortrait } from './relay-card-portrait.svelte';
export { default as RelayCardCompact } from './relay-card-compact.svelte';
export { default as RelayCardList } from './relay-card-list.svelte';
