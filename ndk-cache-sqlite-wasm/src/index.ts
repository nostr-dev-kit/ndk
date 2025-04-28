import type { NDKCacheAdapter } from "@nostr-dev-kit/ndk";
import type { NDKCacheAdapterSqliteWasmOptions, WorkerMessage, WorkerResponse, SQLDatabase } from "./types";
import { loadWasmAndInitDb } from "./db/wasm-loader";
import { runMigrations } from "./db/migrations";
import { setEvent } from "./functions/setEvent";
import { getEvent } from "./functions/getEvent";
import { fetchProfile } from "./functions/fetchProfile";
import { saveProfile } from "./functions/saveProfile";
import { fetchProfileSync } from "./functions/fetchProfileSync";
import { getAllProfilesSync } from "./functions/getAllProfilesSync";
import { getProfiles } from "./functions/getProfiles";
import { updateRelayStatus } from "./functions/updateRelayStatus";
import { getRelayStatus } from "./functions/getRelayStatus";
import { getDecryptedEvent } from "./functions/getDecryptedEvent";
import { addDecryptedEvent } from "./functions/addDecryptedEvent";
import { addUnpublishedEvent } from "./functions/addUnpublishedEvent";
import { getUnpublishedEvents } from "./functions/getUnpublishedEvents";
import { discardUnpublishedEvent } from "./functions/discardUnpublishedEvent";
import { query } from "./functions/query";
import NDK from "@nostr-dev-kit/ndk";

export class NDKCacheAdapterSqliteWasm implements NDKCacheAdapter {
    public dbName: string;
    public wasmUrl?: string;
    public locking = false;
    public db?: SQLDatabase;
    public ndk?: NDK;

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
    async initialize(ndk?: NDK): Promise<void> {
        this.ndk = ndk;
        if (this.useWorker) {
            await this.initializeWorker();
        } else {
            this.db = await loadWasmAndInitDb(this.wasmUrl, this.dbName);
            await runMigrations(this.db);
        }
    }

    /**
     * Initializes the Web Worker, sets up message handlers, and sends the init message.
     */
    private async initializeWorker(): Promise<void> {
        console.log("Initializing Web Worker...");
        let effectiveWorkerUrl = this.workerUrl;

        if (!effectiveWorkerUrl) {
            try {
                // This relies on bundler support for URL constructors with relative paths
                effectiveWorkerUrl = new URL("./worker.js", import.meta.url).toString();
                console.log("Determined worker URL automatically:", effectiveWorkerUrl);
            } catch (e) {
                console.error("Failed to determine worker URL automatically. Please provide 'workerUrl' option.", e);
                throw new Error("Worker URL configuration error.");
            }
        } else {
            console.log("Using provided worker URL:", effectiveWorkerUrl);
        }

        // Use module type for imports
        console.log("Creating Web Worker with URL:", effectiveWorkerUrl);
        try {
            this.worker = new Worker(effectiveWorkerUrl, { type: "module" });
            console.log("Web Worker created successfully");
        } catch (err: any) {
            const msg = err && err.message ? err.message.toLowerCase() : "";
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
            console.log("Received message from worker:", event.data);
            const { id, result, error } = event.data;
            const pending = this.pendingRequests.get(id);
            if (pending) {
                if (error) {
                    console.error("Error from worker:", error);
                    pending.reject(new Error(`Worker error: ${error.message || error}`));
                } else {
                    console.log("Resolving pending request:", id);
                    pending.resolve(result);
                }
                this.pendingRequests.delete(id);
            }
        };

        this.worker.onerror = (event: ErrorEvent) => {
            console.error("Unhandled worker error:", event.message, event);
            // Reject all pending requests on catastrophic worker failure
            this.pendingRequests.forEach((p) => p.reject(new Error(`Worker failed: ${event.message}`)));
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
            console.error("Worker not initialized");
            return Promise.reject(new Error("Worker not initialized"));
        }
        const id = `req-${this.nextRequestId++}`;
        console.log(`Posting message to worker (${id}):`, message);
        return new Promise((resolve, reject) => {
            this.pendingRequests.set(id, {
                resolve: resolve as (value: unknown) => void,
                reject: reject as (reason?: unknown) => void,
            });
            this.worker!.postMessage({ ...message, id });
            console.log(`Message posted to worker (${id})`);
        });
    }

    // Modular method bindings (public field initializers)
    public setEvent = setEvent.bind(this);
    public getEvent = getEvent.bind(this);
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
}

export default NDKCacheAdapterSqliteWasm;
