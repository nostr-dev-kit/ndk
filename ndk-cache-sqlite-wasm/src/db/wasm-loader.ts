/**
 * Loads the SQLite WASM binary and initializes the database.
 * Uses sql.js and persists the database in IndexedDB.
 * Automatically saves the database 1000ms after the last write.
 */
const DB_KEY_PREFIX = "ndk-cache-sqlite-wasm:";

function openIndexedDB(dbName: string): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_KEY_PREFIX + dbName, 1);
        request.onupgradeneeded = () => {
            request.result.createObjectStore("db", { keyPath: "id" });
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function loadFromIndexedDB(dbName: string): Promise<ArrayBuffer | null> {
    const db = await openIndexedDB(dbName);
    return new Promise((resolve, reject) => {
        const tx = db.transaction("db", "readonly");
        const store = tx.objectStore("db");
        const getReq = store.get("main");
        getReq.onsuccess = () => resolve(getReq.result ? getReq.result.data : null);
        getReq.onerror = () => reject(getReq.error);
    });
}

async function saveToIndexedDB(dbName: string, data: Uint8Array): Promise<void> {
    const db = await openIndexedDB(dbName);
    return new Promise((resolve, reject) => {
        const tx = db.transaction("db", "readwrite");
        const store = tx.objectStore("db");
        const putReq = store.put({ id: "main", data });
        putReq.onsuccess = () => resolve();
        putReq.onerror = () => reject(putReq.error);
    });
}

export async function loadWasmAndInitDb(wasmUrl?: string, dbName: string = "ndk-cache"): Promise<any> {
    const SQL = await import("sql.js");
    const config: any = {};
    if (wasmUrl) config.locateFile = () => wasmUrl;
    const SQLModule = await SQL.default(config);

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
    db._scheduleSave = () => {
        if (saveTimeout) clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            db.saveToIndexedDB();
        }, 1000);
    };

    db.saveToIndexedDB = async () => {
        const data = db.export();
        await saveToIndexedDB(dbName, data);
    };

    // Patch run/exec to schedule save after writes
    const origRun = db.run;
    db.run = function (...args: any[]) {
        const result = origRun.apply(db, args);
        db._scheduleSave();
        return result;
    };

    return db;
}