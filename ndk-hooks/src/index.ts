/**
 * @nostr-dev-kit/ndk-hooks
 *
 * React hooks for NDK.
 */
import NDK from "@nostr-dev-kit/ndk";

export * from "@nostr-dev-kit/ndk";

export default NDK;

export * from "./session/hooks";
export * from "./session/hooks/signers";
export * from "./session/hooks/sessions";
export * from "./session/hooks/control";
// Only export the session store types, not the implementation
export type { NDKSessionsState, NDKUserSession, SessionStartOptions } from "./session/store/types";
export * from "./ndk/hooks";
export * from "./ndk/store";
export * from "./profiles/hooks";
export * from "./profiles/store";
export * from "./mutes/hooks";

// Common/Utility hooks and stores (adjust paths as needed if these are further organized)
export * from "./observer/hooks";
export * from "./subscribe/hooks";
export * from "./session/hooks/use-available-sessions";
export { useNDKNutzapMonitor, useNDKWallet } from "./wallet/hooks";
export * from "./subscribe/store";
