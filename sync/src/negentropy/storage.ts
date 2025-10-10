/**
 * Negentropy storage implementation.
 * Stores events as (timestamp, id) pairs in a sorted vector.
 */

import type { NDKEvent } from "@nostr-dev-kit/ndk";
import type { Bound, StorageItem } from "../types.js";
import { Accumulator } from "./accumulator.js";
import { compareUint8Array, hexToUint8Array, ID_SIZE } from "./utils.js";

/**
 * Compares two storage items for sorting.
 * Items are sorted by timestamp first, then by ID lexicographically.
 */
function itemCompare(a: StorageItem, b: StorageItem): number {
    if (a.timestamp !== b.timestamp) {
        return a.timestamp - b.timestamp;
    }
    return compareUint8Array(a.id, b.id);
}

/**
 * Vector-based storage for negentropy.
 * Maintains a sorted array of (timestamp, id) pairs.
 */
export class NegentropyStorage {
    private items: StorageItem[] = [];
    private sealed = false;

    /**
     * Creates storage from an array of NDK events.
     */
    static fromEvents(events: NDKEvent[]): NegentropyStorage {
        const storage = new NegentropyStorage();

        for (const event of events) {
            storage.insert(event.created_at || 0, event.id);
        }

        storage.seal();
        return storage;
    }

    /**
     * Insert an item into the storage.
     * @param timestamp Unix timestamp
     * @param id Event ID (32-byte hex string or Uint8Array)
     */
    insert(timestamp: number, id: string | Uint8Array): void {
        if (this.sealed) {
            throw new Error("Storage is sealed, cannot insert");
        }

        const idBytes = typeof id === "string" ? hexToUint8Array(id) : id;

        if (idBytes.length !== ID_SIZE) {
            throw new Error(`Invalid ID size: expected ${ID_SIZE}, got ${idBytes.length}`);
        }

        this.items.push({ timestamp, id: idBytes });
    }

    /**
     * Seal the storage.
     * This sorts the items and checks for duplicates.
     * After sealing, no more items can be inserted.
     */
    seal(): void {
        if (this.sealed) {
            throw new Error("Storage is already sealed");
        }

        this.sealed = true;

        // Sort items
        this.items.sort(itemCompare);

        // Check for duplicates
        for (let i = 1; i < this.items.length; i++) {
            if (itemCompare(this.items[i - 1], this.items[i]) === 0) {
                throw new Error("Duplicate item in storage");
            }
        }
    }

    /**
     * Unseal the storage to allow modifications.
     */
    unseal(): void {
        this.sealed = false;
    }

    /**
     * Get the number of items in storage.
     */
    size(): number {
        this.checkSealed();
        return this.items.length;
    }

    /**
     * Get an item at a specific index.
     */
    getItem(i: number): StorageItem {
        this.checkSealed();
        if (i >= this.items.length) {
            throw new Error("Index out of range");
        }
        return this.items[i];
    }

    /**
     * Iterate over items in a range.
     * @param begin Start index (inclusive)
     * @param end End index (exclusive)
     * @param cb Callback for each item, return false to stop iteration
     */
    iterate(begin: number, end: number, cb: (item: StorageItem, index: number) => boolean): void {
        this.checkSealed();
        this.checkBounds(begin, end);

        for (let i = begin; i < end; i++) {
            if (!cb(this.items[i], i)) break;
        }
    }

    /**
     * Find the lower bound index for a given bound.
     * Returns the index of the first item >= bound.
     */
    findLowerBound(begin: number, end: number, bound: Bound): number {
        this.checkSealed();
        this.checkBounds(begin, end);

        return this.binarySearch(this.items, begin, end, (a) => itemCompare(a, bound) < 0);
    }

    /**
     * Compute a fingerprint for a range of items.
     * @param begin Start index (inclusive)
     * @param end End index (exclusive)
     * @returns Fingerprint bytes
     */
    async fingerprint(begin: number, end: number): Promise<Uint8Array> {
        const accumulator = new Accumulator();
        accumulator.setToZero();

        this.iterate(begin, end, (item) => {
            accumulator.add(item.id);
            return true;
        });

        return await accumulator.getFingerprint(end - begin);
    }

    /**
     * Check that storage is sealed.
     */
    private checkSealed(): void {
        if (!this.sealed) {
            throw new Error("Storage is not sealed");
        }
    }

    /**
     * Check that begin/end are valid.
     */
    private checkBounds(begin: number, end: number): void {
        if (begin > end || end > this.items.length) {
            throw new Error("Invalid range");
        }
    }

    /**
     * Binary search to find first index where predicate is false.
     */
    private binarySearch(arr: StorageItem[], first: number, last: number, cmp: (item: StorageItem) => boolean): number {
        let count = last - first;

        while (count > 0) {
            let it = first;
            const step = Math.floor(count / 2);
            it += step;

            if (cmp(arr[it])) {
                first = ++it;
                count -= step + 1;
            } else {
                count = step;
            }
        }

        return first;
    }
}
