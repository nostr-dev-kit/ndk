import "fake-indexeddb/auto";
import type { CacheModuleCollection, CacheModuleDefinition } from "@nostr-dev-kit/ndk";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { DexieCacheModuleManager } from "../src/cache-module";

describe("Cache Module System", () => {
    let manager: DexieCacheModuleManager;
    const testDbName = "test-cache-modules";

    beforeEach(() => {
        manager = new DexieCacheModuleManager(testDbName);
    });

    afterEach(async () => {
        // Clean up IndexedDB
        if (typeof indexedDB !== "undefined") {
            const databases = (await indexedDB.databases?.()) || [];
            for (const db of databases) {
                if (db.name?.startsWith(testDbName)) {
                    indexedDB.deleteDatabase(db.name);
                }
            }
        }
    });

    describe("Module Registration", () => {
        it("should register a new module", async () => {
            const testModule: CacheModuleDefinition = {
                namespace: "test",
                version: 1,
                collections: {
                    items: {
                        primaryKey: "id",
                        indexes: ["name", "createdAt"],
                    },
                },
                migrations: {
                    1: async (context) => {
                        await context.createCollection("items", testModule.collections.items);
                    },
                },
            };

            await manager.registerModule(testModule);

            expect(manager.hasModule("test")).toBe(true);
            const version = await manager.getModuleVersion("test");
            expect(version).toBe(1);
        });

        it("should not re-register module with same version", async () => {
            const testModule: CacheModuleDefinition = {
                namespace: "test",
                version: 1,
                collections: {
                    items: { primaryKey: "id" },
                },
                migrations: {
                    1: async (context) => {
                        await context.createCollection("items", testModule.collections.items);
                    },
                },
            };

            await manager.registerModule(testModule);
            await manager.registerModule(testModule); // Register again

            const version = await manager.getModuleVersion("test");
            expect(version).toBe(1);
        });

        it("should handle module upgrades", async () => {
            const moduleV1: CacheModuleDefinition = {
                namespace: "upgrade-test",
                version: 1,
                collections: {
                    users: { primaryKey: "id" },
                },
                migrations: {
                    1: async (context) => {
                        await context.createCollection("users", moduleV1.collections.users);
                    },
                },
            };

            await manager.registerModule(moduleV1);

            const moduleV2: CacheModuleDefinition = {
                namespace: "upgrade-test",
                version: 2,
                collections: {
                    users: { primaryKey: "id", indexes: ["email"] },
                    posts: { primaryKey: "id", indexes: ["userId", "createdAt"] },
                },
                migrations: {
                    1: async (context) => {
                        await context.createCollection("users", moduleV1.collections.users);
                    },
                    2: async (context) => {
                        await context.createCollection("posts", moduleV2.collections.posts);
                        await context.addIndex("users", "email");
                    },
                },
            };

            await manager.registerModule(moduleV2);

            const version = await manager.getModuleVersion("upgrade-test");
            expect(version).toBe(2);
        });
    });

    describe("Collection Operations", () => {
        let collection: CacheModuleCollection<TestItem>;

        interface TestItem {
            id: string;
            name: string;
            value: number;
            tags: string[];
        }

        beforeEach(async () => {
            const testModule: CacheModuleDefinition = {
                namespace: "collection-test",
                version: 1,
                collections: {
                    items: {
                        primaryKey: "id",
                        indexes: ["name", "value"],
                    },
                },
                migrations: {
                    1: async (context) => {
                        await context.createCollection("items", testModule.collections.items);
                    },
                },
            };

            await manager.registerModule(testModule);
            collection = await manager.getModuleCollection<TestItem>("collection-test", "items");
        });

        it("should save and retrieve items", async () => {
            const item: TestItem = {
                id: "test-1",
                name: "Test Item",
                value: 42,
                tags: ["test", "example"],
            };

            await collection.save(item);
            const retrieved = await collection.get("test-1");

            expect(retrieved).toEqual(item);
        });

        it("should save and retrieve multiple items", async () => {
            const items: TestItem[] = [
                { id: "1", name: "Item 1", value: 10, tags: ["a"] },
                { id: "2", name: "Item 2", value: 20, tags: ["b"] },
                { id: "3", name: "Item 3", value: 30, tags: ["c"] },
            ];

            await collection.saveMany(items);
            const retrieved = await collection.getMany(["1", "2", "3"]);

            expect(retrieved).toHaveLength(3);
            expect(retrieved).toEqual(expect.arrayContaining(items));
        });

        it("should delete items", async () => {
            const item: TestItem = {
                id: "delete-test",
                name: "To Delete",
                value: 0,
                tags: [],
            };

            await collection.save(item);
            await collection.delete("delete-test");

            const retrieved = await collection.get("delete-test");
            expect(retrieved).toBeNull();
        });

        it("should delete multiple items", async () => {
            const items: TestItem[] = [
                { id: "d1", name: "Delete 1", value: 1, tags: [] },
                { id: "d2", name: "Delete 2", value: 2, tags: [] },
                { id: "d3", name: "Delete 3", value: 3, tags: [] },
            ];

            await collection.saveMany(items);
            await collection.deleteMany(["d1", "d3"]);

            const remaining = await collection.all();
            expect(remaining).toHaveLength(1);
            expect(remaining[0].id).toBe("d2");
        });

        it("should find items by field", async () => {
            const items: TestItem[] = [
                { id: "1", name: "Alpha", value: 100, tags: [] },
                { id: "2", name: "Beta", value: 200, tags: [] },
                { id: "3", name: "Alpha", value: 300, tags: [] },
            ];

            await collection.saveMany(items);
            const alphaItems = await collection.findBy("name", "Alpha");

            expect(alphaItems).toHaveLength(2);
            expect(alphaItems.every((item) => item.name === "Alpha")).toBe(true);
        });

        it("should query with multiple conditions", async () => {
            const items: TestItem[] = [
                { id: "1", name: "Product A", value: 100, tags: ["sale"] },
                { id: "2", name: "Product B", value: 200, tags: ["new"] },
                { id: "3", name: "Product A", value: 150, tags: ["sale"] },
                { id: "4", name: "Product A", value: 100, tags: ["featured"] },
            ];

            await collection.saveMany(items);
            const results = await collection.where({ name: "Product A", value: 100 });

            expect(results).toHaveLength(2);
            expect(results.every((item) => item.name === "Product A" && item.value === 100)).toBe(true);
        });

        it("should count items", async () => {
            const items: TestItem[] = [
                { id: "1", name: "Item", value: 1, tags: [] },
                { id: "2", name: "Item", value: 2, tags: [] },
                { id: "3", name: "Other", value: 3, tags: [] },
            ];

            await collection.saveMany(items);

            const totalCount = await collection.count();
            expect(totalCount).toBe(3);

            const filteredCount = await collection.count({ name: "Item" });
            expect(filteredCount).toBe(2);
        });

        it("should clear all items", async () => {
            const items: TestItem[] = [
                { id: "1", name: "Item 1", value: 1, tags: [] },
                { id: "2", name: "Item 2", value: 2, tags: [] },
            ];

            await collection.saveMany(items);
            await collection.clear();

            const remaining = await collection.all();
            expect(remaining).toHaveLength(0);
        });

        it("should handle upsert correctly", async () => {
            const item: TestItem = {
                id: "upsert-1",
                name: "Original",
                value: 100,
                tags: ["v1"],
            };

            await collection.save(item);

            const updated: TestItem = {
                id: "upsert-1",
                name: "Updated",
                value: 200,
                tags: ["v2"],
            };

            await collection.save(updated);

            const retrieved = await collection.get("upsert-1");
            expect(retrieved).toEqual(updated);
        });
    });

    describe("Multiple Modules", () => {
        it("should handle multiple modules independently", async () => {
            const module1: CacheModuleDefinition = {
                namespace: "module1",
                version: 1,
                collections: {
                    data: { primaryKey: "id" },
                },
                migrations: {
                    1: async (context) => {
                        await context.createCollection("data", module1.collections.data);
                    },
                },
            };

            const module2: CacheModuleDefinition = {
                namespace: "module2",
                version: 1,
                collections: {
                    data: { primaryKey: "key" },
                    cache: { primaryKey: "id" },
                },
                migrations: {
                    1: async (context) => {
                        await context.createCollection("data", module2.collections.data);
                        await context.createCollection("cache", module2.collections.cache);
                    },
                },
            };

            await manager.registerModule(module1);
            await manager.registerModule(module2);

            expect(manager.hasModule("module1")).toBe(true);
            expect(manager.hasModule("module2")).toBe(true);

            // Collections should be namespaced
            const collection1 = await manager.getModuleCollection("module1", "data");
            const collection2 = await manager.getModuleCollection("module2", "data");

            await collection1.save({ id: "test1", value: "module1" });
            await collection2.save({ key: "test2", value: "module2" });

            const item1 = await collection1.get("test1");
            const item2 = await collection2.get("test2");

            expect(item1).toHaveProperty("value", "module1");
            expect(item2).toHaveProperty("value", "module2");
        });
    });

    describe("Error Handling", () => {
        it("should throw error when accessing non-existent module", async () => {
            await expect(manager.getModuleCollection("non-existent", "collection")).rejects.toThrow(
                "Module non-existent not registered",
            );
        });

        it("should throw error when accessing non-existent collection", async () => {
            const module: CacheModuleDefinition = {
                namespace: "error-test",
                version: 1,
                collections: {
                    valid: { primaryKey: "id" },
                },
                migrations: {
                    1: async (context) => {
                        await context.createCollection("valid", module.collections.valid);
                    },
                },
            };

            await manager.registerModule(module);

            await expect(manager.getModuleCollection("error-test", "invalid")).rejects.toThrow(
                "Collection invalid not found in module error-test",
            );
        });
    });
});
