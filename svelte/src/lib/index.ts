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
export type { ReactivePoolStore, RelayInfo, RelayStatus } from "./stores/pool.svelte.js";
// Store types (for typing ndk.* properties)
export type { ReactiveSessionsStore } from "./stores/sessions.svelte.js";
export type { Mint, ReactiveWalletStore } from "./stores/wallet.svelte.js";
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
export type { ProcessedZap } from "./zaps/types.js";
// WoT runes
export { createIsInWoT, createWoTDistance, createWoTScore } from "./wot-runes.svelte.js";

// ============================================================================
// Event Builders
// ============================================================================

export {
    createFetchEvent,
    type FetchEventConfig,
    type FetchEventState,
} from "./builders/event/fetch/index.svelte.js";

// ============================================================================
// Profile Builder
// ============================================================================

export {
    createProfileFetcher,
    type ProfileFetcherConfig,
    type ProfileFetcherState,
} from "./builders/profile/index.svelte.js";

// ============================================================================
// Relay Builders
// ============================================================================

export {
    createRelayInfo,
    type RelayInfoState,
} from "./builders/relay/info.svelte.js";

export type { NDKRelayInformation } from "@nostr-dev-kit/ndk";

// Utilities
export { deterministicPubkeyGradient } from "./utils/deterministic-gradient.js";
export { formatNip05 } from "./utils.js";

// Note: UI components are now available via the registry (shadcn-style)
// Users should copy components from registry/ndk/* into their projects
// This provides better customization and avoids version lock-in
