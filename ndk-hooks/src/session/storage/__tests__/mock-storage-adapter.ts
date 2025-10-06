import type { NDKSessionStorageAdapter } from "../index";

/**
 * Mock implementation of NDKSessionStorageAdapter for testing.
 * This adapter stores data in memory and provides methods to simulate
 * storage behavior and track method calls.
 */
export class MockSessionStorageAdapter implements NDKSessionStorageAdapter {
    private storage: Map<string, string> = new Map();
    public getItemCalls: string[] = [];
    public setItemCalls: Array<{ key: string; value: string }> = [];
    public deleteItemCalls: string[] = [];

    /**
     * Get an item from the mock storage.
     * @param key The key to retrieve.
     * @returns The stored value or null if not found.
     */
    getItem(key: string): string | null {
        this.getItemCalls.push(key);
        return this.storage.has(key) ? this.storage.get(key)! : null;
    }

    /**
     * Set an item in the mock storage.
     * @param key The key to store.
     * @param value The value to store.
     */
    setItem(key: string, value: string): void {
        this.setItemCalls.push({ key, value });
        this.storage.set(key, value);
    }

    /**
     * Delete an item from the mock storage.
     * @param key The key to delete.
     */
    deleteItem(key: string): void {
        this.deleteItemCalls.push(key);
        this.storage.delete(key);
    }

    /**
     * Clear all stored data and tracking arrays.
     */
    clear(): void {
        this.storage.clear();
        this.getItemCalls.length = 0;
        this.setItemCalls.length = 0;
        this.deleteItemCalls.length = 0;
    }
}
