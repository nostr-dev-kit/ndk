/**
 * Mint Methods for NDK Mobile
 *
 * This module provides functionality for managing Cashu mint information
 * with SQLite persistence.
 */

import type { NDKCacheAdapterSqlite } from "../cache-adapter/sqlite/index.js";
import type { MintInfoResponse, MintKeys, StoredMintInfo, StoredMintKeys } from "../types/cashu.js";
import { nowSeconds } from "../utils/time.js";

/**
 * Gets mint information from the database
 * @param url - The URL of the mint
 * @returns The mint information or null if not found
 */
export function getMintInfo(this: NDKCacheAdapterSqlite, url: string): MintInfoResponse | null {
    try {
        const res = this.db.getFirstSync("SELECT payload FROM mint_info WHERE url = ?", [url]) as
            | { payload: string }
            | undefined;

        if (!res) return null;
        return JSON.parse(res.payload) as MintInfoResponse;
    } catch (e) {
        console.error("Error getting mint info", e);
        return null;
    }
}

/**
 * Gets complete mint information record including metadata
 * @param url - The URL of the mint
 * @returns The complete mint info record or null if not found
 */
export function getMintInfoRecord(this: NDKCacheAdapterSqlite, url: string): StoredMintInfo | null {
    try {
        const res = this.db.getFirstSync("SELECT url, payload, created_at, updated_at FROM mint_info WHERE url = ?", [
            url,
        ]) as
            | {
                  url: string;
                  payload: string;
                  created_at: number;
                  updated_at: number;
              }
            | undefined;

        if (!res) return null;

        return {
            url: res.url,
            payload: JSON.parse(res.payload) as MintInfoResponse,
            created_at: res.created_at,
            updated_at: res.updated_at,
        };
    } catch (e) {
        console.error("Error getting mint info record", e);
        return null;
    }
}

/**
 * Gets all stored mint information
 * @returns Array of stored mint info records
 */
export function getAllMintInfo(this: NDKCacheAdapterSqlite): StoredMintInfo[] {
    try {
        const results = this.db.getAllSync("SELECT url, payload, created_at, updated_at FROM mint_info") as {
            url: string;
            payload: string;
            created_at: number;
            updated_at: number;
        }[];

        return results.map((res) => ({
            url: res.url,
            payload: JSON.parse(res.payload) as MintInfoResponse,
            created_at: res.created_at,
            updated_at: res.updated_at,
        }));
    } catch (e) {
        console.error("Error getting all mint info", e);
        return [];
    }
}

/**
 * Saves mint information to the database
 * @param url - The URL of the mint
 * @param payload - The mint information to save
 */
export function setMintInfo(this: NDKCacheAdapterSqlite, url: string, payload: MintInfoResponse): void {
    try {
        const now = nowSeconds();
        const existing = this.getMintInfoRecord(url);

        if (existing) {
            // Update existing record
            this.db.runSync("UPDATE mint_info SET payload = ?, updated_at = ? WHERE url = ?", [
                JSON.stringify(payload),
                now,
                url,
            ]);
        } else {
            // Insert new record
            this.db.runSync("INSERT INTO mint_info (url, payload, created_at, updated_at) VALUES (?, ?, ?, ?)", [
                url,
                JSON.stringify(payload),
                now,
                now,
            ]);
        }
    } catch (e) {
        console.error("Error setting mint info", e);
    }
}

/**
 * Gets all mint keys for a specific mint URL
 * @param url - The URL of the mint
 * @returns Array of mint keys
 */
export function getMintKeys(this: NDKCacheAdapterSqlite, url: string): MintKeys[] {
    try {
        const results = this.db.getAllSync("SELECT payload FROM mint_keys WHERE url = ?", [url]) as {
            payload: string;
        }[];

        return results.map((res) => JSON.parse(res.payload) as MintKeys);
    } catch (e) {
        console.error("Error getting mint keys", e);
        return [];
    }
}

/**
 * Gets a specific keyset by mint URL and keyset ID
 * @param url - The URL of the mint
 * @param keysetId - The ID of the keyset
 * @returns The mint keys or null if not found
 */
export function getMintKeyset(this: NDKCacheAdapterSqlite, url: string, keysetId: string): MintKeys | null {
    try {
        const res = this.db.getFirstSync("SELECT payload FROM mint_keys WHERE url = ? AND keyset_id = ?", [
            url,
            keysetId,
        ]) as { payload: string } | undefined;

        if (!res) return null;
        return JSON.parse(res.payload) as MintKeys;
    } catch (e) {
        console.error("Error getting mint keyset", e);
        return null;
    }
}

/**
 * Gets complete mint keys record including metadata
 * @param url - The URL of the mint
 * @param keysetId - The ID of the keyset
 * @returns The complete mint keys record or null if not found
 */
export function getMintKeysetRecord(this: NDKCacheAdapterSqlite, url: string, keysetId: string): StoredMintKeys | null {
    try {
        const res = this.db.getFirstSync(
            `SELECT url, keyset_id, payload, created_at, updated_at 
             FROM mint_keys WHERE url = ? AND keyset_id = ?`,
            [url, keysetId],
        ) as
            | {
                  url: string;
                  keyset_id: string;
                  payload: string;
                  created_at: number;
                  updated_at: number;
              }
            | undefined;

        if (!res) return null;

        return {
            url: res.url,
            keyset_id: res.keyset_id,
            payload: JSON.parse(res.payload) as MintKeys,
            created_at: res.created_at,
            updated_at: res.updated_at,
        };
    } catch (e) {
        console.error("Error getting mint keyset record", e);
        return null;
    }
}

/**
 * Gets all mint keys records for all mints
 * @returns Array of stored mint keys records
 */
export function getAllMintKeysets(this: NDKCacheAdapterSqlite): StoredMintKeys[] {
    try {
        const results = this.db.getAllSync("SELECT url, keyset_id, payload, created_at, updated_at FROM mint_keys") as {
            url: string;
            keyset_id: string;
            payload: string;
            created_at: number;
            updated_at: number;
        }[];

        return results.map((res) => ({
            url: res.url,
            keyset_id: res.keyset_id,
            payload: JSON.parse(res.payload) as MintKeys,
            created_at: res.created_at,
            updated_at: res.updated_at,
        }));
    } catch (e) {
        console.error("Error getting all mint keysets", e);
        return [];
    }
}

/**
 * Saves a mint keyset to the database
 * @param url - The URL of the mint
 * @param keysetId - The ID of the keyset
 * @param keys - The mint keys to save
 */
export function setMintKeys(this: NDKCacheAdapterSqlite, url: string, keysetId: string, keys: MintKeys): void {
    try {
        const now = nowSeconds();

        // First delete any existing record for this URL and keyset ID
        this.db.runSync("DELETE FROM mint_keys WHERE url = ? AND keyset_id = ?", [url, keysetId]);

        // Then insert the new record
        this.db.runSync(
            `INSERT INTO mint_keys (url, keyset_id, payload, created_at, updated_at) 
             VALUES (?, ?, ?, ?, ?)`,
            [url, keysetId, JSON.stringify(keys), now, now],
        );
    } catch (e) {
        console.error("Error setting mint keys", e);
    }
}
