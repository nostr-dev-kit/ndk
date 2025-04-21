import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { NDKSessionLocalStorage, NDKSessionStorageAdapter } from "../index";
import { MockSessionStorageAdapter } from "./mock-storage-adapter";

describe("NDKSessionStorageAdapter", () => {
    describe("MockSessionStorageAdapter", () => {
        let mockStorage: MockSessionStorageAdapter;

        beforeEach(() => {
            mockStorage = new MockSessionStorageAdapter();
        });

        it("should store and retrieve values", () => {
            mockStorage.setItem("test-key", "test-value");
            expect(mockStorage.getItem("test-key")).toBe("test-value");
        });

        it("should return null for non-existent keys", () => {
            expect(mockStorage.getItem("non-existent")).toBeNull();
        });

        it("should delete items", () => {
            mockStorage.setItem("test-key", "test-value");
            mockStorage.deleteItem("test-key");
            expect(mockStorage.getItem("test-key")).toBeNull();
        });

        it("should track method calls", () => {
            mockStorage.getItem("key1");
            mockStorage.setItem("key2", "value2");
            mockStorage.deleteItem("key3");

            expect(mockStorage.getItemCalls).toContain("key1");
            expect(mockStorage.setItemCalls).toContainEqual({ key: "key2", value: "value2" });
            expect(mockStorage.deleteItemCalls).toContain("key3");
        });

        it("should clear storage and tracking", () => {
            mockStorage.setItem("key1", "value1");
            mockStorage.getItem("key1");
            mockStorage.clear();

            expect(mockStorage.getItem("key1")).toBeNull();
            expect(mockStorage.getItemCalls).toEqual(["key1"]);
            expect(mockStorage.setItemCalls).toEqual([]);
            expect(mockStorage.deleteItemCalls).toEqual([]);
        });
    });

    // We'll skip the NDKSessionLocalStorage tests in this environment
    // since they require a proper DOM environment with localStorage
    describe("NDKSessionLocalStorage", () => {
        it("implements the NDKSessionStorageAdapter interface", () => {
            const adapter = new NDKSessionLocalStorage();
            expect(adapter).toHaveProperty("getItem");
            expect(adapter).toHaveProperty("setItem");
            expect(adapter).toHaveProperty("deleteItem");
            expect(typeof adapter.getItem).toBe("function");
            expect(typeof adapter.setItem).toBe("function");
            expect(typeof adapter.deleteItem).toBe("function");
        });
    });
});
