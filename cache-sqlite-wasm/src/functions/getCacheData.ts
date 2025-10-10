import type { Database } from "sql.js";

export function getCacheData<T>(
    db: Database,
    namespace: string,
    key: string,
    maxAgeInSecs?: number,
): T | undefined {
    const now = Math.floor(Date.now() / 1000);

    const stmt = db.prepare("SELECT data, cached_at FROM cache_data WHERE namespace = ? AND key = ?");
    stmt.bind([namespace, key]);

    if (stmt.step()) {
        const row = stmt.getAsObject();
        const cachedAt = row.cached_at as number;

        // Check if expired
        if (maxAgeInSecs && now - cachedAt > maxAgeInSecs) {
            stmt.free();
            return undefined;
        }

        const data = JSON.parse(row.data as string) as T;
        stmt.free();
        return data;
    }

    stmt.free();
    return undefined;
}
