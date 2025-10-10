import type { Database, RunResult, Statement } from "better-sqlite3";

export interface NDKCacheAdapterSqliteOptions {
    dbPath?: string;
    dbName?: string;
}

// Re-export better-sqlite3 types for convenience
export type SQLiteDatabase = Database;
export type SQLiteStatement = Statement;
export type SQLiteRunResult = RunResult;

// Query result type for compatibility with WASM adapter
export interface QueryExecResult {
    columns: string[];
    values: unknown[][];
}
