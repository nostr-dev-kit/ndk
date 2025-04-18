/**
 * @nostr-dev-kit/ndk-hooks
 *
 * React hooks for NDK.
 */
import NDK from "@nostr-dev-kit/ndk";

export * from "@nostr-dev-kit/ndk";

export default NDK;

export * from "./session/hooks";
export * from "./session/store";
export * from "./ndk/hooks";
export * from "./ndk/store";
export * from "./profiles/hooks";
export * from "./profiles/store";

// Common/Utility hooks and stores (adjust paths as needed if these are further organized)
export { useMuteFilter, useMuteItem } from "./common/hooks/mute";
export * from "./observer/hooks";
export * from "./subscribe/hooks";
export * from "./session/hooks/use-available-sessions";
export { useNDKNutzapMonitor, useNDKWallet } from "./wallet/hooks";
export * from "./subscribe/store";

export type { NDKSessionsState } from "./session/store/index";
export type { NDKUserSession } from "./session/store/types";
export type { SessionStartOptions } from "./session/store/types";
