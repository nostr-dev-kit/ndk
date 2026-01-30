/**
 * wa-sqlite database wrapper providing an sql.js-compatible API.
 * Uses OPFS VFS for persistence with incremental writes and no main thread blocking.
 */

import SQLiteESMFactory from "wa-sqlite/dist/wa-sqlite-async.mjs";
import * as SQLite from "wa-sqlite";
// @ts-ignore - no type declarations for VFS examples
import { OPFSCoopSyncVFS } from "wa-sqlite/src/examples/OPFSCoopSyncVFS.js";

export interface QueryExecResult {
    columns: string[];
    values: any[][];
}

/** Persistence mode */
export type PersistenceMode = "opfs" | "idb" | "memory";

// Use any for wa-sqlite API since types are not fully exported
type WaSqliteAPI = any;

// Singleton instances to ensure VFS state is preserved
let moduleInstance: any = null;
let sqlite3Instance: WaSqliteAPI | null = null;
let vfsInstance: any = null;
let vfsRegistered = false;

async function getModule(): Promise<any> {
    if (!moduleInstance) {
        moduleInstance = await SQLiteESMFactory();
    }
    return moduleInstance;
}

async function getSqlite3(): Promise<WaSqliteAPI> {
    if (!sqlite3Instance) {
        const module = await getModule();
        sqlite3Instance = SQLite.Factory(module);
    }
    return sqlite3Instance;
}

/**
 * wa-sqlite database wrapper with sql.js-compatible interface
 */
export class WaSqliteDatabase {
    private sqlite3: WaSqliteAPI;
    private db: number;
    private vfs: any;
    public readonly persistenceMode: PersistenceMode;

    private constructor(sqlite3: WaSqliteAPI, db: number, vfs: any, persistenceMode: PersistenceMode) {
        this.sqlite3 = sqlite3;
        this.db = db;
        this.vfs = vfs;
        this.persistenceMode = persistenceMode;
    }

    /**
     * Create a database with OPFS persistence.
     * Uses OPFSCoopSyncVFS for reliable, high-performance storage.
     */
    static async create(dbPath: string): Promise<WaSqliteDatabase> {
        const module = await getModule();
        const sqlite3 = await getSqlite3();

        const persistenceMode: PersistenceMode = "opfs";

        // Register VFS only once
        if (!vfsRegistered) {
            try {
                const vfsName = "opfs-coop";
                // Use static create method which properly initializes the VFS with the module
                vfsInstance = await OPFSCoopSyncVFS.create(vfsName, module);
                sqlite3.vfs_register(vfsInstance, true);
                vfsRegistered = true;
                console.log("[wa-sqlite] OPFSCoopSyncVFS registered:", vfsInstance.name);
            } catch (e: any) {
                console.error("[wa-sqlite] Failed to register OPFS VFS:", e?.message);
                throw e;
            }
        }

        const db = await sqlite3.open_v2(
            dbPath,
            SQLite.SQLITE_OPEN_READWRITE | SQLite.SQLITE_OPEN_CREATE,
            vfsInstance.name
        );

        console.log("[wa-sqlite] Database opened with OPFS, handle:", db);

        const database = new WaSqliteDatabase(sqlite3, db, vfsInstance, persistenceMode);

        // Configure for optimal performance with single connection
        await database.exec("PRAGMA cache_size = -8192");
        await database.exec("PRAGMA synchronous = normal");
        await database.exec("PRAGMA locking_mode = exclusive");

        return database;
    }

    /**
     * Create an in-memory database (fallback when no persistent VFS available)
     */
    static async createInMemory(): Promise<WaSqliteDatabase> {
        const sqlite3 = await getSqlite3();

        const db = await sqlite3.open_v2(
            ":memory:",
            SQLite.SQLITE_OPEN_READWRITE | SQLite.SQLITE_OPEN_CREATE
        );

        return new WaSqliteDatabase(sqlite3, db, null, "memory");
    }

    /**
     * Execute SQL and return results (async version using wa-sqlite's AsyncIterable)
     */
    async exec(sql: string, params?: any[]): Promise<QueryExecResult[]> {
        const results: QueryExecResult[] = [];
        let currentResult: QueryExecResult | null = null;

        try {
            for await (const stmt of this.sqlite3.statements(this.db, sql)) {
                if (params && params.length > 0) {
                    this.sqlite3.bind_collection(stmt, params);
                }

                const columns = this.sqlite3.column_names(stmt);

                while (await this.sqlite3.step(stmt) === SQLite.SQLITE_ROW) {
                    if (!currentResult || currentResult.columns.join(",") !== columns.join(",")) {
                        currentResult = { columns: [...columns], values: [] };
                        results.push(currentResult);
                    }

                    const row: any[] = [];
                    for (let i = 0; i < columns.length; i++) {
                        row.push(this.sqlite3.column(stmt, i));
                    }
                    currentResult.values.push(row);
                }
            }
            return results;
        } catch (error: any) {
            console.error("[wa-sqlite] exec error:", error.message);
            throw error;
        }
    }

    /**
     * Execute a write statement (INSERT/UPDATE/DELETE)
     */
    async run(sql: string, params?: any[]): Promise<void> {
        try {
            for await (const stmt of this.sqlite3.statements(this.db, sql)) {
                if (params && params.length > 0) {
                    this.sqlite3.bind_collection(stmt, params);
                }
                await this.sqlite3.step(stmt);
            }
        } catch (error: any) {
            console.error("[wa-sqlite] run error:", error.message);
            throw error;
        }
    }

    /**
     * Query and return the first row as an object, or null if no rows
     */
    async queryOne(sql: string, params?: any[]): Promise<Record<string, any> | null> {
        const results = await this.exec(sql, params);
        if (!results[0] || !results[0].values[0]) {
            return null;
        }
        const { columns, values } = results[0];
        const row: Record<string, any> = {};
        for (let i = 0; i < columns.length; i++) {
            row[columns[i]] = values[0][i];
        }
        return row;
    }

    /**
     * Query and return all rows as objects
     */
    async queryAll(sql: string, params?: any[]): Promise<Record<string, any>[]> {
        const results = await this.exec(sql, params);
        if (!results[0]) {
            return [];
        }
        const { columns, values } = results[0];
        return values.map(row => {
            const obj: Record<string, any> = {};
            for (let i = 0; i < columns.length; i++) {
                obj[columns[i]] = row[i];
            }
            return obj;
        });
    }

    /**
     * Force a sync/flush to ensure data is persisted
     */
    async sync(): Promise<void> {
        // Execute a checkpoint to force WAL data to be written (if using WAL)
        // For batch atomic VFS, this triggers the sync path
        try {
            await this.exec("PRAGMA wal_checkpoint(PASSIVE)");
        } catch {
            // Not using WAL mode, that's fine
        }
        // Also run a simple query to ensure any pending operations complete
        await this.exec("SELECT 1");
    }

    /**
     * Close the database connection
     */
    async close(): Promise<void> {
        await this.sqlite3.close(this.db);
    }
}
