import { EventEmitter } from "node:events";
import { NDKCacheAdapterSqlite } from "@nostr-dev-kit/cache-sqlite";
import NDK, { type NDKEvent, NDKPrivateKeySigner, NDKRelaySet } from "@nostr-dev-kit/ndk";
import { NDKCashuWallet } from "@nostr-dev-kit/wallet";

export interface EventLogEntry {
    timestamp: number;
    kind: number;
    eventId: string;
    details: string;
    event: NDKEvent;
}

export interface SyncInfo {
    lastSync?: number;
    duration?: number;
    eventsCount?: number;
    relayStatus: Map<string, { success: boolean; eventCount: number; duration: number }>;
}

export class WalletContext extends EventEmitter {
    public ndk: NDK;
    public wallet?: NDKCashuWallet;
    public cacheAdapter: NDKCacheAdapterSqlite;
    public eventLog: EventLogEntry[] = [];
    public syncInfo: SyncInfo = {
        relayStatus: new Map(),
    };

    private config = {
        dbPath: "./wallet-data",
    };

    constructor() {
        super();

        this.cacheAdapter = new NDKCacheAdapterSqlite({
            dbPath: this.config.dbPath,
            dbName: "ndk-wallet-repl",
        });

        this.ndk = new NDK({
            cacheAdapter: this.cacheAdapter,
        });
    }

    async initialize(privateKey?: string) {
        console.log("Using database path:", this.config.dbPath);
        await this.cacheAdapter.initializeAsync(this.ndk);

        if (privateKey) {
            this.ndk.signer = new NDKPrivateKeySigner(privateKey);
        }

        await this.ndk.connect();

        if (this.ndk.signer) {
            const wallet = new NDKCashuWallet(this.ndk);
            await this.initializeWallet(wallet);
        }
    }

    async initializeWithConfig(privateKey?: string, config?: { mints?: string[]; relays?: string[] }) {
        if (privateKey) {
            this.ndk.signer = new NDKPrivateKeySigner(privateKey);
        }

        // Connect to user-selected relays
        if (config?.relays && config.relays.length > 0) {
            this.ndk.explicitRelayUrls = config.relays;

            // Reconnect to the new relays
            for (const relayUrl of config.relays) {
                this.ndk.pool.addRelay(relayUrl);
            }
        }

        if (this.ndk.signer) {
            const wallet = new NDKCashuWallet(this.ndk);

            // Set mints from config
            if (config?.mints && config.mints.length > 0) {
                wallet.mints = config.mints;
            }

            // Set relay set from config
            if (config?.relays && config.relays.length > 0) {
                wallet.relaySet = NDKRelaySet.fromRelayUrls(config.relays, this.ndk);
            }

            await this.initializeWallet(wallet);
        }
    }

    async initializeWallet(wallet: NDKCashuWallet) {
        this.wallet = wallet;

        wallet.on("ready", () => {
            this.emit("wallet:ready");
        });

        wallet.on("balance_updated", () => {
            this.emit("wallet:balance_updated");
        });

        wallet.on("warning", (warning) => {
            this.emit("wallet:warning", warning);
        });

        wallet.start();
    }

    logEvent(event: NDKEvent, details: string) {
        const entry: EventLogEntry = {
            timestamp: event.created_at || Math.floor(Date.now() / 1000),
            kind: event.kind || 0,
            eventId: event.id || "",
            details,
            event,
        };

        this.eventLog.unshift(entry);

        if (this.eventLog.length > 1000) {
            this.eventLog = this.eventLog.slice(0, 1000);
        }

        this.emit("event:logged", entry);
    }

    getEventLog(filter?: { kind?: number; limit?: number }): EventLogEntry[] {
        let filtered = this.eventLog;

        if (filter?.kind !== undefined) {
            filtered = filtered.filter((e) => e.kind === filter.kind);
        }

        if (filter?.limit !== undefined) {
            filtered = filtered.slice(0, filter.limit);
        }

        return filtered;
    }

    updateSyncInfo(info: Partial<SyncInfo>) {
        this.syncInfo = { ...this.syncInfo, ...info };
        this.emit("sync:updated", this.syncInfo);
    }

    async shutdown() {
        this.wallet?.stop();
        this.cacheAdapter.close();
        this.ndk.pool.disconnect();
    }

    get isReady(): boolean {
        return this.wallet !== undefined && this.wallet.status === 1; // NDKWalletStatus.READY
    }

    get user() {
        return this.ndk.activeUser;
    }
}
