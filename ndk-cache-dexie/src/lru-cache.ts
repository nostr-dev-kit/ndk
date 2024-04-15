import { Table } from "dexie";
import { LRUCache } from "typescript-lru-cache";

export type WarmUpFunction<T> = (
    cacheHandler: CacheHandler<T>,
    debug: debug.IDebugger
) => Promise<void>;

export interface CacheOptions<T> {
    maxSize: number;
    dump: (dirtyKeys: Set<string>, cache: LRUCache<string, T>) => Promise<void>;
    debug: debug.IDebugger;
}

export class CacheHandler<T> {
    private cache?: LRUCache<string, T>;
    private dirtyKeys: Set<string> = new Set();
    private options: CacheOptions<T>;
    private debug: debug.IDebugger;

    constructor(options: CacheOptions<T>) {
        this.debug = options.debug;
        this.options = options;
        if (options.maxSize > 0) {
            this.cache = new LRUCache({ maxSize: options.maxSize });
            setInterval(() => this.dump(), 1000 * 10);
        }
    }

    public get(key: string): T | null | undefined {
        return this.cache?.get(key);
    }

    public async getWithFallback(key: string, table: Table) {
        let entry = this.get(key);
        if (!entry) {
            this.debug(`Cache miss for key ${JSON.stringify(key)}`);
            entry = await table.get(key);
            if (entry) {
                this.set(key, entry);
            }
        }
        return entry;
    }

    public async getManyWithFallback(keys: string[], table: Table) {
        const entries: T[] = [];
        const missingKeys: string[] = [];
        // get all entries from cache without hitting the database
        for (const key of keys) {
            const entry = this.get(key);
            if (entry) entries.push(entry);
            else missingKeys.push(key);
        }

        if (entries.length > 0) {
            this.debug(`Cache hit for keys ${entries.length} and miss for ${missingKeys.length} keys`, missingKeys);
        }

        // get missing entries from the database
        if (missingKeys.length > 0) {
            const startTime = Date.now();
            const missingEntries = await table.bulkGet(missingKeys);
            const endTime = Date.now();
            let foundKeys = 0;

            for (const entry of missingEntries) {
                if (entry) {
                    this.set(entry.id, entry);
                    entries.push(entry);
                    foundKeys++;
                }
            }
            this.debug(`Time spent querying database: ${endTime - startTime}ms for ${missingKeys.length} keys, which added ${foundKeys} entries to the cache`);
        }

        return entries;
    }

    public set(key: string, value: T, dirty = true) {
        this.cache?.set(key, value);
        if (dirty) this.dirtyKeys.add(key);
    }

    public size(): number {
        return this.cache?.size || 0;
    }

    public delete(key: string) {
        this.cache?.delete(key);
        this.dirtyKeys.add(key);
    }

    private async dump() {
        if (this.dirtyKeys.size > 0) {
            await this.options.dump(this.dirtyKeys, this.cache!);
            this.dirtyKeys.clear();
        }
    }
}
