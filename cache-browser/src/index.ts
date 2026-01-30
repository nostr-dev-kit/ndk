import NDKCacheDexie from "@nostr-dev-kit/cache-dexie";
import NDKCacheSqliteWasm from "@nostr-dev-kit/cache-sqlite-wasm";
import type NDK from "@nostr-dev-kit/ndk";
import type {
    Hexpubkey,
    NDKCacheAdapter,
    NDKEvent,
    NDKEventId,
    NDKFilter,
    NDKRelay,
    NDKSubscription,
    NDKUserProfile,
    ProfilePointer,
} from "@nostr-dev-kit/ndk";
import createDebug from "debug";
import { type AdapterType, clearPreferredAdapter, getPreferredAdapter, setPreferredAdapter } from "./storage";

const debug = createDebug("ndk:cache-browser");

export type NDKCacheBrowserOptions = {
    /**
     * Database name for the cache
     */
    dbName?: string;

    /**
     * URL to the SQLite WASM worker script (required for WASM adapter)
     */
    workerUrl?: string;

    /**
     * Enable debug logging
     */
    debug?: boolean;

    /**
     * Force a specific adapter (useful for testing)
     * If specified, skips auto-detection and localStorage persistence
     */
    forceAdapter?: "wasm" | "dexie";
};

/**
 * Browser-optimized cache adapter that automatically selects the best available
 * caching strategy for the current environment.
 *
 * Tries SQLite WASM first for optimal performance, automatically falls back to
 * IndexedDB (via Dexie) if WASM is unavailable (iOS Lockdown Mode, restricted browsers).
 *
 * Persists the successful adapter choice in localStorage to optimize subsequent loads.
 *
 * @example
 * ```typescript
 * import NDKCacheBrowser from '@nostr-dev-kit/cache-browser';
 *
 * const cacheAdapter = new NDKCacheBrowser({
 *   dbName: 'my-app',
 *   workerUrl: '/worker.js',
 *   wasmUrl: '/sql-wasm.wasm',
 *   debug: true
 * });
 *
 * const ndk = new NDK({
 *   cacheAdapter,
 *   // ... other options
 * });
 * ```
 */
export default class NDKCacheBrowser implements NDKCacheAdapter {
    private adapter: NDKCacheAdapter | null = null;
    private adapterType: AdapterType = "none";
    private options: NDKCacheBrowserOptions;
    private initPromise: Promise<void> | null = null;

    locking = true;

    constructor(options: NDKCacheBrowserOptions = {}) {
        this.options = options;

        if (options.debug) {
            createDebug.enable("ndk:cache-browser*");
        }
    }

    /**
     * Get the currently active adapter type
     */
    getAdapterType(): AdapterType {
        return this.adapterType;
    }

    /**
     * Get the underlying adapter instance (for advanced use cases)
     */
    getAdapter(): NDKCacheAdapter | null {
        return this.adapter;
    }

    /**
     * Initialize the cache adapter with automatic fallback logic
     */
    async initializeAsync(ndk: NDK): Promise<void> {
        // Return existing initialization promise if already in progress
        if (this.initPromise) {
            return this.initPromise;
        }

        this.initPromise = this._initialize(ndk);
        return this.initPromise;
    }

    private async _initialize(ndk: NDK): Promise<void> {
        debug("Initializing cache adapter");

        // If forceAdapter is specified, skip auto-detection
        if (this.options.forceAdapter) {
            debug("Forcing adapter: %s", this.options.forceAdapter);
            if (this.options.forceAdapter === "wasm") {
                await this.tryWasmAdapter(ndk);
            } else {
                await this.tryDexieAdapter();
            }
            return;
        }

        // Check for previously successful adapter
        const preferred = getPreferredAdapter();
        debug("Preferred adapter from storage: %s", preferred);

        // Build try order: preferred first, then the other
        const tryOrder: Array<"wasm" | "dexie"> = preferred === "dexie" ? ["dexie", "wasm"] : ["wasm", "dexie"];

        debug("Try order: %o", tryOrder);

        for (const adapterType of tryOrder) {
            if (adapterType === "wasm") {
                if (await this.tryWasmAdapter(ndk)) {
                    setPreferredAdapter("wasm");
                    debug("Successfully initialized with WASM adapter");
                    return;
                }
            } else if (adapterType === "dexie") {
                if (await this.tryDexieAdapter()) {
                    setPreferredAdapter("dexie");
                    debug("Successfully initialized with Dexie adapter");
                    return;
                }
            }
        }

        // Both adapters failed - operate in degraded mode (no persistent cache)
        debug("⚠️ All cache adapters failed - running in degraded mode (no persistent cache)");
        this.adapterType = "none";
        this.adapter = null;
    }

