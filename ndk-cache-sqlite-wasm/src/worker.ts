// src/worker.ts
console.log("Worker script module loading...");
import initSqlJs from "sql.js";
import { loadFromIndexedDB, saveToIndexedDB } from "./db/indexeddb-utils";
import { runMigrations } from "./db/migrations";

console.log("Worker script imports loaded");

let db: any = null;
let SQL: any = null;
let dbName: string = "ndk-cache";

let saveTimeout: number | null = null;
const SAVE_DEBOUNCE_MS = 500;

// Debounced persistence: saves DB to IndexedDB after writes
function scheduleSave() {
    if (saveTimeout !== null) {
        clearTimeout(saveTimeout);
    }
    saveTimeout = setTimeout(() => {
        if (db && dbName) {
            const data = db.export();
            saveToIndexedDB(dbName, data).catch((err) => {
                console.error("Worker: Failed to save DB to IndexedDB", err);
            });
        }
    }, SAVE_DEBOUNCE_MS) as unknown as number;
}

// Patch db.run to schedule save after each write
function patchDbPersistence(database: any) {
    const origRun = database.run;
    database.run = function (...args: any[]) {
        const result = origRun.apply(this, args);
        scheduleSave();
        return result;
    };
}

async function initializeDatabase(config: { dbName: string; wasmUrl?: string }) {
    console.log("Worker: initializeDatabase called with config:", config);
    dbName = config.dbName || "ndk-cache";
    try {
        const sqlJsConfig: any = {};
        if (config.wasmUrl) {
            sqlJsConfig.locateFile = () => config.wasmUrl;
            console.log(`Worker: Loading WASM from ${config.wasmUrl}`);
        } else {
            console.log("Worker: No WASM URL provided, using default");
        }
        console.log("Worker: Initializing SQL.js with config:", sqlJsConfig);
        SQL = await initSqlJs(sqlJsConfig);
        console.log("Worker: SQL.js initialized successfully");

        const savedData = await loadFromIndexedDB(dbName);
        if (savedData) {
            console.log(`Worker: Loading DB ${dbName} from IndexedDB (${savedData.byteLength} bytes)`);
            db = new SQL.Database(new Uint8Array(savedData));
        } else {
            console.log(`Worker: Creating new DB ${dbName}`);
            db = new SQL.Database();
        }
        patchDbPersistence(db);

        await runMigrations(db);

        // Initial save after migrations (in case schema changed)
        scheduleSave();

        console.log(`Worker: Database ${dbName} initialized.`);
    } catch (error) {
        console.error("Worker: Database initialization failed", error);
        throw error;
    }
}

self.onmessage = async (event: MessageEvent) => {
    console.log("Worker: Received message:", event.data);
    const { id, type, payload } = event.data;

    try {
        if (type === "init") {
            console.log("Worker: Processing init message");
            await initializeDatabase(payload);
            console.log("Worker: Database initialized, sending response");
            self.postMessage({ id, result: "initialized" });
            return;
        }

        if (!db) {
            throw new Error("Database not initialized yet.");
        }

        let result: any;
        switch (type) {
            case "run":
                result = db.run(payload.sql, payload.params);
                break;
            case "exec":
                result = db.exec(payload.sql, payload.params);
                break;
            case "get": {
                const stmt = db.prepare(payload.sql, payload.params);
                result = stmt.getAsObject();
                stmt.free();
                break;
            }
            case "all": {
                const stmtAll = db.prepare(payload.sql, payload.params);
                result = [];
                while (stmtAll.step()) {
                    result.push(stmtAll.getAsObject());
                }
                stmtAll.free();
                break;
            }
            case "export":
                result = db.export();
                break;
            default:
                throw new Error(`Unknown command type: ${type}`);
        }
        console.log(`Worker: Command ${type} completed, sending result for request ${id}`);
        self.postMessage({ id, result });
    } catch (error: any) {
        console.error(`Worker: Error processing command ${id} (${type}):`, error);
        self.postMessage({ id, error: { message: error.message, stack: error.stack } });
    }
};

// Add a global error handler
self.addEventListener("error", (event) => {
    console.error("Worker: Uncaught error:", event.message, event.error);
});

console.log("Worker script loaded.");
