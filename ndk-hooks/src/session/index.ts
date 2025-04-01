// index.ts - Public exports for the NDK session management module

// Export the main Zustand store hook
export { useNDKSessions, useSession, useActiveSessionData } from "./store.js";

// Export core types
export type {
    SessionState,
    UserSessionData,
    SessionInitOptions,
} from "./types.js";

// Export utility functions if needed (optional)
export { processMuteList } from "./utils.js";