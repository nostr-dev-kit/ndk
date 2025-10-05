// Core exports
export { NDKSvelte } from "./ndk-svelte.svelte.js";
export { createNDK, type CreateNDKOptions } from "./ndk.svelte.js";

// Subscription
export { createSubscription } from "./subscribe.svelte.js";
export type { Subscription, SubscribeOptions } from "./subscribe.svelte.js";

// Store types (for typing ndk.* properties)
export type { ReactiveSessionsStore } from "./stores/sessions.svelte.js";
export type { ReactiveWoTStore } from "./stores/wot.svelte.js";
export type { ReactiveWalletStore } from "./stores/wallet.svelte.js";
export type { ReactivePaymentsStore } from "./stores/payments.svelte.js";
export type { ReactivePoolStore, RelayInfo, RelayStatus } from "./stores/pool.svelte.js";

// Blossom
export {
    BlossomUpload,
    useBlossomUpload,
    type UploadStatus,
    type UploadProgress,
    type UploadState,
} from "./blossom-upload.svelte.js";
export {
    BlossomUrl,
    useBlossomUrl,
    type UrlStatus,
} from "./blossom-url.svelte.js";

// User helpers
export { useUser, type User } from "./user.svelte.js";

// Components
export { default as Avatar } from "./components/Avatar.svelte";
export { default as BlossomImage } from "./components/BlossomImage.svelte";

// Payment runes
export {
    useZapAmount,
    useIsZapped,
    useTargetTransactions,
    usePendingPayments,
    useTransactions,
    zap,
} from "./payments/runes.svelte.js";
export type {
    Transaction,
    PendingPayment,
    TransactionType,
    TransactionStatus,
    TransactionDirection,
} from "./payments/types.js";

// WoT runes
export { useWoTScore, useWoTDistance, useIsInWoT } from "./wot-runes.svelte.js";
export type { WoTFilterOptions, WoTRankOptions, WoTLoadOptions } from "./stores/wot.svelte.js";

// Re-export WoT utilities
export { filterByWoT, rankByWoT, createWoTComparator } from "@nostr-dev-kit/ndk-wot";

// Re-export session types from ndk-sessions
export type { NDKSession, LoginOptions, SessionStartOptions } from "@nostr-dev-kit/sessions";

// Constants
export const DEFAULT_BUFFER_MS = 30;
export const POST_EOSE_BUFFER_MS = 16;
export const EOSE_TIMEOUT_MS = 5000;
export const DEFAULT_PROFILE_TIMEOUT = 5000;
export const MAX_REF_COUNT = 1000;
