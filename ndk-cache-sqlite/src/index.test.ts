import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { NDKCacheAdapterSqlite } from "./index";
import * as fs from "fs";

describe("NDKCacheAdapterSqlite", () => {
    let adapter: NDKCacheAdapterSqlite;
    const testDbPath = "./test-cache.db";

    beforeEach(async () => {
        // Clean up any existing test database
        if (fs.existsSync(testDbPath)) {
            fs.unlinkSync(testDbPath);
        }

        adapter = new NDKCacheAdapterSqlite({
            dbPath: testDbPath,
            dbName: "test-cache",
        });

        await adapter.initializeAsync();
    });

    afterEach(() => {
        if (adapter) {
            adapter.close();
        }

        // Clean up test database
        if (fs.existsSync(testDbPath)) {
            fs.unlinkSync(testDbPath);
        }
    });

    it("should initialize successfully", () => {
        expect(adapter).toBeDefined();
        expect(adapter.db).toBeDefined();
        expect(adapter.locking).toBe(false);
    });

    it("should create database file", () => {
        expect(fs.existsSync(testDbPath)).toBe(true);
    });

    it("should have all required methods", () => {
        expect(typeof adapter.setEvent).toBe("function");
        expect(typeof adapter.getEvent).toBe("function");
        expect(typeof adapter.fetchProfile).toBe("function");
        expect(typeof adapter.saveProfile).toBe("function");
        expect(typeof adapter.query).toBe("function");
        expect(typeof adapter.getProfiles).toBe("function");
        expect(typeof adapter.updateRelayStatus).toBe("function");
        expect(typeof adapter.getRelayStatus).toBe("function");
    });
});
