// Core exports

// ============================================================================
// External Package Re-exports
// ============================================================================
export type {
  LoginOptions,
  NDKSession,
  SessionStartOptions,
} from "@nostr-dev-kit/sessions";
export {
  NDKWalletStatus,
  type NDKWalletTransaction,
} from "@nostr-dev-kit/wallet";
export {
  createWoTComparator,
  filterByWoT,
  rankByWoT,
} from "@nostr-dev-kit/wot";
export type { NDKRelayInformation } from "@nostr-dev-kit/ndk";

// ============================================================================
// Core NDK Svelte
// ============================================================================
export {
  NDKSvelte,
  createNDK,
  type NDKSvelteWithSession,
} from "./ndk-svelte.svelte.js";

// ============================================================================
// Stores
// ============================================================================
export type {
  ReactivePoolStore,
  RelayInfo,
  RelayStatus,
} from "./stores/pool.svelte.js";
export type { ReactiveSessionsStore } from "./stores/sessions.svelte.js";
export type { Mint, ReactiveWalletStore } from "./stores/wallet.svelte.js";
export type {
  ReactiveWoTStore,
  WoTFilterOptions,
  WoTLoadOptions,
  WoTRankOptions,
} from "./stores/wot.svelte.js";

// ============================================================================
// Builders (all create* functions)
// ============================================================================

// Subscriptions
export type {
  SubscribeConfig,
  Subscription,
  SyncSubscribeConfig,
} from "./builders/subscription.svelte.js";
export {
  createSubscription,
  createSyncSubscription,
} from "./builders/subscription.svelte.js";
export type {
  MetaSubscribeConfig,
  MetaSubscription,
  MetaSubscribeSortOption,
} from "./builders/meta-subscription.svelte.js";
export { createMetaSubscription } from "./builders/meta-subscription.svelte.js";

// Event fetching
export {
  createFetchEvent,
  type FetchEventConfig,
  type FetchEventState,
} from "./builders/fetch-event.svelte.js";
export {
  createFetchEvents,
  type FetchEventsConfig,
} from "./builders/fetch-events.svelte.js";

// User helpers
export {
  createFetchUser,
  createZapInfo,
  type ZapInfo,
  type FetchUserResult,
} from "./builders/user.svelte.js";

// Zap subscription
export {
  createZapSubscription,
  type ZapConfig,
  type ZapSubscription,
} from "./builders/zap-subscription.svelte.js";

// Web of Trust (WoT)
export {
  createIsInWoT,
  createWoTDistance,
  createWoTScore,
} from "./builders/wot.svelte.js";

// Blossom media uploads
export {
  BlossomUpload,
  type UploadProgress,
  type UploadState,
  type UploadStatus,
  createBlossomUpload,
} from "./builders/blossom-upload.svelte.js";
export {
  BlossomUrl,
  type UrlStatus,
  createBlossomUrl,
} from "./builders/blossom-url.svelte.js";

// Relay info
export {
  createRelayInfo,
  type RelayInfoState,
} from "./builders/relay-info.svelte.js";

// ============================================================================
// Zap Utilities (non-create* functions)
// ============================================================================
export {
  getZapAmount,
  getZapSender,
  getZapComment,
  getZapMethod,
  hasZappedBy,
  type ZapMethod,
} from "./zaps/utils.js";
export {
  validateNip57Zap,
  validateNip61Zap,
  validateZap,
} from "./zaps/validation.js";
export type { ProcessedZap } from "./zaps/types.js";

// ============================================================================
// Utilities
// ============================================================================
export { deterministicPubkeyGradient } from "./utils/deterministic-gradient.js";
export * from "./ui-utils/index.js";

// Note: UI components are now available via the registry (shadcn-style)
// Users should copy components from registry/ndk/* into their projects
// This provides better customization and avoids version lock-in
