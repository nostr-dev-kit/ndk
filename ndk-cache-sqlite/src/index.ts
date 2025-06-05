import type { NDKCacheAdapter, NDKCacheRelayInfo } from "@nostr-dev-kit/ndk";
import {
    NDKEvent,
    type NDKEventId,
    type NDKFilter,
    type NDKSubscription,
    type NDKRelay,
    type Hexpubkey,
    type NDKUserProfile,
} from "@nostr-dev-kit/ndk";
import type { NDKCacheAdapterSqliteOptions } from "./types";
import { DatabaseWrapper, initializeDatabase } from "./db/database";
import { setEvent } from "./functions/setEvent";
import { getEvent } from "./functions/getEvent";
import { fetchProfile } from "./functions/fetchProfile";
import { saveProfile } from "./functions/saveProfile";
import { query } from "./functions/query";
import { getProfiles } from "./functions/getProfiles";
import { updateRelayStatus } from "./functions/updateRelayStatus";
import { getRelayStatus } from "./functions/getRelayStatus";
import NDK from "@nostr-dev-kit/ndk";

export class NDKCacheAdapterSqlite implements NDKCacheAdapter {
    public dbPath?: string;
    public dbName?: string;
    public locking = false;
    public db?: DatabaseWrapper;
    public ndk?: NDK;

    constructor(options: NDKCacheAdapterSqliteOptions = {}) {
        this.dbPath = options.dbPath;
        this.dbName = options.dbName || "ndk-cache";
    }

    /**
     * Initializes the database and runs migrations.
     */
    async initializeAsync(ndk?: NDK): Promise<void> {
        this.ndk = ndk;
        this.db = initializeDatabase(this.dbPath, this.dbName);
    }

    // Modular method bindings (public field initializers)
    public setEvent = setEvent.bind(this);
    public getEvent = getEvent.bind(this);
    public fetchProfile = fetchProfile.bind(this);
    public saveProfile = saveProfile.bind(this);
    public query = query.bind(this);
    public getProfiles = getProfiles.bind(this);
    public updateRelayStatus = updateRelayStatus.bind(this);
    public getRelayStatus = getRelayStatus.bind(this);

    public getDecryptedEvent = (eventId: NDKEventId): NDKEvent | null => {
        if (!this.db) throw new Error("Database not initialized");

        try {
            const stmt = this.db.getDatabase().prepare("SELECT event FROM decrypted_events WHERE id = ?");
            const row = stmt.get(eventId) as { event: string } | undefined;

            if (row) {
                const eventData = JSON.parse(row.event);
                return new NDKEvent(this.ndk, eventData);
            }
            return null;
        } catch (e) {
            console.error("Error getting decrypted event:", e);
            return null;
        }
    };

    public addDecryptedEvent = (event: NDKEvent): void => {
        if (!this.db) throw new Error("Database not initialized");

        try {
            const stmt = this.db
                .getDatabase()
                .prepare("INSERT OR REPLACE INTO decrypted_events (id, event) VALUES (?, ?)");
            stmt.run(event.id, JSON.stringify(event.rawEvent()));
        } catch (e) {
            console.error("Error adding decrypted event:", e);
        }
    };

    public addUnpublishedEvent = (event: NDKEvent, relayUrls: string[]): void => {
        if (!this.db) throw new Error("Database not initialized");

        try {
            const stmt = this.db
                .getDatabase()
                .prepare(
                    "INSERT OR REPLACE INTO unpublished_events (id, event, relays, lastTryAt) VALUES (?, ?, ?, ?)",
                );
            const now = Math.floor(Date.now() / 1000);
            stmt.run(event.id, JSON.stringify(event.rawEvent()), JSON.stringify(relayUrls), now);
        } catch (e) {
            console.error("Error adding unpublished event:", e);
        }
    };

    public getUnpublishedEvents = async (): Promise<{ event: NDKEvent; relays?: string[]; lastTryAt?: number }[]> => {
        if (!this.db) throw new Error("Database not initialized");

        try {
            const stmt = this.db.getDatabase().prepare("SELECT * FROM unpublished_events");
            const rows = stmt.all() as { id: string; event: string; relays: string; lastTryAt: number }[];

            return rows.map((row) => {
                const eventData = JSON.parse(row.event);
                const event = new NDKEvent(this.ndk, eventData);
                const relays = JSON.parse(row.relays);
                return {
                    event,
                    relays,
                    lastTryAt: row.lastTryAt,
                };
            });
        } catch (e) {
            console.error("Error getting unpublished events:", e);
            return [];
        }
    };

    public discardUnpublishedEvent = (eventId: NDKEventId): void => {
        if (!this.db) throw new Error("Database not initialized");

        try {
            const stmt = this.db.getDatabase().prepare("DELETE FROM unpublished_events WHERE id = ?");
            stmt.run(eventId);
        } catch (e) {
            console.error("Error discarding unpublished event:", e);
        }
    };

    /**
     * Close the database connection
     */
    close(): void {
        if (this.db) {
            this.db.close();
        }
    }
}

export default NDKCacheAdapterSqlite;
export * from "./types";
