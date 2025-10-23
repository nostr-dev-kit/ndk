import type { NDKEvent, NDKSubscription } from "@nostr-dev-kit/ndk";
import NDK, {
    type NDKCacheAdapter,
    NDKCacheRelayInfo,
    type NDKFilter,
    type NDKKind,
    NDKLnUrlData,
    type NDKRelay,
    NDKRelaySet,
    NDKUserProfile,
    NostrEvent,
    ProfilePointer,
} from "@nostr-dev-kit/ndk";
import createDebugger from "debug";
import { Queue } from "./queue";

export interface NDKNostrCacheAdapterOptions {
    relayUrl: string;
}

let d: debug.IDebugger;

export default class NDKNostrCacheAdapter implements NDKCacheAdapter {
    public locking: boolean;
    public ready?: boolean | undefined;

    private ndk: NDK;
    private fallbackNdk: NDK;
    private relaySet: NDKRelaySet;
    private relay: NDKRelay;

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
                this.fallbackNdk.pool.connectedRelays().map((relay) => relay.url),
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
            this.ndk.pool.connectedRelays().map((relay) => relay.url),
        );
        this.locking = true;
        this.ready = true;
    }

    private async queryLocally(subscription: NDKSubscription): Promise<NDKEvent[]> {
        const subId =
            subscription.subId ?? subscription.filters.map((filter) => Object.keys(filter).join(",")).join("-");
        const _ = d.extend(subId);

        return new Promise((resolve, reject) => {
            const events: NDKEvent[] = [];

            _("Querying %o", subscription.filters);

            const onRelayNotice = (notice: string) => {
                _("Notice received %s", notice);
                reject(notice);
            };

            this.relay.once("notice", (notice) => {
                _("Notice received %o", notice);
            });

            const sub = this.ndk.subscribe(subscription.filters, {
                subId: subscription.subId,
                closeOnEose: true,
                relaySet: this.relaySet,
                onEvent: (event) => {
                    subscription.eventReceived(event, undefined, true);
                    events.push(event);
                    _("Event received %d", event.kind);
                },
                onEose: () => {
                    _("Eose received");
                    this.relay.off("notice", onRelayNotice);
                    resolve(events);
                },
            });
        });
    }

    async query(subscription: NDKSubscription): Promise<NDKEvent[]> {
        const subId =
            subscription.subId ?? subscription.filters.map((filter) => Object.keys(filter).join(",")).join("-");
        let events: NDKEvent[] = [];

        const _ = d.extend(subId);

        try {
            const result = await Promise.race([this.queryLocally(subscription), timeout(this.queryTimeout)]);
            if (Array.isArray(result)) {
                events = result;
                _("Query finished with %d events", events.length);
                setTimeout(() => this.hydrate(subscription), 2500);
            }
        } catch (err) {
            _("Error %o", err);
        }

        return events;
    }

    private async hydrate(subscription: NDKSubscription) {
        this.backgroundSubscriptionQueue.add({
            id: subscription.filters.flatMap((filter) => Object.keys(filter).join(",")).join("-"),
            func: async (): Promise<void> => {
                let publishedEvents = 0;
                return new Promise<void>((resolve, reject) => {
                    d("Hydrating %o", subscription.filters);
                    const sub = this.fallbackNdk.subscribe(subscription.filters, {
                        closeOnEose: true,
                        onEvent: (event) => {
                            this.hydrateLocalRelayWithEvent(event);
                            publishedEvents++;
                        },
                        onEose: () => {
                            d("Hydrated %d events", publishedEvents);
                            resolve();
                        },
                        onClose: () => {
                            d("Hydration closed");
                            reject();
                        },
                    });
                });
            },
        });
    }

    private hydrateLocalRelayWithEvent(event: NDKEvent) {
        d("relay status %s", this.relay.status);
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

    async setEvent(event: NDKEvent, _filters: NDKFilter<NDKKind>[], _relay?: NDKRelay | undefined): Promise<void> {
        this.hydrateLocalRelayWithEvent(event);
    }

    setEventDup(event: NDKEvent, _relay: NDKRelay): void {
        // Cache-nostr doesn't need to do anything special for duplicates
        // The event is already in the local relay cache, no need to re-publish
    }
}

const timeout = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const _profile = async (fn: (...args: any[]) => any) => {
    return async (...args: any[]) => {
        const start = Date.now();
        const result = await fn(...args);
        d("Function took %d ms", Date.now() - start);
        return result;
    };
};
