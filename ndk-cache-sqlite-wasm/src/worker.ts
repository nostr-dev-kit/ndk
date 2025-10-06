import initSqlJs from "sql.js";
import { loadFromIndexedDB, saveToIndexedDB } from "./db/indexeddb-utils";
import { runMigrations } from "./db/migrations";

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
    database.run = function (sql: string, params?: any[] | Record<string, any>) {
        // Assuming origRun has the correct signature from the Database type
        const result = origRun.call(this, sql, params);
        scheduleSave();
        return result;
    };
}

async function initializeDatabase(config: { dbName: string; wasmUrl?: string }) {
    dbName = config.dbName || "ndk-cache";
    try {
        const sqlJsConfig: any = {};
        if (config.wasmUrl) {
            sqlJsConfig.locateFile = () => config.wasmUrl;
        } else {
        }
        SQL = await initSqlJs(sqlJsConfig);

        const savedData = await loadFromIndexedDB(dbName);
        if (savedData) {
            db = new SQL.Database(new Uint8Array(savedData));
        } else {
            db = new SQL.Database();
        }
        patchDbPersistence(db);

        await runMigrations(db);

        // Initial save after migrations (in case schema changed)
        scheduleSave();
    } catch (error) {
        console.error("Worker: Database initialization failed", error);
        throw error;
    }
}

self.onmessage = async (event: MessageEvent) => {
    const { id, type, payload } = event.data;

    try {
        if (type === "init") {
            await initializeDatabase(payload);
            self.postMessage({ id, result: "initialized" });
            return;
        }

        if (!db) {
            throw new Error("Database not initialized yet.");
        }

        let result: any;
        switch (type) {
            case "run":
                db.run(payload.sql, payload.params);
                result = undefined;
                break;
            case "exec":
                result = db.exec(payload.sql, payload.params);
                break;
            case "get": {
                const stmt = db.prepare(payload.sql, payload.params);
                if (stmt.step()) {
                    result = stmt.getAsObject();
                } else {
                    result = null;
                }
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
            case "getProfiles": {
                // payload: { field: string, contains: string }
                const { field, contains } = payload;
                const sql = `
                    SELECT pubkey, profile
                    FROM profiles
                    WHERE json_extract(profile, '$.${field}') LIKE ?
                `;
                const param = `%${contains}%`;
                const stmt = db.prepare(sql, [param]);
                result = [];
                while (stmt.step()) {
                    const row = stmt.getAsObject();
                    try {
                        result.push({
                            pubkey: row.pubkey,
                            profile: JSON.parse(row.profile),
                        });
                    } catch {
                        // skip invalid profile
                    }
                }
                stmt.free();
                break;
            }
            case "export":
                result = db.export();
                break;
            default:
                throw new Error(`Unknown command type: ${type}`);
        }
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
