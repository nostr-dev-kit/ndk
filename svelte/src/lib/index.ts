// Core exports

// Re-export session types from ndk-sessions
export type { LoginOptions, NDKSession, SessionStartOptions } from "@nostr-dev-kit/sessions";
export { NDKWalletStatus } from "@nostr-dev-kit/wallet";
// Re-export WoT utilities
export { createWoTComparator, filterByWoT, rankByWoT } from "@nostr-dev-kit/wot";
// Blossom
export {
    BlossomUpload,
    type UploadProgress,
    type UploadState,
    type UploadStatus,
    createBlossomUpload,
} from "./blossom-upload.svelte.js";
export {
    BlossomUrl,
    type UrlStatus,
    createBlossomUrl,
} from "./blossom-url.svelte.js";


// ============================================================================
// Core NDK Svelte
// ============================================================================

export { NDKSvelte, createNDK, type NDKSvelteWithSession } from "./ndk-svelte.svelte.js";
// Payment runes
export {
    createIsZapped,
    createPendingPayments,
    createTargetTransactions,
    createTransactions,
    createZapAmount,
    zap,
} from "./payments/runes.svelte.js";
export type {
    PendingPayment,
    Transaction,
    TransactionDirection,
    TransactionStatus,
    TransactionType,
} from "./payments/types.js";
export type { ReactivePaymentsStore } from "./stores/payments.svelte.js";
export type { ReactivePoolStore, RelayInfo, RelayStatus } from "./stores/pool.svelte.js";
// Store types (for typing ndk.* properties)
export type { ReactiveSessionsStore } from "./stores/sessions.svelte.js";
export type { Mint, ReactiveWalletStore, Transaction } from "./stores/wallet.svelte.js";
export type { ReactiveWoTStore, WoTFilterOptions, WoTLoadOptions, WoTRankOptions } from "./stores/wot.svelte.js";
export type { SubscribeConfig, Subscription, SyncSubscribeConfig } from "./subscribe.svelte.js";
// Subscription - can be used as standalone function or via ndk.$subscribe()
export { createSubscription, createSyncSubscription } from "./subscribe.svelte.js";
// Event fetching - can be used as standalone function or via ndk.$fetchEvents()
export { createFetchEvents, type FetchEventsConfig, type FetchEventOptions } from "./event.svelte.js";
// User helpers
export { createFetchUser, createZapInfo, type ZapInfo } from "./user.svelte.js";
// Zap utilities and subscriptions
export {
    createZapSubscription,
    getZapAmount,
    getZapComment,
    getZapMethod,
    getZapSender,
    hasZappedBy,
    validateNip57Zap,
    validateNip61Zap,
    validateZap,
    type ZapConfig,
    type ZapMethod,
    type ZapSubscription,
} from "./zaps.svelte.js";
// WoT runes
export { createIsInWoT, createWoTDistance, createWoTScore } from "./wot-runes.svelte.js";

// ============================================================================
// Thread Builder
// ============================================================================

export {
    createThreadView,
    type ThreadView,
    type ThreadNode,
    type CreateThreadViewOptions,
    type ThreadingMetadata
} from "./builders/event/thread/index.svelte.js";

// ============================================================================
// Event Content Rendering Builders
// ============================================================================

export {
    createEventContent,
    createEmbeddedEvent,
    type CreateEmbeddedEventProps,
    type CreateEventContentProps,
    type EmbeddedEventState,
    type EventContentState,
} from "./builders/event-content/index.svelte.js";

// ============================================================================
// Profile Builder
// ============================================================================

export {
    createProfileFetcher,
    type CreateProfileFetcherProps,
    type ProfileFetcherState,
} from "./builders/profile/index.svelte.js";

// ============================================================================
// Relay Builders
// ============================================================================

export {
    createRelayInfo,
    type RelayInfoState,
    type RelayNIP11Info,
} from "./builders/relay/info.svelte.js";

export {
    createBookmarkedRelayList,
    type BookmarkedRelayListState,
    type BookmarkedRelayWithStats,
} from "./builders/relay/bookmarks.svelte.js";

// ============================================================================
// Action Builders
// ============================================================================

export {
    createFollowAction,
    createReactionAction,
    createReplyAction,
    createRepostAction,
    createMuteAction,
    createZapAction,
    type FollowActionConfig,
    type ReactionActionConfig,
    type ReplyActionConfig,
    type RepostActionConfig,
    type MuteActionConfig,
    type ZapActionConfig,
    type EmojiReaction,
    type ReplyStats,
    type RepostStats,
    type ZapStats,
} from "./builders/actions/index.js";

// Content parsing utilities
export {
    buildEmojiMap,
    classifyMatch,
    collectMatches,
    createEmojiSegment,
    decodeNostrUri,
    extractYouTubeId,
    groupConsecutiveImages,
    isImage,
    isVideo,
    isYouTube,
    parseContentToSegments,
    PATTERNS,
    type ParsedSegment,
} from "./builders/event-content/utils.js";

// Note: UI components are now available via the registry (shadcn-style)
// Users should copy components from registry/ndk/* into their projects
// This provides better customization and avoids version lock-in
