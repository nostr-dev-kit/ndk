import {
    NDKCacheAdapter,
    NDKCacheRelayInfo,
    NDKFilter,
    NDKKind,
    NDKLnUrlData,
    NDKRelaySet,
    NDKUserProfile,
    NostrEvent,
    ProfilePointer,
} from "@nostr-dev-kit/ndk";
import NDK, { NDKRelay } from "@nostr-dev-kit/ndk";
import { NDKEvent, type NDKSubscription } from "@nostr-dev-kit/ndk";
import createDebugger from "debug";
import { Queue } from "./queue";

export interface NDKNostrCacheAdapterOptions {
    relayUrl: string;
}

let d: debug.IDebugger;

export default class NDKNostrCacheAdapter implements NDKCacheAdapter {
    public locking: boolean;
    public ready?: boolean | undefined;

    /**
     * The NDK instance used to interact with the local nostr relay.
     */
    private ndk: NDK;

    /**
     * The fallback NDK is used to gather events on the background, to hydrate the
     * cache
     */
    private fallbackNdk: NDK;
    private relaySet: NDKRelaySet;
    private relay: NDKRelay;

    /**
     * How long it's acceptable to block until queries finish.
     */
    public queryTimeout = 4000;

    public backgroundSubscriptionQueue: Queue<void> = new Queue("ndk-nostr-cache-adapter", 5);

    private hydratedEvents = 0;

    constructor(options: NDKNostrCacheAdapterOptions) {
        this.locking = false;
        this.ready = true;
        d = createDebugger("ndk:nostr-cache-adapter");

        this.ndk = new NDK({
            explicitRelayUrls: [options.relayUrl],
            enableOutboxModel: false,
            debug: d.extend("ndk"),
        });
        this.ndk.connect().then(() => this.onConnect());

        this.fallbackNdk = new NDK({
            enableOutboxModel: true,
            debug: d.extend("fallback-ndk"),
        });
        this.fallbackNdk.connect().then(() => {
            d(
                "Connected to fallback NDK %o",
                this.fallbackNdk.pool.connectedRelays().map((relay) => relay.url)
            );
        });

        this.relaySet = NDKRelaySet.fromRelayUrls([options.relayUrl], this.ndk);
        this.relay = Array.from(this.relaySet.relays)[0];

        if (d.enabled) {
            setInterval(() => {
                d("Cache adapter has injested %d events", this.hydratedEvents);
            }, 10000);
        }
    }

    private onConnect() {
        d(
            "Connected to %o",
            this.ndk.pool.connectedRelays().map((relay) => relay.url)
        );
        this.locking = true;
        this.ready = true;
    }

    /**
     * Processes the query locally.
     * @param subscription
     * @returns The number of events received.
     */
    private async queryLocally(subscription: NDKSubscription): Promise<number> {
        const subId =
            subscription.subId ??
            subscription.filters.map((filter) => Object.keys(filter).join(",")).join("-");
        const _ = d.extend(subId);

        return new Promise((resolve, reject) => {
            let eventCount = 0;

            _("Querying %o", subscription.filters);

            // Generate a subscription
            const sub = this.ndk.subscribe(
                subscription.filters,
                {
                    subId: subscription.subId,
                    closeOnEose: true,
                },
                this.relaySet,
                false
            );

            // Process events
            sub.on("event", (event) => {
                subscription.eventReceived(event, undefined, true);
                eventCount++;
                _("Event received %d", event.kind);
            });

            // Finish when we EOSE
            sub.on("eose", () => {
                _("Eose received");
                this.relay.off("notice", onRelayNotice);
                resolve(eventCount);
            });

            // Handle relay notices
            const onRelayNotice = (notice: string) => {
                _("Notice received %s", notice);
                reject(notice);
            };

            this.relay.once("notice", (notice) => {
                _("Notice received %o", notice);
            });

            // Start the subscription
            sub.start();
        });
    }

