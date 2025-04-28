export interface NDKCacheAdapterSqliteWasmOptions {
    dbName?: string;
    wasmUrl?: string;
    useWorker?: boolean;
    workerUrl?: string;
}

export type WorkerMessage = {
    id: string;
    type: string;
    payload?: any;
};

export type WorkerResponse = {
    id: string;
    result?: any;
    error?: {
        message: string;
        stack?: string;
    };
};

export interface SQLQueryResult {
    columns: string[];
    values: any[][];
}

export type SQLDatabase = {
    run: (sql: string, params?: any[]) => void;
    exec: (sql: string, params?: any[]) => SQLQueryResult;
    export: () => Uint8Array;
    close: () => void;
    _scheduleSave: () => void;
    saveToIndexedDB: () => Promise<void>;
};
