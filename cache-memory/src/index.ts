import type {
    CashuMintInfo,
    CashuMintKeys,
    Hexpubkey,
    NDKCacheAdapter,
    NDKCacheEntry,
    NDKCacheRelayInfo,
    NDKEvent,
    NDKEventId,
    NDKFilter,
    NDKKind,
    NDKLnUrlData,
    NDKNutzapState,
    NDKRelay,
    NDKSubscription,
    NDKUserProfile,
    ProfilePointer,
} from "@nostr-dev-kit/ndk";
import createDebugger from "debug";
import { matchFilter } from "nostr-tools";
import { LRUCache } from "typescript-lru-cache";

const d = createDebugger("ndk:cache:memory");

export interface NDKMemoryCacheAdapterOptions {
    maxSize?: number;
    profileMaxSize?: number;
}

export default class NDKMemoryCacheAdapter implements NDKCacheAdapter {
    public locking = true;
    public ready = true;

    private events: LRUCache<NDKEventId, NDKEvent>;
    private profiles: LRUCache<Hexpubkey, NDKCacheEntry<NDKUserProfile>>;
    private nip05: LRUCache<string, { pointer: ProfilePointer | null; cachedAt: number }>;
    private lnurlDocs: LRUCache<Hexpubkey, { doc: NDKLnUrlData | null; cachedAt: number }>;
    private relayStatus: Map<WebSocket["url"], NDKCacheRelayInfo>;
    private unpublishedEvents: Map<NDKEventId, { event: NDKEvent; relays?: WebSocket["url"][]; lastTryAt?: number }>;
    private decryptedEvents: Map<NDKEventId, NDKEvent>;
    private nutzapStates: Map<NDKEventId, NDKNutzapState>;
    private cashuMintInfo: LRUCache<string, { info: CashuMintInfo; cachedAt: number }>;
    private cashuMintKeys: LRUCache<string, { keys: CashuMintKeys[]; cachedAt: number }>;

    constructor(options: NDKMemoryCacheAdapterOptions = {}) {
        const maxSize = options.maxSize ?? 5000;
        const profileMaxSize = options.profileMaxSize ?? 1000;

        this.events = new LRUCache<NDKEventId, NDKEvent>({ maxSize });
        this.profiles = new LRUCache<Hexpubkey, NDKCacheEntry<NDKUserProfile>>({ maxSize: profileMaxSize });
        this.nip05 = new LRUCache<string, { pointer: ProfilePointer | null; cachedAt: number }>({ maxSize: 500 });
        this.lnurlDocs = new LRUCache<Hexpubkey, { doc: NDKLnUrlData | null; cachedAt: number }>({ maxSize: 500 });
        this.relayStatus = new Map();
        this.unpublishedEvents = new Map();
        this.decryptedEvents = new Map();
        this.nutzapStates = new Map();
        this.cashuMintInfo = new LRUCache<string, { info: CashuMintInfo; cachedAt: number }>({ maxSize: 100 });
        this.cashuMintKeys = new LRUCache<string, { keys: CashuMintKeys[]; cachedAt: number }>({ maxSize: 100 });

        d("Initialized with maxSize=%d, profileMaxSize=%d", maxSize, profileMaxSize);
    }

    query(subscription: NDKSubscription): NDKEvent[] {
        const matchedEvents: NDKEvent[] = [];

        this.events.forEach((event) => {
            for (const filter of subscription.filters) {
                if (matchFilter(filter, event.rawEvent())) {
                    matchedEvents.push(event);
                    break;
                }
            }
        });

        d("Query matched %d events from %d cached", matchedEvents.length, this.events.size);
        return matchedEvents;
    }

    async setEvent(event: NDKEvent, _filters: NDKFilter<NDKKind>[], _relay?: NDKRelay): Promise<void> {
        // Ensure relay is set on the event
        if (_relay && !event.relay) {
            event.relay = _relay;
        }
        this.events.set(event.id, event);
    }

    async deleteEventIds(eventIds: NDKEventId[]): Promise<void> {
        for (const id of eventIds) {
            this.events.delete(id);
        }
        d("Deleted %d events", eventIds.length);
    }

    fetchProfileSync(pubkey: Hexpubkey): NDKCacheEntry<NDKUserProfile> | null {
        return this.profiles.get(pubkey) ?? null;
    }

    getAllProfilesSync(): Map<Hexpubkey, NDKCacheEntry<NDKUserProfile>> {
        const map = new Map<Hexpubkey, NDKCacheEntry<NDKUserProfile>>();
        this.profiles.forEach((profile, pubkey) => {
            map.set(pubkey, profile);
        });
        return map;
    }

    async fetchProfile(pubkey: Hexpubkey): Promise<NDKCacheEntry<NDKUserProfile> | null> {
        return this.fetchProfileSync(pubkey);
    }

    saveProfile(pubkey: Hexpubkey, profile: NDKUserProfile): void {
        this.profiles.set(pubkey, { ...profile, cachedAt: Date.now() });
    }

