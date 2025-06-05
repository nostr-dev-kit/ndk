import Database from "better-sqlite3";
import { runMigrations } from "./migrations";
import type { SQLiteDatabase, QueryExecResult } from "../types";
import * as path from "path";
import * as fs from "fs";

/**
 * Database wrapper class for better-sqlite3
 * Provides compatibility layer with the WASM adapter interface
 */
export class DatabaseWrapper {
    private db: SQLiteDatabase;
    private dbPath: string;

    constructor(dbPath: string) {
        this.dbPath = dbPath;

        // Ensure directory exists
        const dir = path.dirname(dbPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        this.db = new Database(dbPath);

        // Enable WAL mode for better performance
        this.db.pragma("journal_mode = WAL");

        // Run migrations
        runMigrations(this.db);
    }

    /**
     * Get the underlying database instance
     */
    getDatabase(): SQLiteDatabase {
        return this.db;
    }

    /**
     * Execute SQL statements (compatibility with WASM adapter)
     */
    exec(sql: string): void {
        this.db.exec(sql);
    }

    /**
     * Prepare a statement
     */
    prepare(sql: string) {
        return this.db.prepare(sql);
    }

    /**
     * Execute a query and return results in WASM-compatible format
     */
    queryExec(sql: string, params?: unknown[]): QueryExecResult[] {
        try {
            const stmt = this.db.prepare(sql);
            const rows = params ? stmt.all(...params) : stmt.all();

            if (rows.length === 0) {
                return [];
            }

            // Convert to WASM-compatible format
            const columns = Object.keys(rows[0] as Record<string, unknown>);
            const values = rows.map((row) => columns.map((col) => (row as Record<string, unknown>)[col]));

            return [
                {
                    columns,
                    values,
                },
            ];
        } catch (error) {
            console.error("Query execution error:", error);
            return [];
        }
    }

    /**
     * Close the database connection
     */
    close(): void {
        this.db.close();
    }

    /**
     * Get database path
     */
    getPath(): string {
        return this.dbPath;
    }
}

/**
 * Initialize database with given path and name
 */
export function initializeDatabase(dbPath?: string, dbName?: string): DatabaseWrapper {
    const finalPath = dbPath || path.join(process.cwd(), "data", `${dbName || "ndk-cache"}.db`);
    return new DatabaseWrapper(finalPath);
}
