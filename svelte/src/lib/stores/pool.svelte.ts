import type NDK from "@nostr-dev-kit/ndk";
import type { NDKRelay } from "@nostr-dev-kit/ndk";

export type RelayStatus = "connected" | "connecting" | "disconnected" | "reconnecting";

export interface RelayInfo {
    url: string;
    status: RelayStatus;
    connectionStats: {
        attempts: number;
        success: number;
        connectedAt?: number;
    };
}

/**
 * Reactive wrapper around NDK pool
 */
export class ReactivePoolStore {
    #ndk: NDK;
    relays = $state<Map<string, RelayInfo>>(new Map());
    connectedCount = $state(0);
    connectingCount = $state(0);

    constructor(ndk: NDK) {
        this.#ndk = ndk;
        this.#setupListeners();
    }

    /**
     * Setup listeners for pool events
     */
    #setupListeners(): void {
        const pool = this.#ndk.pool;

        if (!pool) {
            console.error("[ndk-svelte5] Pool not initialized, skipping event listeners");
            return;
        }

        // Listen to relay events
        pool.on("relay:connect", this.#handleRelayConnect);
        pool.on("relay:disconnect", this.#handleRelayDisconnect);
        pool.on("relay:connecting", this.#handleRelayConnecting);
    }

    #handleRelayConnect = (relay: NDKRelay): void => {
        this.#updateRelay(relay, "connected");
        this.#updateCounts();
    };

    #handleRelayDisconnect = (relay: NDKRelay): void => {
        this.#updateRelay(relay, "disconnected");
        this.#updateCounts();
    };

    #handleRelayConnecting = (relay: NDKRelay): void => {
        this.#updateRelay(relay, "connecting");
        this.#updateCounts();
    };

    #updateRelay(relay: NDKRelay, status: RelayStatus): void {
        const existing = this.relays.get(relay.url);
        const info: RelayInfo = {
            url: relay.url,
            status,
            connectionStats: existing?.connectionStats || {
                attempts: 0,
                success: 0,
            },
        };

        if (status === "connecting") {
            info.connectionStats.attempts++;
        } else if (status === "connected") {
            info.connectionStats.success++;
            info.connectionStats.connectedAt = Date.now();
        }

        this.relays.set(relay.url, info);
        // Trigger reactivity
        this.relays = new Map(this.relays);
    }

    #updateCounts(): void {
        let connected = 0;
        let connecting = 0;

        for (const info of this.relays.values()) {
            if (info.status === "connected") connected++;
            if (info.status === "connecting") connecting++;
        }

        this.connectedCount = connected;
        this.connectingCount = connecting;
    }

    /**
     * Get relay info by URL
     */
    getRelay(url: string): RelayInfo | undefined {
        return this.relays.get(url);
    }

    /**
     * Get all connected relays
     */
    getConnectedRelays(): RelayInfo[] {
        return Array.from(this.relays.values()).filter((r) => r.status === "connected");
    }
}

export function createReactivePool(ndk: NDK): ReactivePoolStore {
    return new ReactivePoolStore(ndk);
}

export type { ReactivePoolStore };