    async query(subscription: NDKSubscription): Promise<void> {
        const subId =
            subscription.subId ??
            subscription.filters.map((filter) => Object.keys(filter).join(",")).join("-");
        let eventCount = 0;

        const _ = d.extend(subId);

        await Promise.race([this.queryLocally(subscription), timeout(this.queryTimeout)])
            .then((count: unknown) => {
                if (typeof count === "number") {
                    eventCount = count;

                    _("Query finished with %d events", eventCount);

                    setTimeout(() => this.hydrate(subscription), 2500);
                }
            })
            .catch((err) => {
                _("Error %o", err);
            });
    }

    private async hydrate(subscription: NDKSubscription) {
        this.backgroundSubscriptionQueue.add({
            id: subscription.filters.flatMap((filter) => Object.keys(filter).join(",")).join("-"),
            func: async (): Promise<void> => {
                let publishedEvents = 0;
                return new Promise<void>((resolve, reject) => {
                    d("Hydrating %o", subscription.filters);
                    const sub = this.fallbackNdk.subscribe(
                        subscription.filters,
                        {
                            closeOnEose: true,
                        },
                        undefined,
                        false
                    );
                    sub.on("event", (event) => {
                        this.hydrateLocalRelayWithEvent(event);
                        publishedEvents++;
                    });
                    sub.on("eose", () => {
                        d("Hydrated %d events", publishedEvents);
                        resolve();
                    });
                    sub.on("close", () => {
                        d("Hydration closed");
                        reject();
                    });
                    sub.start();
                });
            },
        });
    }

    private hydrateLocalRelayWithEvent(event: NDKEvent) {
        d(`relay status %s`, this.relay.status);
        event.ndk = this.ndk;
        this.relay
            .publish(event)
            .then(() => {
                this.hydratedEvents++;
            })
            .catch((err) => {
                d("Error hydrating event %o", err);
            });
    }

    async setEvent(
        event: NDKEvent,
        filters: NDKFilter<NDKKind>[],
        relay?: NDKRelay | undefined
    ): Promise<void> {
        this.hydrateLocalRelayWithEvent(event);
    }

    // async deleteEvent?(event: NDKEvent): Promise<void> {
    //     d("deleteEvent method not implemented.");
    // }
    // async fetchProfile?(pubkey: string): Promise<NDKUserProfile | null> {
    //     d("fetchProfile method not implemented.");
    // }
    // saveProfile?(pubkey: string, profile: NDKUserProfile): void {
    //     d("saveProfile method not implemented.");
    // }
    // getProfiles?: ((filter: (pubkey: string, profile: NDKUserProfile) => boolean) => Promise<Map<string, NDKUserProfile> | undefined>) | undefined;
    // async loadNip05?(nip05: string, maxAgeForMissing?: number | undefined): Promise<ProfilePointer | "missing" | null> {
    //     d("loadNip05 method not implemented.");
    // }
    // saveNip05?(nip05: string, profile: ProfilePointer | null): void {
    //     d("saveNip05 method not implemented.");
    // }
    // async loadUsersLNURLDoc?(pubkey: string, maxAgeInSecs?: number | undefined, maxAgeForMissing?: number | undefined): Promise<"missing" | NDKLnUrlData | null> {
    //     d("loadUsersLNURLDoc method not implemented.");
    // }
    // saveUsersLNURLDoc?(pubkey: string, doc: NDKLnUrlData | null): void {
    //     d("saveUsersLNURLDoc method not implemented.");
    // }
    // updateRelayStatus?(relayUrl: string, info: NDKCacheRelayInfo): void {
    //     d("updateRelayStatus method not implemented.");
    // }
    // addUnpublishedEvent?(event: NDKEvent, relayUrls: string[]): void {
    //     d("addUnpublishedEvent method not implemented.");
    // }
    // async getUnpublishedEvents?(): Promise<{ event: NDKEvent; relays?: string[] | undefined; lastTryAt?: number | undefined; }[]> {
    //     d("getUnpublishedEvents method not implemented.");
    // }
    // discardUnpublishedEvent?(eventId: string): void {
    //     d("discardUnpublishedEvent method not implemented.");
    // }
    // onReady?(callback: () => void): void {
    //     d("onReady method not implemented.");
    // }
}

const timeout = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const profile = async (fn: (...args: any[]) => any) => {
    return async (...args: any[]) => {
        const start = Date.now();
        const result = await fn(...args);
        d("Function took %d ms", Date.now() - start);
        return result;
    };
};
