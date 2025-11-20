/**
 * Generic LRU cache for metadata (profiles, relay info, NIP-05)
 * Enables sync operations in worker mode without hitting the worker
 */

interface CacheEntry<T> {
    value: T;
    timestamp: number;
}

export class MetadataLRUCache {
    private profiles: Map<string, CacheEntry<any>>;
    private relayInfo: Map<string, CacheEntry<any>>;
    private nip05: Map<string, CacheEntry<any>>;
    private maxSize: number;
    private profileAccessOrder: string[];
    private relayAccessOrder: string[];
    private nip05AccessOrder: string[];

    constructor(maxSize: number = 1000) {
        this.profiles = new Map();
        this.relayInfo = new Map();
        this.nip05 = new Map();
        this.maxSize = maxSize;
        this.profileAccessOrder = [];
        this.relayAccessOrder = [];
        this.nip05AccessOrder = [];
    }

    // Profile operations
    getProfile(pubkey: string): any | undefined {
        const entry = this.profiles.get(pubkey);
        if (entry) {
            // Update access order
            const index = this.profileAccessOrder.indexOf(pubkey);
            if (index > -1) {
                this.profileAccessOrder.splice(index, 1);
            }
            this.profileAccessOrder.push(pubkey);
        }
        return entry?.value;
    }

    setProfile(pubkey: string, profile: any): void {
        this.profiles.set(pubkey, {
            value: profile,
            timestamp: Date.now(),
        });

        // Update access order
        const index = this.profileAccessOrder.indexOf(pubkey);
        if (index > -1) {
            this.profileAccessOrder.splice(index, 1);
        }
        this.profileAccessOrder.push(pubkey);

        // Evict if needed
        if (this.profiles.size > this.maxSize) {
            const oldest = this.profileAccessOrder.shift();
            if (oldest) {
                this.profiles.delete(oldest);
            }
        }
    }

    deleteProfile(pubkey: string): void {
        this.profiles.delete(pubkey);
        const index = this.profileAccessOrder.indexOf(pubkey);
        if (index > -1) {
            this.profileAccessOrder.splice(index, 1);
        }
    }

    // Relay info operations
    getRelayInfo(url: string): any | undefined {
        const entry = this.relayInfo.get(url);
        if (entry) {
            // Update access order
            const index = this.relayAccessOrder.indexOf(url);
            if (index > -1) {
                this.relayAccessOrder.splice(index, 1);
            }
            this.relayAccessOrder.push(url);
        }
        return entry?.value;
    }

    setRelayInfo(url: string, info: any): void {
        this.relayInfo.set(url, {
            value: info,
            timestamp: Date.now(),
        });

        // Update access order
        const index = this.relayAccessOrder.indexOf(url);
        if (index > -1) {
            this.relayAccessOrder.splice(index, 1);
        }
        this.relayAccessOrder.push(url);

        // Evict if needed
        if (this.relayInfo.size > this.maxSize) {
            const oldest = this.relayAccessOrder.shift();
            if (oldest) {
                this.relayInfo.delete(oldest);
            }
        }
    }

    deleteRelayInfo(url: string): void {
        this.relayInfo.delete(url);
        const index = this.relayAccessOrder.indexOf(url);
        if (index > -1) {
            this.relayAccessOrder.splice(index, 1);
        }
    }

    // NIP-05 operations
    getNip05(nip05: string): any | undefined {
        const entry = this.nip05.get(nip05);
        if (entry) {
            // Update access order
            const index = this.nip05AccessOrder.indexOf(nip05);
            if (index > -1) {
                this.nip05AccessOrder.splice(index, 1);
            }
            this.nip05AccessOrder.push(nip05);
        }
        return entry?.value;
    }

    setNip05(nip05: string, result: any): void {
        this.nip05.set(nip05, {
            value: result,
            timestamp: Date.now(),
        });

        // Update access order
        const index = this.nip05AccessOrder.indexOf(nip05);
        if (index > -1) {
            this.nip05AccessOrder.splice(index, 1);
        }
        this.nip05AccessOrder.push(nip05);

        // Evict if needed
        if (this.nip05.size > this.maxSize) {
            const oldest = this.nip05AccessOrder.shift();
            if (oldest) {
                this.nip05.delete(oldest);
            }
        }
    }

    deleteNip05(nip05: string): void {
        this.nip05.delete(nip05);
        const index = this.nip05AccessOrder.indexOf(nip05);
        if (index > -1) {
            this.nip05AccessOrder.splice(index, 1);
        }
    }

    // Clear all
    clear(): void {
        this.profiles.clear();
        this.relayInfo.clear();
        this.nip05.clear();
        this.profileAccessOrder = [];
        this.relayAccessOrder = [];
        this.nip05AccessOrder = [];
    }

    // Get metrics
    getMetrics() {
        return {
            profileCount: this.profiles.size,
            relayInfoCount: this.relayInfo.size,
            nip05Count: this.nip05.size,
            totalCount: this.profiles.size + this.relayInfo.size + this.nip05.size,
            maxSize: this.maxSize,
        };
    }
}
