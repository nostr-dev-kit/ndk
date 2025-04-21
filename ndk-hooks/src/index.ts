/**
 * @nostr-dev-kit/ndk-hooks
 *
 * React hooks for NDK.
 */
import NDK from "@nostr-dev-kit/ndk";

export * from "@nostr-dev-kit/ndk";

export default NDK;

export * from "./session/hooks/index.js";
export * from "./session/hooks/signers.js";
export * from "./session/hooks/sessions.js";
export * from "./session/hooks/control.js";
export * from "./session/hooks/use-ndk-session-monitor.js";
export * from "./session/storage/index.js";
// Only export the session store types, not the implementation
export type { NDKSessionsState, NDKUserSession, SessionStartOptions } from "./session/store/types.js";
export * from "./ndk/hooks";
export * from "./ndk/store";
export * from "./profiles/hooks";
export * from "./profiles/store";
export * from "./mutes/hooks";

// Common/Utility hooks and stores (adjust paths as needed if these are further organized)
export * from "./observer/hooks";
export * from "./subscribe/hooks";
export * from "./session/hooks/use-available-sessions";
export * from "./subscribe/store";
