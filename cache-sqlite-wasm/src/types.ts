// Import the actual sql.js types
import type initSqlJs from "sql.js";

export interface NDKCacheAdapterSqliteWasmOptions {
    dbName?: string;
    wasmUrl?: string;
    workerUrl?: string;

    // Metadata LRU cache
    metadataLruSize?: number; // Max metadata items (profiles, relay info, NIP-05) in LRU cache (default: 1000)
}

export type WorkerMessage = {
    id: string;
    type: string;
    payload?: unknown;
};

export type WorkerResponse = {
    id: string;
    result?: unknown;
    error?: {
        message: string;
        stack?: string;
    };
};

// Re-export sql.js types for convenience
export type QueryExecResult = initSqlJs.QueryExecResult;
export type Database = initSqlJs.Database;

// Extended Database type that includes our custom methods added in wasm-loader
export type SQLDatabase = Database & {
    _scheduleSave: () => void;
    saveToIndexedDB: () => Promise<void>;
};
