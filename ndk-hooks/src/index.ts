/**
 * @nostr-dev-kit/ndk-hooks
 *
 * React hooks for NDK.
 */
import NDK from "@nostr-dev-kit/ndk";

export * from "@nostr-dev-kit/ndk";

export default NDK;

// Feature-specific exports
export * from "./session/hooks"; // Session hooks (useCurrentUserProfile, useFollows, useMuteList, useNDKSessionEvent)
export * from "./session/store"; // Session store (useNDKSessions)
export * from "./ndk/hooks"; // NDK core hooks (useNDK, useNDKCurrentUser, useNDKUnpublishedEvents, useNDKInit)
export * from "./ndk/store"; // NDK store (useNDKStore) - Assuming this exists or will be created
export * from "./profiles/hooks"; // Profile hooks (useProfile)
export * from "./profiles/store"; // Profile store (useUserProfilesStore) - Assuming this exists or will be created

// Common/Utility hooks and stores (adjust paths as needed if these are further organized)
export { useMuteFilter, useMuteItem } from "./common/hooks/mute";
export * from "./observer/hooks"; // Updated path
export * from "./subscribe/hooks"; // Updated path
export * from "./session/hooks/use-available-sessions"; // Corrected path
export { useNDKNutzapMonitor, useNDKWallet } from "./wallet/hooks"; // Corrected path
export * from "./subscribe/store"; // Subscribe store

// Re-exporting from session/index.js might be redundant now
// export * from './session/index.js';
// Removed duplicate export of './stores/sessions' - useNDKSessions is exported via './session/store'
export type { NDKSessionsState } from "./session/store/index"; // Export main state type from new location
export type { NDKUserSession } from "./session/store/types"; // Export session type from new location
export type { SessionStartOptions } from "./session/store/types"; // Export session options type (Renamed)
