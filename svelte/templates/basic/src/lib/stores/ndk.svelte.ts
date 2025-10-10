import NDKCacheSqliteWasm from "@nostr-dev-kit/cache-sqlite-wasm";
import { NDKSvelte } from '@nostr-dev-kit/svelte';
import { browser } from '$app/environment';

export const ndk = new NDKSvelte({
    explicitRelayUrls: [
        'wss://relay.damus.io',
        'wss://relay.nostr.band',
        'wss://nos.lol'
    ],
    autoConnectUserRelays: true,
    autoFetchUserMutelist: true,
    initialValidationRatio: 1.0,
    lowestValidationRatio: 0.1,
});

// Initialize the cache and workers in browser
export const ndkReady = (async () => {
    if (!browser) return;

    try {
        // Import and initialize signature verification worker
        const SigVerifyWorkerModule = await import("../sig-verify.worker.ts?worker");
        const sigVerifyWorker = new SigVerifyWorkerModule.default();

        // Initialize SQLite WASM cache with worker mode
        const cacheAdapter = new NDKCacheSqliteWasm({
            dbName: "ndk-cache",
            useWorker: true,
            workerUrl: "/worker.js",
            wasmUrl: "/sql-wasm.wasm",
        });

        // Initialize the cache with NDK
        await cacheAdapter.initializeAsync(ndk);

        // Set cache and worker on NDK
        ndk.cacheAdapter = cacheAdapter;
        ndk.signatureVerificationWorker = sigVerifyWorker;

        console.log("✅ SQLite WASM cache initialized");

        // Connect to relays
        ndk.connect();
    } catch (error) {
        console.error("❌ Failed to initialize cache:", error);
        // Still connect even if cache fails
        ndk.connect();
    }
})();
