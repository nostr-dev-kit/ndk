/**
 * @nostr-dev-kit/ndk-hooks
 * 
 * React hooks for the NDK (Nostr Development Kit)
 */
import NDK from "@nostr-dev-kit/ndk";
export * from "@nostr-dev-kit/ndk";

export default NDK;

export * from './hooks/session';
// (No NDK type exports here)

// Export hooks
export * from './hooks/profile';
export * from './hooks/observer';
export { useNDKWallet, useNDKNutzapMonitor } from "./hooks/wallet";

export * from './hooks/ndk';
export * from './hooks/subscribe';
export * from './hooks/useAvailableSessions';
export { useMuteFilter, useMuteItem } from './hooks/mute'; // Added useMuteItem

// Export stores
export * from './stores/profiles';
export * from './stores/ndk';
export * from './stores/subscribe';

// Export session management
export * from './session/index.js';
