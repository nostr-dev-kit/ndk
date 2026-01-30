/**
 * Migration utility for handling the transition from sql.js/IndexedDB to wa-sqlite/OPFS.
 *
 * NOTE: Direct migration of database contents is not supported because the storage
 * formats are fundamentally different. The old sql.js approach stored the entire
 * database as a binary blob in IndexedDB. The new wa-sqlite approach uses OPFS or
 * IndexedDB-based VFS with incremental writes.
 *
 * This migration simply cleans up old IndexedDB data to prevent storage bloat.
 */

import { loadFromIndexedDB, openIndexedDB } from "./indexeddb-utils";

/**
 * Check for and clean up old IndexedDB data from the sql.js era.
 * Returns true if old data was found and cleaned up.
 */
export async function cleanupOldIndexedDB(dbName: string): Promise<boolean> {
    let oldData: ArrayBuffer | null;
    try {
        oldData = await loadFromIndexedDB(dbName);
    } catch {
        // IndexedDB not available or empty
        return false;
    }

    if (!oldData || oldData.byteLength === 0) {
        return false;
    }

    const oldSizeMB = (oldData.byteLength / 1024 / 1024).toFixed(2);
    console.log(`[Migration] Found old IndexedDB cache (${oldSizeMB}MB) - cleaning up...`);

    // Delete old IndexedDB data
    try {
        const idb = await openIndexedDB(dbName);
        const tx = idb.transaction("db", "readwrite");
        tx.objectStore("db").delete("main");
        await new Promise<void>((resolve, reject) => {
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
        idb.close();
        console.log(`[Migration] Old cache cleaned up. New OPFS cache will rebuild automatically.`);
        return true;
    } catch (e) {
        console.warn("[Migration] Could not delete old IndexedDB data:", e);
        return false;
    }
}

/**
 * Check if there's data in the old IndexedDB format
 */
export async function hasOldIndexedDBData(dbName: string): Promise<boolean> {
    try {
        const data = await loadFromIndexedDB(dbName);
        return data !== null && data.byteLength > 0;
    } catch {
        return false;
    }
}
