import type NDK from "@nostr-dev-kit/ndk";
import type { NDKRelay } from "@nostr-dev-kit/ndk";
import { fetchRelayInformation, NDKKind, NDKList, NDKRelayList } from "@nostr-dev-kit/ndk";
import type { RelayStatus } from "./stores/pool.svelte.js";

/**
 * NIP-11 Relay Information Document
 */
export interface RelayInformation {
    name?: string;
    description?: string;
    pubkey?: string;
    contact?: string;
    supported_nips?: number[];
    software?: string;
    version?: string;
    limitation?: {
        max_message_length?: number;
        max_subscriptions?: number;
        max_filters?: number;
        max_limit?: number;
        max_subid_length?: number;
        min_prefix?: number;
        max_event_tags?: number;
        max_content_length?: number;
        min_pow_difficulty?: number;
        auth_required?: boolean;
        payment_required?: boolean;
    };
    relay_countries?: string[];
    language_tags?: string[];
    tags?: string[];
    posting_policy?: string;
    payments_url?: string;
    fees?: {
        admission?: Array<{ amount: number; unit: string }>;
        subscription?: Array<{ amount: number; unit: string; period: number }>;
        publication?: Array<{ kinds?: number[]; amount: number; unit: string }>;
    };
    icon?: string;
}

export interface EnrichedRelayInfo {
    url: string;
    status: RelayStatus;
    connectionStats: {
        attempts: number;
        success: number;
        connectedAt?: number;
    };
    nip11?: RelayInformation;
    isBlacklisted?: boolean;
    isRead?: boolean;
    isWrite?: boolean;
    isBoth?: boolean;
    error?: string;
}

export type PoolType = string; // Pool name from ndk.pools


/**
 * Reactive relay manager for NDK
 * Manages relay connections, NIP-11 info, and relay lists
 */
export class RelayManager {
    #ndk: NDK;

    // State
    selectedPool = $state<PoolType>("all");
    relayInfo = $state<Map<string, EnrichedRelayInfo>>(new Map());
    isLoadingNip11 = $state<Set<string>>(new Set());
    blacklistedUrls = $state<Set<string>>(new Set());

    // Relay lists
    relayList = $state<NDKRelayList | undefined>(undefined);
    blacklist = $state<NDKList | undefined>(undefined);

    constructor(ndk: NDK) {
        this.#ndk = ndk;
        this.#setupPoolListeners();
        this.#loadRelayLists();
    }

    /**
     * Get all available pool names from NDK
     */
    getPoolNames(): string[] {
        const names = ["all"];
        for (const pool of this.#ndk.pools) {
            if (pool.name) {
                names.push(pool.name);
            }
        }
        return names;
    }

    /**
     * Setup listeners for pool events
     */
    #setupPoolListeners(): void {
        const pool = this.#ndk.pool;
        if (!pool) return;

        // Listen to relay events from pool
        pool.on("relay:connect", (relay: NDKRelay) => {
            this.#updateRelayInfo(relay, "connected");
        });

        pool.on("relay:disconnect", (relay: NDKRelay) => {
            this.#updateRelayInfo(relay, "disconnected");
        });

        pool.on("relay:connecting", (relay: NDKRelay) => {
            this.#updateRelayInfo(relay, "connecting");
        });

