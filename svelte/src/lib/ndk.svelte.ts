import type { NDKConstructorParams } from "@nostr-dev-kit/ndk";
import { NDKSvelte } from "./ndk-svelte.svelte.js";

export interface CreateNDKOptions extends Partial<NDKConstructorParams> {
    /**
     * Auto-connect to relays (default: true)
     */
    autoConnect?: boolean;

    /**
     * Cache adapter configuration
     * - true (default): Auto-detect and use SQLite WASM cache in browser
     * - false: Disable caching
     * - Custom adapter: Use provided cache adapter
     */
    cache?: boolean | NDKConstructorParams["cacheAdapter"];

    /**
     * Database name for SQLite WASM cache (default: 'ndk-cache')
     * Only used when cache is enabled and running in browser
     */
    cacheDbName?: string;
}

/**
 * Create and initialize an NDKSvelte instance with all reactive stores.
 *
 * This is the recommended and ONLY way to initialize NDK in ndk-svelte5 apps.
 * Returns an NDKSvelte instance with all stores namespaced under it:
 * - ndk.sessions - Session management
 * - ndk.wot - Web of Trust
 * - ndk.wallet - Wallet integration
 * - ndk.payments - Payment tracking
 * - ndk.mutes - Mute management
 * - ndk.pool - Pool monitoring
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { createNDK } from '@nostr-dev-kit/svelte';
 *
 *   // Simplest usage - uses default relays and auto-connects
 *   export const ndk = createNDK();
 *
 *   // Custom relays
 *   export const ndk = createNDK({
 *     explicitRelayUrls: ['wss://relay.damus.io', 'wss://nos.lol']
 *   });
 *
 *   // Disable auto-connect
 *   export const ndk = createNDK({ autoConnect: false });
 *   // Later: ndk.connect()
 *
 *   // Access reactive stores
 *   const session = ndk.sessions.current;
 *   const balance = ndk.wallet.balance;
 *   const score = ndk.wot.getScore(pubkey);
 * </script>
 * ```
 */
export function createNDK(options: CreateNDKOptions = {}): NDKSvelte {
    const { autoConnect = true, cache = true, cacheDbName = "ndk-cache", ...ndkOptions } = options;

    // Use default relays if none provided
    const explicitRelayUrls = ndkOptions.explicitRelayUrls;

    // Setup cache adapter if enabled and not already provided
    let cacheAdapter = ndkOptions.cacheAdapter;

    if (!cacheAdapter && cache !== false) {
        // Auto-detect environment and setup SQLite WASM cache in browser
        if (typeof window !== "undefined") {
            // Dynamically import to avoid bundling in non-browser environments
            import("@nostr-dev-kit/ndk-cache-sqlite-wasm")
                .then((mod) => {
                    const NDKCacheSqliteWasm = mod.default;
                    const adapter = new NDKCacheSqliteWasm({
                        dbName: cacheDbName,
                        wasmUrl: "https://sql.js.org/dist/sql-wasm.wasm",
                    });

                    // Store reference for NDK
                    cacheAdapter = adapter;

                    // Initialize cache
                    if (adapter.initializeAsync) {
                        return adapter.initializeAsync(ndk);
                    }
                })
                .then(() => {
                    console.log("✅ NDK cache initialized");
                })
                .catch((err) => {
                    console.warn("⚠️ Failed to initialize NDK cache:", err);
                });
        }
    }

    // Create NDKSvelte instance (stores initialized in constructor)
    const ndk = new NDKSvelte({
        ...ndkOptions,
        explicitRelayUrls,
        cacheAdapter: cache === false ? undefined : cacheAdapter || ndkOptions.cacheAdapter,
    });

    // Auto-connect if enabled
    if (autoConnect) {
        ndk.connect();
    }

    return ndk;
}
