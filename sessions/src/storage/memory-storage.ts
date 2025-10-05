import type { Hexpubkey } from "@nostr-dev-kit/ndk";
import type { SerializedSession } from "../types";
import type { SessionStorage } from "./types";

/**
 * In-memory storage implementation
 * Useful for testing or when persistence is not needed
 */
export class MemoryStorage implements SessionStorage {
    private data: {
        sessions: Map<Hexpubkey, SerializedSession>;
        activePubkey?: Hexpubkey;
    } = {
        sessions: new Map(),
    };

    async save(sessions: Map<Hexpubkey, SerializedSession>, activePubkey?: Hexpubkey): Promise<void> {
        this.data = {
            sessions: new Map(sessions),
            activePubkey,
        };
    }

    async load(): Promise<{ sessions: Map<Hexpubkey, SerializedSession>; activePubkey?: Hexpubkey }> {
        return {
            sessions: new Map(this.data.sessions),
            activePubkey: this.data.activePubkey,
        };
    }

    async clear(): Promise<void> {
        this.data = {
            sessions: new Map(),
        };
    }
}