        // Initialize with current relays
        for (const relay of pool.relays.values()) {
            const status = this.#getRelayStatus(relay);
            this.#updateRelayInfo(relay, status);
        }
    }

    /**
     * Get relay status from NDKRelay
     */
    #getRelayStatus(relay: NDKRelay): RelayStatus {
        const status = relay.connectivity.status;
        if (status >= 5) return "connected";
        if (status === 4) return "connecting";
        if (status === 2) return "reconnecting";
        return "disconnected";
    }

    /**
     * Update relay info map
     */
    #updateRelayInfo(relay: NDKRelay, status: RelayStatus): void {
        const existing = this.relayInfo.get(relay.url);

        const info: EnrichedRelayInfo = {
            url: relay.url,
            status,
            connectionStats: {
                attempts: relay.connectivity.connectionStats.attempts,
                success: relay.connectivity.connectionStats.success,
                connectedAt: relay.connectivity.connectionStats.connectedAt,
            },
            nip11: existing?.nip11,
            isBlacklisted: this.blacklistedUrls.has(relay.url),
            error: existing?.error,
        };

        // Add pool categorization
        if (this.relayList) {
            info.isRead = this.relayList.readRelayUrls.includes(relay.url);
            info.isWrite = this.relayList.writeRelayUrls.includes(relay.url);
            info.isBoth = this.relayList.bothRelayUrls.includes(relay.url);
        }

        this.relayInfo.set(relay.url, info);
        this.relayInfo = new Map(this.relayInfo);
    }

    /**
     * Load user's relay lists from Nostr
     */
    async #loadRelayLists(): Promise<void> {
        const user = await this.#ndk.signer?.user();
        if (!user) return;

        // Load NIP-65 relay list (kind 10002)
        const relayListEvent = await this.#ndk.fetchEvent({
            kinds: [NDKKind.RelayList],
            authors: [user.pubkey],
        });

        if (relayListEvent) {
            this.relayList = NDKRelayList.from(relayListEvent);
            // Update existing relay info with pool categorization
            for (const [url, info] of this.relayInfo) {
                info.isRead = this.relayList.readRelayUrls.includes(url);
                info.isWrite = this.relayList.writeRelayUrls.includes(url);
                info.isBoth = this.relayList.bothRelayUrls.includes(url);
            }
            this.relayInfo = new Map(this.relayInfo);
        }

        // Load blacklist (kind 10007)
        const blacklistEvent = await this.#ndk.fetchEvent({
            kinds: [NDKKind.BlockRelayList],
            authors: [user.pubkey],
        });

        if (blacklistEvent) {
            this.blacklist = NDKList.from(blacklistEvent);
            // Extract blacklisted relay URLs from tags
            for (const tag of this.blacklist.tags) {
                if (tag[0] === "relay" || tag[0] === "r") {
                    this.blacklistedUrls.add(tag[1]);
                }
            }
            this.blacklistedUrls = new Set(this.blacklistedUrls);

            // Update relay info
            for (const [url, info] of this.relayInfo) {
                info.isBlacklisted = this.blacklistedUrls.has(url);
            }
            this.relayInfo = new Map(this.relayInfo);
        }
    }

    /**
     * Fetch NIP-11 info for a relay
     */
    async fetchNip11Info(relayUrl: string): Promise<void> {
        if (this.isLoadingNip11.has(relayUrl)) return;

        this.isLoadingNip11.add(relayUrl);
        this.isLoadingNip11 = new Set(this.isLoadingNip11);

        try {
            const nip11 = await fetchRelayInformation(relayUrl);
            const info = this.relayInfo.get(relayUrl);
            if (info) {
                // Create new object to trigger reactivity
                this.relayInfo.set(relayUrl, {
                    ...info,
                    nip11,
                    error: undefined,
                });
                this.relayInfo = new Map(this.relayInfo);
            }
        } catch (error) {
            const info = this.relayInfo.get(relayUrl);
            if (info) {
                // Create new object to trigger reactivity
                this.relayInfo.set(relayUrl, {
                    ...info,
                    error: error instanceof Error ? error.message : String(error),
                });
                this.relayInfo = new Map(this.relayInfo);
            }
        } finally {
            this.isLoadingNip11.delete(relayUrl);
            this.isLoadingNip11 = new Set(this.isLoadingNip11);
        }
    }

    /**
     * Add relay to the pool and optionally to relay list
     */
    async addRelay(url: string, poolType: "read" | "write" | "both" = "both"): Promise<void> {
        // Normalize URL
        const normalizedUrl = url.trim();
        if (!normalizedUrl.startsWith("wss://") && !normalizedUrl.startsWith("ws://")) {
            throw new Error("Relay URL must start with wss:// or ws://");
        }

        // Add to NDK pool
        const relay = this.#ndk.pool.getRelay(normalizedUrl, true, true);
        if (relay) {
            relay.connect();
        }

        // Add to user's relay list if authenticated
        const user = await this.#ndk.signer?.user();
        if (user) {
            if (!this.relayList) {
                this.relayList = new NDKRelayList(this.#ndk);
                this.relayList.pubkey = user.pubkey;
            }

            // Add to appropriate relay list
            if (poolType === "read") {
                if (!this.relayList.readRelayUrls.includes(normalizedUrl)) {
                    this.relayList.tags.push(["r", normalizedUrl, "read"]);
                }
            } else if (poolType === "write") {
                if (!this.relayList.writeRelayUrls.includes(normalizedUrl)) {
                    this.relayList.tags.push(["r", normalizedUrl, "write"]);
                }
            } else {
                if (!this.relayList.bothRelayUrls.includes(normalizedUrl)) {
                    this.relayList.tags.push(["r", normalizedUrl]);
                }
            }

            // Publish updated relay list
            await this.relayList.publish();
        }

        // Fetch NIP-11 info
        await this.fetchNip11Info(normalizedUrl);
    }

    /**
     * Remove relay from pool and relay list
     */
    async removeRelay(url: string): Promise<void> {
        // Disconnect from pool
        const relay = this.#ndk.pool.relays.get(url);
        if (relay) {
            relay.disconnect();
        }

        // Remove from relay info
        this.relayInfo.delete(url);
        this.relayInfo = new Map(this.relayInfo);

        // Remove from relay list
        if (this.relayList) {
            this.relayList.tags = this.relayList.tags.filter(
                (tag) => !((tag[0] === "r" || tag[0] === "relay") && tag[1] === url)
            );
            await this.relayList.publish();
        }
    }

    /**
     * Add relay to blacklist (NIP-51)
     */
    async blacklistRelay(url: string): Promise<void> {
        const user = await this.#ndk.signer?.user();
        if (!user) {
            throw new Error("User must be authenticated to blacklist relays");
        }

        if (!this.blacklist) {
            this.blacklist = new NDKList(this.#ndk);
            this.blacklist.kind = NDKKind.BlockRelayList;
            this.blacklist.pubkey = user.pubkey;
        }

        // Add to blacklist if not already there
        if (!this.blacklistedUrls.has(url)) {
            this.blacklist.tags.push(["relay", url]);
            this.blacklistedUrls.add(url);
            this.blacklistedUrls = new Set(this.blacklistedUrls);

            // Update relay info
            const info = this.relayInfo.get(url);
            if (info) {
                info.isBlacklisted = true;
                this.relayInfo = new Map(this.relayInfo);
            }

            await this.blacklist.publish();
        }

        // Remove from pool
        await this.removeRelay(url);
    }

    /**
     * Remove relay from blacklist
     */
    async unblacklistRelay(url: string): Promise<void> {
        if (!this.blacklist) return;

        this.blacklist.tags = this.blacklist.tags.filter(
            (tag) => !((tag[0] === "relay" || tag[0] === "r") && tag[1] === url)
        );

        this.blacklistedUrls.delete(url);
        this.blacklistedUrls = new Set(this.blacklistedUrls);

        // Update relay info
        const info = this.relayInfo.get(url);
        if (info) {
            info.isBlacklisted = false;
            this.relayInfo = new Map(this.relayInfo);
        }

        await this.blacklist.publish();
    }

    /**
     * Get filtered relays based on selected pool
     */
    getFilteredRelays(): EnrichedRelayInfo[] {
        const allRelays = Array.from(this.relayInfo.values());

        if (this.selectedPool === "all") {
            return allRelays.filter((r) => !r.isBlacklisted);
        }

        // Find the pool by name
        const pool = this.#ndk.pools.find((p) => p.name === this.selectedPool);
        if (!pool) {
            return allRelays.filter((r) => !r.isBlacklisted);
        }

        // Get relay URLs from this pool
        const poolRelayUrls = new Set(Array.from(pool.relays.values()).map((r) => r.url));

        // Filter relays that are in this pool
        return allRelays.filter((r) => poolRelayUrls.has(r.url) && !r.isBlacklisted);
    }

    /**
     * Get relay count by pool type
     */
    getPoolCount(poolName: PoolType): number {
        const allRelays = Array.from(this.relayInfo.values());

        if (poolName === "all") {
            return allRelays.filter((r) => !r.isBlacklisted).length;
        }

        // Find the pool by name
        const pool = this.#ndk.pools.find((p) => p.name === poolName);
        if (!pool) {
            return 0;
        }

        // Get relay URLs from this pool
        const poolRelayUrls = new Set(Array.from(pool.relays.values()).map((r) => r.url));

        // Count relays that are in this pool
        return allRelays.filter((r) => poolRelayUrls.has(r.url) && !r.isBlacklisted).length;
    }
}

/**
 * Create a relay manager instance
 */
export function createRelayManager(ndk: NDK): RelayManager {
    return new RelayManager(ndk);
}
