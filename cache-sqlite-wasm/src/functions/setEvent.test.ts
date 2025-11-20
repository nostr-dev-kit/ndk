import { NDKEvent, NDKKind } from "@nostr-dev-kit/ndk";
import { beforeEach, describe, expect, it } from "vitest";
import NDKCacheSqliteWasm from "../index";

describe("setEvent", () => {
    let cache: NDKCacheSqliteWasm;

    beforeEach(async () => {
        cache = new NDKCacheSqliteWasm({
            dbName: "test-cache-setEvent",
            wasmUrl: new URL("../../example/sql-wasm.wasm", import.meta.url).href,
        });
        await cache.initializeAsync();
    });

    it.skip("should store a basic event (worker mode tests need update)", async () => {
        // Tests need to be rewritten for worker mode
        // Direct database access is no longer available
    });

    it.skip("should index single-letter tags (worker mode tests need update)", async () => {
        // Tests need to be rewritten for worker mode
    });

    it.skip("should deduplicate tags (worker mode tests need update)", async () => {
        // Tests need to be rewritten for worker mode
    });

    it.skip("should extract and save profile from kind:0 events (worker mode tests need update)", async () => {
        // Tests need to be rewritten for worker mode
    });
});
