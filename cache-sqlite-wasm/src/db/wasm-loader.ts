/**
 * Loads the SQLite WASM binary and initializes the database.
 * Uses sql.js and persists the database in IndexedDB.
 * Automatically saves the database 1000ms after the last write.
 */
import { loadFromIndexedDB, openIndexedDB, saveToIndexedDB } from "./indexeddb-utils";

export async function loadWasmAndInitDb(wasmUrl?: string, dbName: string = "ndk-cache"): Promise<any> {
    let SQL, SQLModule;
    const config: any = {};
    try {
        SQL = await import("sql.js");
        if (wasmUrl) config.locateFile = () => wasmUrl;
        SQLModule = await SQL.default(config);
    } catch (err: any) {
        console.error(
            "[NDK-cache-sqlite-wasm] Failed to load the SQLite WASM binary." +
                (wasmUrl ? ` Tried to fetch: ${wasmUrl}.` : "") +
                " This usually means the WASM asset could not be found (e.g., 404 error). " +
                "Please ensure the correct path is provided and the asset is available. " +
                "Original error:",
            err,
        );
        throw err;
    }

    // Try to load from IndexedDB
    let db;
    const saved = await loadFromIndexedDB(dbName);
    if (saved) {
        db = new SQLModule.Database(new Uint8Array(saved));
    } else {
        db = new SQLModule.Database();
    }

    // Debounced save logic
    let saveTimeout: ReturnType<typeof setTimeout> | null = null;
    (db as any)._scheduleSave = () => {
        if (saveTimeout) clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            (db as any).saveToIndexedDB();
        }, 1000);
    };

    (db as any).saveToIndexedDB = async () => {
        const data = db.export();
        await saveToIndexedDB(dbName, data);
    };

    // Patch run/exec to schedule save after writes
    const origRun = db.run;
    db.run = (sql: string, params?: any[] | Record<string, any>) => {
        const result = origRun.call(db, sql, params);
        (db as any)._scheduleSave();
        return result;
    };

    return db;
}
