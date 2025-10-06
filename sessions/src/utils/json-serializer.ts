import type { Hexpubkey } from "@nostr-dev-kit/ndk";
import type { SerializedSession } from "../types";

/**
 * Utility for consistent JSON serialization/deserialization across storage implementations.
 * Centralizes serialization logic to avoid duplication and ensure consistency.
 */

export interface SessionData {
    sessions: Map<Hexpubkey, SerializedSession>;
    activePubkey?: Hexpubkey;
}

/**
 * Serialize session data to JSON string
 * Adds version and timestamp metadata for future compatibility tracking
 */
export function serializeSessionData(data: SessionData): string {
    const serializable = {
        sessions: Array.from(data.sessions.entries()),
        activePubkey: data.activePubkey,
        version: 1,
        updatedAt: Date.now(),
    };
    return JSON.stringify(serializable, null, 2);
}

/**
 * Deserialize JSON string to session data
 * Handles parsing errors gracefully and ensures data integrity
 */
export function deserializeSessionData(raw: string): SessionData {
    const data = JSON.parse(raw);
    return {
        sessions: new Map(data.sessions || []),
        activePubkey: data.activePubkey,
    };
}
