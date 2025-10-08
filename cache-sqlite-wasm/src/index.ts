import type NDK from "@nostr-dev-kit/ndk";
import type { NDKCacheAdapter } from "@nostr-dev-kit/ndk";
import { runMigrations } from "./db/migrations";
import { loadWasmAndInitDb } from "./db/wasm-loader";
import { addDecryptedEvent } from "./functions/addDecryptedEvent";
import { addUnpublishedEvent } from "./functions/addUnpublishedEvent";
import { discardUnpublishedEvent } from "./functions/discardUnpublishedEvent";
import { fetchProfile } from "./functions/fetchProfile";
import { fetchProfileSync } from "./functions/fetchProfileSync";
import { getAllProfilesSync } from "./functions/getAllProfilesSync";
import { getDecryptedEvent } from "./functions/getDecryptedEvent";
import { getEvent } from "./functions/getEvent";
import { getEventRelays } from "./functions/getEventRelays";
import { getProfiles } from "./functions/getProfiles";
import { getRelayStatus } from "./functions/getRelayStatus";
import { getUnpublishedEvents } from "./functions/getUnpublishedEvents";
import { loadCashuMintInfo } from "./functions/loadCashuMintInfo";
import { loadCashuMintKeys } from "./functions/loadCashuMintKeys";
import { query } from "./functions/query";
import { saveCashuMintInfo } from "./functions/saveCashuMintInfo";
import { saveCashuMintKeys } from "./functions/saveCashuMintKeys";
import { saveProfile } from "./functions/saveProfile";
import { setEvent } from "./functions/setEvent";
import { updateRelayStatus } from "./functions/updateRelayStatus";
import { getCacheStats } from "./functions/getCacheStats";
import type { NDKCacheAdapterSqliteWasmOptions, SQLDatabase, WorkerMessage, WorkerResponse } from "./types";

export type { CacheStats } from "./functions/getCacheStats";

export class NDKCacheAdapterSqliteWasm implements NDKCacheAdapter {
    public dbName: string;
    public wasmUrl?: string;
    public locking = false;
    public db?: SQLDatabase;
    public ndk?: NDK;
    public ready = false;

    // Conditionally defined sync methods
    public fetchProfileSync?: typeof fetchProfileSync;
    public getAllProfilesSync?: typeof getAllProfilesSync;

    // Web Worker integration
    private worker?: Worker;
    private workerUrl?: string;
    protected useWorker: boolean = false;
    private pendingRequests: Map<
        string,
        {
            resolve: (value: unknown) => void;
            reject: (reason?: unknown) => void;
        }
    > = new Map();
    private nextRequestId: number = 0;
    protected initializationPromise?: Promise<void>;

    constructor(options: NDKCacheAdapterSqliteWasmOptions = {}) {
        this.dbName = options.dbName || "ndk-cache";
        this.wasmUrl = options.wasmUrl;
        this.useWorker = options.useWorker ?? false;
        this.workerUrl = options.workerUrl;

        // Conditionally define sync methods only if not in worker mode
        if (!this.useWorker) {
            this.fetchProfileSync = fetchProfileSync.bind(this);
            this.getAllProfilesSync = getAllProfilesSync.bind(this);
        }
    }

    /**
     * Loads WASM, initializes DB, and runs migrations, or initializes the worker.
     */
    async initializeAsync(ndk?: NDK): Promise<void> {
        if (this.initializationPromise) {
            return this.initializationPromise;
        }

        this.initializationPromise = (async () => {
            this.ndk = ndk;
            if (this.useWorker) {
                await this.initializeWorker();
            } else {
                this.db = await loadWasmAndInitDb(this.wasmUrl, this.dbName);
                await runMigrations(this.db!);
            }
            this.ready = true;
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
        } else {
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
            const { id, result, error } = event.data;
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
            const errorMsg = event.message || 'unknown error';
            console.error(
                `[NDK-cache-sqlite-wasm] ❌ Worker failed: ${errorMsg}\n\n` +
                `🔧 Common solutions:\n` +
                `1. Copy worker.js and sql-wasm.wasm to your public directory:\n` +
                `   cp node_modules/@nostr-dev-kit/cache-sqlite-wasm/dist/worker.js public/\n` +
                `   cp node_modules/@nostr-dev-kit/cache-sqlite-wasm/dist/sql-wasm.wasm public/\n\n` +
                `2. Ensure your bundler serves the public directory correctly\n\n` +
                `3. Check browser DevTools Network tab for 404 errors on worker.js\n\n` +
                `Current workerUrl: ${effectiveWorkerUrl}`
            );
            // Reject all pending requests on catastrophic worker failure
            this.pendingRequests.forEach((p) => p.reject(new Error(`Worker failed: ${errorMsg}. Check console for setup instructions.`)));
            this.pendingRequests.clear();
        };

        // Send initialization config to worker
        await this.postWorkerMessage<WorkerResponse>({
            type: "init",
            payload: {
                dbName: this.dbName,
                wasmUrl: this.wasmUrl,
            },
        });
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
            this.worker!.postMessage({ ...message, id });
        });
    }

    // Modular method bindings (public field initializers)
    public setEvent = setEvent.bind(this);
    public getEvent = getEvent.bind(this);
    public getEventRelays = getEventRelays.bind(this);
    public fetchProfile = fetchProfile.bind(this);
    public saveProfile = saveProfile.bind(this);
    public updateRelayStatus = updateRelayStatus.bind(this);
    public getRelayStatus = getRelayStatus.bind(this);
    public getDecryptedEvent = getDecryptedEvent.bind(this);
    public addDecryptedEvent = addDecryptedEvent.bind(this);
    public addUnpublishedEvent = addUnpublishedEvent.bind(this);
    public getUnpublishedEvents = getUnpublishedEvents.bind(this);
    public discardUnpublishedEvent = discardUnpublishedEvent.bind(this);
    public query = query.bind(this);
    public getProfiles = getProfiles.bind(this);
    public getCacheStats = getCacheStats.bind(this);

    // Cashu mint caching
    public async loadCashuMintInfo(mintUrl: string, maxAgeInSecs?: number) {
        await this.ensureInitialized();
        if (!this.db) return undefined;
        return loadCashuMintInfo(this.db, mintUrl, maxAgeInSecs);
    }

    public async saveCashuMintInfo(mintUrl: string, info: import("@nostr-dev-kit/ndk").CashuMintInfo) {
        await this.ensureInitialized();
        if (!this.db) return;
        saveCashuMintInfo(this.db, mintUrl, info);
    }

    public async loadCashuMintKeys(mintUrl: string, maxAgeInSecs?: number) {
        await this.ensureInitialized();
        if (!this.db) return undefined;
        return loadCashuMintKeys(this.db, mintUrl, maxAgeInSecs);
    }

    public async saveCashuMintKeys(mintUrl: string, keys: import("@nostr-dev-kit/ndk").CashuMintKeys[]) {
        await this.ensureInitialized();
        if (!this.db) return;
        saveCashuMintKeys(this.db, mintUrl, keys);
    }

    public async ensureInitialized(): Promise<void> {
        if (this.ready) return;
        if (this.initializationPromise) {
            await this.initializationPromise;
        }
    }
}

export default NDKCacheAdapterSqliteWasm;
