import type { Database } from "../types";

export async function getCacheData<T>(db: Database, namespace: string, key: string, maxAgeInSecs?: number): Promise<T | undefined> {
    const now = Math.floor(Date.now() / 1000);

    const row = await db.queryOne(
        "SELECT data, cached_at FROM cache_data WHERE namespace = ? AND key = ?",
        [namespace, key]
    );

    if (row) {
        const cachedAt = row.cached_at as number;

        // Check if expired
        if (maxAgeInSecs && now - cachedAt > maxAgeInSecs) {
            return undefined;
        }

        return JSON.parse(row.data as string) as T;
    }

    return undefined;
}
