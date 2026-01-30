import type NDK from "@nostr-dev-kit/ndk";
import type { NDKCacheAdapter, NDKEvent } from "@nostr-dev-kit/ndk";
import { addDecryptedEvent } from "./functions/addDecryptedEvent";
import { addUnpublishedEvent } from "./functions/addUnpublishedEvent";
import { discardUnpublishedEvent } from "./functions/discardUnpublishedEvent";
import { fetchProfile } from "./functions/fetchProfile";
import { getCacheData } from "./functions/getCacheData";
import { getCacheStats } from "./functions/getCacheStats";
import { getDecryptedEvent } from "./functions/getDecryptedEvent";
import { getEvent } from "./functions/getEvent";
import { getProfiles } from "./functions/getProfiles";
import { getRelayStatus } from "./functions/getRelayStatus";
import { getUnpublishedEvents } from "./functions/getUnpublishedEvents";
import { loadNip05 } from "./functions/loadNip05";
import { query } from "./functions/query";
import { saveNip05 } from "./functions/saveNip05";
import { saveProfile } from "./functions/saveProfile";
import { setCacheData } from "./functions/setCacheData";
import { setEvent } from "./functions/setEvent";
import { updateRelayStatus } from "./functions/updateRelayStatus";
import type { NDKCacheAdapterSqliteWasmOptions, WorkerMessage, WorkerResponse } from "./types";
import { decodeEvents } from "./binary/decoder";
import { MetadataLRUCache } from "./cache/metadata-lru";
import { PACKAGE_VERSION } from "./version";

export type { CacheStats } from "./functions/getCacheStats";
export type { ProfileFilterDescriptor } from "./functions/getProfiles";
export { MetadataLRUCache } from "./cache/metadata-lru";

export class NDKCacheAdapterSqliteWasm implements NDKCacheAdapter {
    public dbName: string;
    public locking = false;
    public ndk?: NDK;
    public ready = false;

    // Web Worker integration
    private worker?: Worker;
    private workerUrl?: string;
    private pendingRequests: Map<
        string,
        {
            resolve: (value: unknown) => void;
            reject: (reason?: unknown) => void;
        }
    > = new Map();
    private nextRequestId: number = 0;
    protected initializationPromise?: Promise<void>;

    // Degraded mode for WASM failures (e.g., iOS Lockdown Mode)
    protected degradedMode = false;

    // Persistence mode (set after worker initialization)
    private persistenceMode: "opfs" | "memory" | "unknown" = "unknown";

    // Performance optimizations
    protected metadataCache: MetadataLRUCache;

    // In-memory set of cached event IDs for O(1) duplicate checking
    private cachedEventIds = new Set<string>();

    /**
     * Track a cached event ID for duplicate checking
     */
    public addCachedEventId(eventId: string): void {
        this.cachedEventIds.add(eventId);
    }

    /**
     * Check if an event ID is already cached
     */
    public hasCachedEvent(eventId: string): boolean {
        return this.cachedEventIds.has(eventId);
    }

    // Event batching for worker mode
    private eventBatch: Array<{ event: any; relay?: string; resolve: () => void; reject: (err: Error) => void }> = [];
    private batchTimeout: ReturnType<typeof setTimeout> | null = null;
    private readonly BATCH_DELAY_MS = 0; // Use microtask (0ms) for immediate batching
    private readonly MAX_BATCH_SIZE = 100; // Maximum events per batch

    constructor(options: NDKCacheAdapterSqliteWasmOptions = {}) {
        this.dbName = options.dbName || "ndk-cache";
        this.workerUrl = options.workerUrl;

        // Initialize metadata cache
        this.metadataCache = new MetadataLRUCache(options.metadataLruSize || 1000);
    }

