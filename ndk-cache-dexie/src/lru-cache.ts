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
    private _warmUp?: WarmUpFunction<T>;

    constructor(options: CacheOptions<T>) {
        this.debug = options.debug;
        this.options = options;
        if (options.maxSize > 0) {
            this.cache = new LRUCache({ maxSize: options.maxSize });
            setInterval(() => this.dump(), 1000 * 10);
        }
    }

    set warmUp(fn: WarmUpFunction<T>) {
        this.debug("Setting warmUp function");
        this._warmUp = fn;
        this._warmUp(this, this.debug);
    }

    public get(key: string): T | null | undefined {
        return this.cache?.get(key);
    }

    public set(key: string, value: T, dirty = true) {
        this.cache?.set(key, value);
        if (dirty) this.dirtyKeys.add(key);
    }

    public size(): number {
        return this.cache?.size || 0;
    }

    private async dump() {
        if (this.dirtyKeys.size > 0) {
            await this.options.dump(this.dirtyKeys, this.cache!);
            this.dirtyKeys.clear();
        }
    }
}
