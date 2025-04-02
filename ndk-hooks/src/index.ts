/**
 * @nostr-dev-kit/ndk-hooks
 *
 * React hooks for the NDK (Nostr Development Kit)
 */
import NDK from '@nostr-dev-kit/ndk';

export * from '@nostr-dev-kit/ndk';

export default NDK;

export * from './hooks/session';

// (No NDK type exports here)

export { useMuteFilter, useMuteItem } from './hooks/mute'; // Added useMuteItem
export * from './hooks/ndk';
export * from './hooks/observer';
// Export hooks
export * from './hooks/profile';
export * from './hooks/subscribe';
export * from './hooks/useAvailableSessions';
export { useNDKNutzapMonitor, useNDKWallet } from './hooks/wallet';
// Export session management
export * from './session/index.js';
export * from './stores/ndk';
// Export stores
export * from './stores/profiles';
export * from './stores/subscribe';