    /**
     * Initializes the worker.
     */
    async initializeAsync(ndk?: NDK): Promise<void> {
        if (this.initializationPromise) {
            return this.initializationPromise;
        }

        this.initializationPromise = (async () => {
            this.ndk = ndk;
            try {
                await this.initializeWorker();
                this.ready = true;
            } catch (error) {
                this.degradedMode = true;

                const errorMsg = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
                const isWasmError =
                    errorMsg.includes('wasm') ||
                    errorMsg.includes('webassembly') ||
                    errorMsg.includes('compile') ||
                    errorMsg.includes('instantiate');

                if (isWasmError) {
                    console.warn(
                        '[NDK Cache SQLite WASM] Running in degraded mode - WebAssembly unavailable.\n' +
                        'This is expected in:\n' +
                        '  • iOS/iPadOS Lockdown Mode\n' +
                        '  • Browsers with WASM disabled\n' +
                        '  • Restricted security environments\n\n' +
                        'The app will continue to function normally, but events will not be cached locally.\n' +
                        'All data will be fetched directly from Nostr relays.'
                    );
                } else {
                    console.error(
                        '[NDK Cache SQLite WASM] Initialization failed, running in degraded mode.\n' +
                        'Cache will not persist data, but app will continue to function.\n' +
                        'Error:', error
                    );
                }
            }
        })();

        return this.initializationPromise;
    }

    /**
     * Initializes the Web Worker, sets up message handlers, and sends the init message.
     */
    private async initializeWorker(): Promise<void> {
        let effectiveWorkerUrl = this.workerUrl;

        if (!effectiveWorkerUrl) {
            try {
                // This relies on bundler support for URL constructors with relative paths
                effectiveWorkerUrl = new URL("./worker.js", import.meta.url).toString();
            } catch (e) {
                console.error("Failed to determine worker URL automatically. Please provide 'workerUrl' option.", e);
                throw new Error("Worker URL configuration error.");
            }
        }

        // Use module type for imports
        try {
            this.worker = new Worker(effectiveWorkerUrl, { type: "module" });
        } catch (err: unknown) {
            function hasMessage(e: unknown): e is { message: string } {
                return (
                    typeof e === "object" &&
                    e !== null &&
                    "message" in e &&
                    typeof (e as { message: unknown }).message === "string"
                );
            }
            const msg = hasMessage(err) ? err.message.toLowerCase() : "";
            if (
                msg.includes("404") ||
                msg.includes("not found") ||
                msg.includes("failed to fetch") ||
                msg.includes("networkerror") ||
                msg.includes("could not load") ||
                msg.includes("cannot find")
            ) {
                console.error(
                    `[NDK-cache-sqlite-wasm] Failed to load worker file at "${effectiveWorkerUrl}".\n` +
                        "This usually means the worker asset is missing or not served correctly (e.g., 404 error).\n" +
                        "Please ensure the worker file exists at the specified URL and is accessible to the browser. " +
                        "Check your bundler configuration and asset paths. See the documentation for details.",
                    err,
                );
            } else {
                console.error(`[NDK-cache-sqlite-wasm] Error while creating worker at "${effectiveWorkerUrl}":`, err);
            }
            throw err;
        }

        this.worker.onmessage = (event: MessageEvent) => {
            const data = event.data;

            // Handle warmup profiles message
            if (data.type === 'warmupProfiles') {
                this.handleProfileWarmup(data.profiles);
                return;
            }

            // Handle protocol metadata
            if (data._protocol && data._protocol !== "ndk-cache-sqlite") {
                console.error(
                    "[NDK Cache SQLite WASM] ❌ Wrong worker protocol!",
                    `\n\nExpected: ndk-cache-sqlite`,
                    `\nReceived: ${data._protocol}`,
                    "\n\nThis means the wrong worker instance was passed to the cache adapter.",
                    "\nMake sure you are using the correct worker file for the cache.",
                );
                return;
            }

            // Check version compatibility (warn if mismatch)
            if (data._version && data._version !== PACKAGE_VERSION) {
                console.warn(
                    "[NDK Cache SQLite WASM] ⚠️  Worker version mismatch!",
                    `\nLibrary version: ${PACKAGE_VERSION}`,
                    `\nWorker version: ${data._version}`,
                    "\n\nUpdate your worker file:",
                    "\n  cp node_modules/@nostr-dev-kit/cache-sqlite-wasm/dist/worker.js public/",
                );
            }

            const { id, result, error } = data;
            const pending = this.pendingRequests.get(id);
            if (pending) {
                if (error) {
                    pending.reject(new Error(`Worker error: ${error.message || error}`));
                } else {
                    pending.resolve(result);
                }
                this.pendingRequests.delete(id);
            }
        };

        this.worker.onerror = (event: ErrorEvent) => {
            const errorMsg = event.message || "unknown error";
            console.error(
                `[NDK-cache-sqlite-wasm] ❌ Worker failed: ${errorMsg}\n\n` +
                    `🔧 Common solutions:\n` +
                    `1. Copy worker.js and wa-sqlite.wasm to your public directory:\n` +
                    `   cp node_modules/@nostr-dev-kit/cache-sqlite-wasm/dist/worker.js public/\n` +
                    `   cp node_modules/@nostr-dev-kit/cache-sqlite-wasm/dist/wa-sqlite.wasm public/\n\n` +
                    `2. Ensure COOP/COEP headers are set for OPFS support:\n` +
                    `   Cross-Origin-Opener-Policy: same-origin\n` +
                    `   Cross-Origin-Embedder-Policy: require-corp\n\n` +
                    `3. Check browser DevTools Network tab for 404 errors on worker.js\n\n` +
                    `Current workerUrl: ${effectiveWorkerUrl}`,
            );
            // Reject all pending requests on catastrophic worker failure
            this.pendingRequests.forEach((p) =>
                p.reject(new Error(`Worker failed: ${errorMsg}. Check console for setup instructions.`)),
            );
            this.pendingRequests.clear();
        };

        // Send initialization config to worker
        const initResult = await this.postWorkerMessage<{ initialized: boolean; persistenceMode: "opfs" | "memory" }>({
            type: "init",
            payload: {
                dbName: this.dbName,
            },
        });

        // Capture persistence mode from worker
        if (initResult?.persistenceMode) {
            this.persistenceMode = initResult.persistenceMode;
            console.log(`[NDK Cache SQLite WASM] Initialized with ${this.persistenceMode} persistence`);
        }
    }