    private async tryWasmAdapter(ndk: NDK): Promise<boolean> {
        try {
            debug("Attempting to initialize WASM adapter");

            const wasmAdapter = new NDKCacheSqliteWasm({
                dbName: this.options.dbName || "ndk-cache",
                workerUrl: this.options.workerUrl,
            });

            await wasmAdapter.initializeAsync(ndk);

            // Check if the WASM adapter entered degraded mode
            // (indicates WASM is unavailable, e.g., iOS Lockdown Mode)
            // biome-ignore lint/suspicious/noExplicitAny: Accessing internal property not in interface
            if ((wasmAdapter as any).degradedMode) {
                debug("WASM adapter entered degraded mode - WASM unavailable");
                return false;
            }

            this.adapter = wasmAdapter;
            this.adapterType = "wasm";
            debug("✅ WASM adapter initialized successfully");
            return true;
        } catch (error) {
            debug("WASM adapter initialization failed: %o", error);
            return false;
        }
    }

    private async tryDexieAdapter(): Promise<boolean> {
        try {
            debug("Attempting to initialize Dexie adapter");

            const dexieAdapter = new NDKCacheDexie({
                dbName: this.options.dbName || "ndk-cache",
            });

            // Dexie initializes in constructor and has a warmUpPromise
            // Wait for warmup to complete (though not strictly required)
            // biome-ignore lint/suspicious/noExplicitAny: Accessing internal property not in interface
            if ((dexieAdapter as any).warmUpPromise) {
                // biome-ignore lint/suspicious/noExplicitAny: Accessing internal property not in interface
                await (dexieAdapter as any).warmUpPromise;
            }

            this.adapter = dexieAdapter;
            this.adapterType = "dexie";
            debug("✅ Dexie adapter initialized successfully");
            return true;
        } catch (error) {
            debug("Dexie adapter initialization failed: %o", error);
            return false;
        }
    }

    // Proxy all NDKCacheAdapter methods to the active adapter

    async query(subscription: NDKSubscription): Promise<NDKEvent[]> {
        if (!this.adapter) {
            return [];
        }
        const result = this.adapter.query(subscription);
        if (result instanceof Promise) {
            return await result;
        }
        return result;
    }

    async setEvent(event: NDKEvent, filters: NDKFilter[], relay?: NDKRelay): Promise<void> {
        if (!this.adapter) {
            return;
        }
        return this.adapter.setEvent(event, filters, relay);
    }

    async fetchProfile(pubkey: Hexpubkey): Promise<NDKUserProfile | null> {
        if (!this.adapter || !this.adapter.fetchProfile) {
            return null;
        }
        return this.adapter.fetchProfile(pubkey);
    }

    async saveProfile(pubkey: Hexpubkey, profile: NDKUserProfile): Promise<void> {
        if (!this.adapter || !this.adapter.saveProfile) {
            return;
        }
        return this.adapter.saveProfile(pubkey, profile);
    }

    async loadNip05?(nip05: string, maxAgeForMissing?: number): Promise<ProfilePointer | null | "missing"> {
        if (!this.adapter || !this.adapter.loadNip05) {
            return "missing";
        }
        return this.adapter.loadNip05(nip05, maxAgeForMissing);
    }

    saveNip05?(nip05: string, profile: ProfilePointer | null): void {
        if (!this.adapter || !this.adapter.saveNip05) {
            return;
        }
        this.adapter.saveNip05(nip05, profile);
    }

    async getProfiles?(
        filter:
            | ((pubkey: Hexpubkey, profile: NDKUserProfile) => boolean)
            | { field?: string; fields?: string[]; contains: string },
    ): Promise<Map<Hexpubkey, NDKUserProfile> | undefined> {
        if (!this.adapter || !this.adapter.getProfiles) {
            return undefined;
        }
        return this.adapter.getProfiles(filter);
    }

    async deleteEventIds?(eventIds: NDKEventId[]): Promise<void> {
        if (!this.adapter || !this.adapter.deleteEventIds) {
            return;
        }
        return this.adapter.deleteEventIds(eventIds);
    }
}

// Re-export storage utilities for manual control
export { clearPreferredAdapter, getPreferredAdapter, setPreferredAdapter };
