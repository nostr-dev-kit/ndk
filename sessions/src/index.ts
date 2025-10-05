// Main exports
export { NDKSessionManager } from "./manager";
export type { SessionManagerOptions } from "./manager";

// Storage
export { MemoryStorage, LocalStorage, FileStorage } from "./storage";
export type { SessionStorage } from "./storage/types";

// Types
export type {
    NDKSession,
    SessionStartOptions,
    SerializedSession,
    SessionState,
    LoginOptions,
} from "./types";

// Store (for advanced usage)
export { createSessionStore } from "./store";
export type { SessionStore, SessionStoreActions } from "./store";

// Errors (for custom error handling)
export {
    SessionError,
    SignerDeserializationError,
    StorageError,
    SessionNotFoundError,
    NoActiveSessionError,
    NDKNotInitializedError,
} from "./utils/errors";

// Managers (for advanced composition)
export { AuthManager } from "./auth-manager";
export { PersistenceManager } from "./persistence-manager";
