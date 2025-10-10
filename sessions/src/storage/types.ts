import type { Hexpubkey } from "@nostr-dev-kit/ndk";
import type { SerializedSession } from "../types";
import type { SessionData } from "../utils/json-serializer";

/**
 * Storage interface for persisting sessions
 */
export interface SessionStorage {
    /**
     * Save sessions to storage
     */
    save(sessions: Map<Hexpubkey, SerializedSession>, activePubkey?: Hexpubkey): Promise<void>;

    /**
     * Load sessions from storage
     */
    load(): Promise<SessionData>;

    /**
     * Clear all sessions from storage
     */
    clear(): Promise<void>;
}
