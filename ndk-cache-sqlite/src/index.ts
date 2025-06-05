import type { NDKCacheAdapter, NDKCacheRelayInfo } from "@nostr-dev-kit/ndk";
import type {
    NDKEvent,
    NDKEventId,
    NDKFilter,
    NDKSubscription,
    NDKRelay,
    Hexpubkey,
    NDKUserProfile,
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
        // Implementation will be added
        return null;
    };

    public addDecryptedEvent = (event: NDKEvent): void => {
        // Implementation will be added
    };

    public addUnpublishedEvent = (event: NDKEvent, relayUrls: string[]): void => {
        // Implementation will be added
    };

    public getUnpublishedEvents = async (): Promise<{ event: NDKEvent; relays?: string[]; lastTryAt?: number }[]> => {
        // Implementation will be added
        return [];
    };

    public discardUnpublishedEvent = (eventId: NDKEventId): void => {
        // Implementation will be added
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
