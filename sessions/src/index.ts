// Main exports

// Managers (for advanced composition)
export { AuthManager } from "./auth-manager";
export type { SessionManagerOptions } from "./manager";
export { NDKSessionManager } from "./manager";
export { PersistenceManager } from "./persistence-manager";
// Storage
export { FileStorage, LocalStorage, MemoryStorage } from "./storage";
export type { SessionStorage } from "./storage/types";
export type { SessionStore, SessionStoreActions } from "./store";
// Store (for advanced usage)
export { createSessionStore } from "./store";
// Types
export type {
    LoginOptions,
    MonitorItem,
    NDKEventConstructor,
    NDKSession,
    SerializedSession,
    SessionPreferences,
    SessionStartOptions,
    SessionState,
} from "./types";
// Errors (for custom error handling)
export {
    NDKNotInitializedError,
    NoActiveSessionError,
    SessionError,
    SessionNotFoundError,
    SignerDeserializationError,
    StorageError,
} from "./utils/errors";