    async getProfiles(
        filter: (pubkey: Hexpubkey, profile: NDKUserProfile) => boolean,
    ): Promise<Map<Hexpubkey, NDKUserProfile> | undefined> {
        const map = new Map<Hexpubkey, NDKUserProfile>();
        this.profiles.forEach((profileEntry, pubkey) => {
            if (filter(pubkey, profileEntry)) {
                map.set(pubkey, profileEntry);
            }
        });
        return map;
    }

    async loadNip05(nip05: string, maxAgeForMissing = 86400000): Promise<ProfilePointer | null | "missing"> {
        const cached = this.nip05.get(nip05);
        if (!cached) return "missing";

        const age = Date.now() - cached.cachedAt;
        if (cached.pointer === null && age > maxAgeForMissing) {
            return "missing";
        }

        return cached.pointer;
    }

    saveNip05(nip05: string, profile: ProfilePointer | null): void {
        this.nip05.set(nip05, { pointer: profile, cachedAt: Date.now() });
    }

    async loadUsersLNURLDoc(
        pubkey: Hexpubkey,
        maxAgeInSecs = 3600,
        maxAgeForMissing = 86400,
    ): Promise<NDKLnUrlData | null | "missing"> {
        const cached = this.lnurlDocs.get(pubkey);
        if (!cached) return "missing";

        const ageInSecs = (Date.now() - cached.cachedAt) / 1000;

        if (cached.doc === null && ageInSecs > maxAgeForMissing) {
            return "missing";
        }

        if (ageInSecs > maxAgeInSecs) {
            return "missing";
        }

        return cached.doc;
    }

    saveUsersLNURLDoc(pubkey: Hexpubkey, doc: NDKLnUrlData | null): void {
        this.lnurlDocs.set(pubkey, { doc, cachedAt: Date.now() });
    }

    updateRelayStatus(relayUrl: WebSocket["url"], info: NDKCacheRelayInfo): void {
        this.relayStatus.set(relayUrl, info);
    }

    getRelayStatus(relayUrl: WebSocket["url"]): NDKCacheRelayInfo | undefined {
        return this.relayStatus.get(relayUrl);
    }

    addUnpublishedEvent(event: NDKEvent, relayUrls: WebSocket["url"][]): void {
        this.unpublishedEvents.set(event.id, { event, relays: relayUrls, lastTryAt: Date.now() });
    }

    async getUnpublishedEvents(): Promise<{ event: NDKEvent; relays?: WebSocket["url"][]; lastTryAt?: number }[]> {
        return Array.from(this.unpublishedEvents.values());
    }

    discardUnpublishedEvent(eventId: NDKEventId): void {
        this.unpublishedEvents.delete(eventId);
    }

    getDecryptedEvent(eventId: NDKEventId): NDKEvent | null {
        return this.decryptedEvents.get(eventId) ?? null;
    }

    addDecryptedEvent(event: NDKEvent): void {
        this.decryptedEvents.set(event.id, event);
    }

    async clear(): Promise<void> {
        this.events.clear();
        this.profiles.clear();
        this.nip05.clear();
        this.lnurlDocs.clear();
        this.relayStatus.clear();
        this.unpublishedEvents.clear();
        this.decryptedEvents.clear();
        this.nutzapStates.clear();
        this.cashuMintInfo.clear();
        this.cashuMintKeys.clear();
        d("Cache cleared");
    }

    async getAllNutzapStates(): Promise<Map<NDKEventId, NDKNutzapState>> {
        return new Map(this.nutzapStates);
    }

    async setNutzapState(id: NDKEventId, stateChange: Partial<NDKNutzapState>): Promise<void> {
        const current = this.nutzapStates.get(id) ?? ({} as NDKNutzapState);
        this.nutzapStates.set(id, { ...current, ...stateChange });
    }

    async loadCashuMintInfo(mintUrl: string, maxAgeInSecs?: number): Promise<CashuMintInfo | undefined> {
        const cached = this.cashuMintInfo.get(mintUrl);
        if (!cached) return undefined;

        if (maxAgeInSecs !== undefined) {
            const ageInSecs = (Date.now() - cached.cachedAt) / 1000;
            if (ageInSecs > maxAgeInSecs) {
                return undefined;
            }
        }

        return cached.info;
    }

    async saveCashuMintInfo(mintUrl: string, info: CashuMintInfo): Promise<void> {
        this.cashuMintInfo.set(mintUrl, { info, cachedAt: Date.now() });
    }

    async loadCashuMintKeys(mintUrl: string, maxAgeInSecs?: number): Promise<CashuMintKeys[] | undefined> {
        const cached = this.cashuMintKeys.get(mintUrl);
        if (!cached) return undefined;

        if (maxAgeInSecs !== undefined) {
            const ageInSecs = (Date.now() - cached.cachedAt) / 1000;
            if (ageInSecs > maxAgeInSecs) {
                return undefined;
            }
        }

        return cached.keys;
    }

    async saveCashuMintKeys(mintUrl: string, keys: CashuMintKeys[]): Promise<void> {
        this.cashuMintKeys.set(mintUrl, { keys, cachedAt: Date.now() });
    }
}
