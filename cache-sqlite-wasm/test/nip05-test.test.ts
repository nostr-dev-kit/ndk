import { beforeEach, describe, expect, test } from "bun:test";
import type { ProfilePointer } from "@nostr-dev-kit/ndk";
import NDKCacheAdapterSqliteWasm from "../src/index";

describe("NIP-05 caching", () => {
    let cache: NDKCacheAdapterSqliteWasm;

    beforeEach(async () => {
        cache = new NDKCacheAdapterSqliteWasm({
            dbName: `:memory:`,
        });
        await cache.initializeAsync();
    });

    test("should cache successful NIP-05 verification", async () => {
        const nip05 = "alice@example.com";
        const profile: ProfilePointer = {
            pubkey: "abcd1234",
            relays: ["wss://relay.example.com"],
        };

        // Save the verification result
        await cache.saveNip05(nip05, profile);

        // Load it back
        const result = await cache.loadNip05(nip05);

        expect(result).not.toBe("missing");
        expect(result).not.toBe(null);
        expect((result as ProfilePointer).pubkey).toBe("abcd1234");
        expect((result as ProfilePointer).relays).toEqual(["wss://relay.example.com"]);
    });

    test("should cache failed NIP-05 verification", async () => {
        const nip05 = "notfound@example.com";

        // Save failed verification
        await cache.saveNip05(nip05, null);

        // Load it back - should return null (not "missing") since it's fresh
        const result = await cache.loadNip05(nip05);

        expect(result).toBe(null);
    });

    test("should return 'missing' for uncached NIP-05", async () => {
        const nip05 = "uncached@example.com";

        const result = await cache.loadNip05(nip05);

        expect(result).toBe("missing");
    });

    test("should expire failed NIP-05 after maxAgeForMissing", async () => {
        const nip05 = "expired@example.com";

        // Save failed verification
        await cache.saveNip05(nip05, null);

        // Wait a tiny bit to ensure time passes
        await new Promise((resolve) => setTimeout(resolve, 10));

        // Load with very short expiration (0 seconds)
        const result = await cache.loadNip05(nip05, 0);

        // Should return "missing" since it's expired
        expect(result).toBe("missing");
    });

    test("should not expire failed NIP-05 within maxAgeForMissing", async () => {
        const nip05 = "recent@example.com";

        // Save failed verification
        await cache.saveNip05(nip05, null);

        // Load with long expiration (3600 seconds)
        const result = await cache.loadNip05(nip05, 3600);

        // Should return null since it's still fresh
        expect(result).toBe(null);
    });

    test("should cache NIP-05 with nip46 URLs", async () => {
        const nip05 = "bob@example.com";
        const profile: ProfilePointer = {
            pubkey: "efgh5678",
            relays: ["wss://relay1.com", "wss://relay2.com"],
            nip46: ["bunker://example.com"],
        };

        await cache.saveNip05(nip05, profile);

        const result = await cache.loadNip05(nip05);

        expect(result).not.toBe("missing");
        expect(result).not.toBe(null);
        expect((result as ProfilePointer).pubkey).toBe("efgh5678");
        expect((result as ProfilePointer).nip46).toEqual(["bunker://example.com"]);
    });

    test("should update existing NIP-05 cache entry", async () => {
        const nip05 = "charlie@example.com";
        const profile1: ProfilePointer = {
            pubkey: "old1234",
            relays: ["wss://old-relay.com"],
        };
        const profile2: ProfilePointer = {
            pubkey: "new5678",
            relays: ["wss://new-relay.com"],
        };

        // Save first verification
        await cache.saveNip05(nip05, profile1);

        // Save updated verification
        await cache.saveNip05(nip05, profile2);

        // Load should return the new one
        const result = await cache.loadNip05(nip05);

        expect(result).not.toBe("missing");
        expect(result).not.toBe(null);
        expect((result as ProfilePointer).pubkey).toBe("new5678");
    });
});
