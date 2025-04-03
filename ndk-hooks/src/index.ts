/**
 * @nostr-dev-kit/ndk-hooks
 *
 * React hooks for NDK.
 */
import NDK from '@nostr-dev-kit/ndk';

export * from '@nostr-dev-kit/ndk';

export default NDK;

export * from './hooks/session';

export { useMuteFilter, useMuteItem } from './hooks/mute';
export * from './hooks/ndk';
export * from './hooks/observer';
export * from './hooks/profile';
export * from './hooks/subscribe';
export * from './hooks/useAvailableSessions';
export { useNDKNutzapMonitor, useNDKWallet } from './hooks/wallet';
export * from './session/index.js';
export * from './stores/ndk';
export * from './stores/profiles';
export * from './stores/subscribe';
// Removed duplicate export of './stores/sessions' - useNDKSessions is exported via './hooks/session'
export type { NDKSessionsState } from './stores/sessions/index'; // Export main state type
export type { NDKUserSession } from './stores/sessions/types'; // Export session type
