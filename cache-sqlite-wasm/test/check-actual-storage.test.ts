import NDK, { NDKEvent, NDKKind } from "@nostr-dev-kit/ndk";
import { beforeEach, describe, expect, it } from "vitest";
import { NDKCacheAdapterSqliteWasm } from "../src/index";

describe("Check actual storage format", () => {
    let cache: NDKCacheAdapterSqliteWasm;
    let ndk: NDK;

    beforeEach(async () => {
        cache = new NDKCacheAdapterSqliteWasm({
            dbName: "test-storage-format",
            useWorker: false,
        });
        ndk = new NDK({ cacheAdapter: cache });
        await cache.initializeAsync(ndk);
    });

    it("should check what format is actually stored in DB", async () => {
        const event = new NDKEvent(ndk, {
            kind: NDKKind.CashuToken,
            content: "test token",
            created_at: 1234567890,
            pubkey: "test-pubkey",
            tags: [["e", "sometag"]],
        });
        event.id = "test-event-id";
        event.sig = "test-sig";

        await cache.setEvent(event, [{ kinds: [NDKKind.CashuToken] }]);

        // Now directly query the DB to see what's stored
        if (cache.db) {
            const result = cache.db.exec("SELECT * FROM events WHERE id = ?", ["test-event-id"]);
            console.log("DB query result:", result);

            if (result[0] && result[0].values.length > 0) {
                const row = result[0].values[0];
                const columns = result[0].columns;

                console.log("Columns:", columns);
                console.log("Row:", row);

                // Find the raw column
                const rawIndex = columns.indexOf("raw");
                if (rawIndex !== -1) {
                    const rawValue = row[rawIndex];
                    console.log("Raw value:", rawValue);
                    console.log("Raw value type:", typeof rawValue);

                    const parsed = JSON.parse(rawValue as string);
                    console.log("Parsed raw:", parsed);
                    console.log("Is array?", Array.isArray(parsed));
                }
            }
        }
    });
});
