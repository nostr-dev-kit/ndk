/**
 * Type definitions for cache-sqlite-wasm
 */

import type { WaSqliteDatabase, QueryExecResult } from "./db/wa-sqlite-db";

export interface NDKCacheAdapterSqliteWasmOptions {
    /** Database name (used for OPFS path and migration from IndexedDB) */
    dbName?: string;

    /** URL to the worker.js file */
    workerUrl?: string;

    /** Max metadata items (profiles, relay info, NIP-05) in LRU cache (default: 1000) */
    metadataLruSize?: number;
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

/** Re-export wa-sqlite types */
export type Database = WaSqliteDatabase;
export type { QueryExecResult };

/** Persistence mode used by the worker */
export type PersistenceMode = "opfs" | "memory";
