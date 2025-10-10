import type { Database } from "sql.js";

export function setCacheData<T>(db: Database, namespace: string, key: string, data: T): void {
    const now = Math.floor(Date.now() / 1000);
    const dataJson = JSON.stringify(data);

    db.run("INSERT OR REPLACE INTO cache_data (namespace, key, data, cached_at) VALUES (?, ?, ?, ?)", [
        namespace,
        key,
        dataJson,
        now,
    ]);
}