    /**
     * Helper to send messages to the worker and track responses.
     */
    protected async postWorkerMessage<T>(message: Omit<WorkerMessage, "id">): Promise<T> {
        if (!this.worker) {
            return Promise.reject(new Error("Worker not initialized"));
        }
        const id = `req-${this.nextRequestId++}`;
        return new Promise((resolve, reject) => {
            this.pendingRequests.set(id, {
                resolve: resolve as (value: unknown) => void,
                reject: reject as (reason?: unknown) => void,
            });
            const msg = { ...message, id };
            this.worker!.postMessage(msg);
        });
    }

    /**
     * Handles profile warmup data from worker
     */
    private handleProfileWarmup(profiles: Array<{ pubkey: string; profile: any }>): void {
        for (const { pubkey, profile } of profiles) {
            this.metadataCache.setProfile(pubkey, profile);
        }
    }

    /**
     * Flushes the batched events to the worker
     */
    private async flushEventBatch(): Promise<void> {
        if (this.eventBatch.length === 0) return;

        const batch = this.eventBatch;
        this.eventBatch = [];
        this.batchTimeout = null;

        try {
            await this.postWorkerMessage({
                type: "setEventBatch",
                payload: {
                    events: batch.map(item => ({
                        event: item.event,
                        relay: item.relay
                    }))
                }
            });
            batch.forEach(item => item.resolve());
        } catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            batch.forEach(item => item.reject(err));
        }
    }

    /**
     * Adds an event to the batch and schedules a flush
     * Protected so setEvent can access it
     */
    protected batchEvent(event: any, relay?: string): Promise<void> {
        // O(1) check: skip if already cached (avoids worker message entirely)
        if (event.id && this.cachedEventIds.has(event.id)) {
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            // Add to Set immediately to prevent duplicates within same batch
            if (event.id) {
                this.cachedEventIds.add(event.id);
            }

            this.eventBatch.push({ event, relay, resolve, reject });

            // Flush immediately if batch is full
            if (this.eventBatch.length >= this.MAX_BATCH_SIZE) {
                if (this.batchTimeout !== null) {
                    clearTimeout(this.batchTimeout);
                    this.batchTimeout = null;
                }
                this.flushEventBatch();
            } else if (this.batchTimeout === null) {
                // Schedule flush after delay
                this.batchTimeout = setTimeout(() => {
                    this.flushEventBatch();
                }, this.BATCH_DELAY_MS);
            }
        });
    }

    // Cache operation methods
    public async setEvent(event: Parameters<typeof setEvent>[0], filters: Parameters<typeof setEvent>[1], relay?: Parameters<typeof setEvent>[2]): Promise<void> {
        return setEvent.call(this, event, filters, relay);
    }

    public async getEvent(eventId: string): Promise<NDKEvent | null> {
        return getEvent.call(this, eventId);
    }

    public async fetchProfile(pubkey: Parameters<typeof fetchProfile>[0]): ReturnType<typeof fetchProfile> {
        return fetchProfile.call(this, pubkey);
    }

    public async saveProfile(pubkey: Parameters<typeof saveProfile>[0], profile: Parameters<typeof saveProfile>[1]): ReturnType<typeof saveProfile> {
        return saveProfile.call(this, pubkey, profile);
    }

    public async updateRelayStatus(relayUrl: Parameters<typeof updateRelayStatus>[0], status: Parameters<typeof updateRelayStatus>[1]): ReturnType<typeof updateRelayStatus> {
        return updateRelayStatus.call(this, relayUrl, status);
    }

    public async getRelayStatus(relayUrl: Parameters<typeof getRelayStatus>[0]): ReturnType<typeof getRelayStatus> {
        return getRelayStatus.call(this, relayUrl);
    }

    public async getDecryptedEvent(eventId: Parameters<typeof getDecryptedEvent>[0]): ReturnType<typeof getDecryptedEvent> {
        return getDecryptedEvent.call(this, eventId);
    }

    public async addDecryptedEvent(wrapperId: string, decryptedEvent: NDKEvent): Promise<void> {
        return addDecryptedEvent.call(this, wrapperId, decryptedEvent);
    }

    public async addUnpublishedEvent(event: NDKEvent, relayUrls: string[], lastTryAt: number = Date.now()): Promise<void> {
        return addUnpublishedEvent.call(this, event, relayUrls, lastTryAt);
    }

    public async getUnpublishedEvents(): ReturnType<typeof getUnpublishedEvents> {
        return getUnpublishedEvents.call(this);
    }

    public async discardUnpublishedEvent(eventId: Parameters<typeof discardUnpublishedEvent>[0]): ReturnType<typeof discardUnpublishedEvent> {
        return discardUnpublishedEvent.call(this, eventId);
    }

    public query(subscription: Parameters<typeof query>[0]): ReturnType<typeof query> {
        return query.call(this, subscription);
    }

    public async getProfiles(filter: ((pubkey: string, profile: import("@nostr-dev-kit/ndk").NDKUserProfile) => boolean) | import("./functions/getProfiles").ProfileFilterDescriptor): Promise<Map<string, import("@nostr-dev-kit/ndk").NDKUserProfile> | undefined> {
        return getProfiles.call(this, filter);
    }

    public async getCacheStats(): ReturnType<typeof getCacheStats> {
        return getCacheStats.call(this);
    }

    public async loadNip05(nip05: Parameters<typeof loadNip05>[0]): ReturnType<typeof loadNip05> {
        return loadNip05.call(this, nip05);
    }

    public async saveNip05(nip05: Parameters<typeof saveNip05>[0], profile: Parameters<typeof saveNip05>[1]): ReturnType<typeof saveNip05> {
        return saveNip05.call(this, nip05, profile);
    }

    /**
     * Get metadata cache status
     */
    public getMetadataCacheStatus() {
        return this.metadataCache.getMetrics();
    }

    /**
     * Clear metadata cache
     */
    public clearMetadataCache(): void {
        this.metadataCache.clear();
    }

    /**
     * Get the current persistence mode.
     * - "opfs": Data persists to Origin Private File System (best, no main thread blocking)
     * - "memory": Data is only in memory (no persistence across page reloads)
     * - "unknown": Worker not yet initialized
     */
    public getPersistenceMode(): "opfs" | "memory" | "unknown" {
        return this.persistenceMode;
    }

    // Generic cache data storage
    public async getCacheData<T>(namespace: string, key: string, maxAgeInSecs?: number): Promise<T | undefined> {
        await this.ensureInitialized();
        const result = await this.postWorkerMessage<T | undefined>({
            type: "getCacheData",
            payload: { namespace, key, maxAgeInSecs }
        });
        return result;
    }

    public async setCacheData<T>(namespace: string, key: string, data: T): Promise<void> {
        await this.ensureInitialized();
        await this.postWorkerMessage({
            type: "setCacheData",
            payload: { namespace, key, data }
        });
    }

    public async ensureInitialized(): Promise<void> {
        if (this.ready) return;
        if (this.degradedMode) return; // Gracefully skip if in degraded mode
        if (this.initializationPromise) {
            await this.initializationPromise;
        }
    }
}

export default NDKCacheAdapterSqliteWasm;
