// @ndk-version: blocks@0.5.0
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
 * <HighlightCardElegant {ndk} {event} />
 * ```
 *
 * @example EventCard blocks:
 * ```svelte
 * <SimpleEventCard {ndk} {event} />
 * ```
 *
 * @example ThreadView blocks:
 * ```svelte
 * <script>
 *   import { createThreadView } from '@nostr-dev-kit/svelte';
 *   const thread = createThreadView(() => ({ focusedEvent: nevent }), ndk);
 * </script>
 * <ThreadViewTwitter {ndk} {thread} />
 * ```
 *
 * @example RelayCard blocks:
 * ```svelte
 * <RelayCardPortrait {ndk} relayUrl="wss://relay.damus.io" />
 * <RelayCardCompact {ndk} relayUrl="wss://relay.damus.io" />
 * <RelayCardList {ndk} relayUrl="wss://relay.damus.io" />
 * ```
 *
 * @example RepostButton blocks:
 * ```svelte
 * <RepostButton {ndk} {event} />
 * <RepostButtonPill {ndk} {event} variant="outline" />
 * ```
 *
 * @example ReactionButton blocks:
 * ```svelte
 * <ReactionButton {ndk} {event} />
 * <ReactionButton {ndk} {event} emoji="🔥" />
 * ```
 *
 * @example ReactionSlack blocks:
 * ```svelte
 * <ReactionSlack {ndk} {event} />
 * <ReactionSlack {ndk} {event} variant="vertical" />
 * <ReactionSlack {ndk} {event} showAvatars={false} />
 * ```
 *
 * @example FollowButton blocks:
 * ```svelte
 * <FollowButton {ndk} target={user} />
 * <FollowButtonPill {ndk} target={user} variant="outline" />
 * <FollowButtonCard {ndk} target={user} variant="gradient" />
 * ```
 *
 * @example MuteButton blocks:
 * ```svelte
 * <MuteButton {ndk} target={user} />
 * <MuteButton {ndk} target={user} showTarget={true} />
 * ```
 *
 * @example UserCard blocks:
 * ```svelte
 * <UserCardClassic {ndk} {pubkey} />
 * <UserCardPortrait {ndk} {pubkey} />
 * <UserCardLandscape {ndk} {pubkey} />
 * <UserCardCompact {ndk} {pubkey} />
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
export { default as HighlightCardElegant } from './highlight-card-elegant.svelte';

// EventCard blocks
export { default as SimpleEventCard } from './simple-event-card.svelte';
export { default as EventCardMenu } from './event-card-menu.svelte';

// ThreadView blocks
export { default as ThreadViewTwitter } from './thread-view-twitter.svelte';

// RelayCard blocks
export { default as RelayCardPortrait } from './relay-card-portrait.svelte';
export { default as RelayCardCompact } from './relay-card-compact.svelte';
export { default as RelayCardList } from './relay-card-list.svelte';

// RepostButton blocks
export { default as RepostButton } from './repost-button.svelte';
export { default as RepostButtonPill } from './repost-button-pill.svelte';

// ReactionButton blocks
export { default as ReactionButton } from './reaction-button.svelte';

// ReactionSlack blocks
export { default as ReactionSlack } from './reaction-slack.svelte';

// FollowButton blocks
export { default as FollowButton } from './follow-button.svelte';
export { default as FollowButtonPill } from './follow-button-pill.svelte';
export { default as FollowButtonCard } from './follow-button-card.svelte';

// MuteButton blocks
export { default as MuteButton } from './mute-button.svelte';

// UserProfile blocks
export { default as UserProfileHero } from './user-profile-hero.svelte';

// UserCard blocks
export { default as UserCardClassic } from './user-card-classic.svelte';
export { default as UserCardPortrait } from './user-card-portrait.svelte';
export { default as UserCardLandscape } from './user-card-landscape.svelte';
export { default as UserCardCompact } from './user-card-compact.svelte';
