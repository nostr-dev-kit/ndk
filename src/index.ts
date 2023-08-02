import debug from "debug";
import EventEmitter from "eventemitter3";
import { NDKCacheAdapter } from "./cache/index.js";
import dedupEvent from "./events/dedup.js";
import NDKEvent from "./events/index.js";
import { NDKPool } from "./relay/pool/index.js";
import { calculateRelaySetFromEvent } from "./relay/sets/calculate.js";
import { NDKRelaySet } from "./relay/sets/index.js";
import type { NDKSigner } from "./signers/index.js";
import {
    NDKFilter,
    NDKSubscription,
    NDKSubscriptionOptions,
    filterFromId
} from "./subscription/index.js";
import NDKUser, { NDKUserParams } from "./user/index.js";
import { NDKUserProfile } from "./user/profile.js";
import type { NDKRelay } from "./relay/index.js";

export * from "./events/index.js";
export * from "./events/kinds/index.js";
export * from './events/kinds/article.js';
export * from './events/kinds/lists/index.js';
export * from "./relay/index.js";
export * from "./relay/sets/index.js";
export * from "./signers/index.js";
export * from "./signers/nip07/index.js";
export * from "./signers/nip46/backend/index.js";
export * from "./signers/nip46/rpc.js";
export * from "./signers/nip46/index.js";
export * from "./signers/private-key/index.js";
export * from "./subscription/index.js";
export * from "./user/profile.js";
export { NDKZapInvoice, zapInvoiceFromEvent } from "./zap/invoice.js";
export { NDKEvent, NDKUser, NDKFilter, NDKUserProfile, NDKCacheAdapter };

export interface NDKConstructorParams {
    explicitRelayUrls?: string[];
    devWriteRelayUrls?: string[];
    signer?: NDKSigner;
    cacheAdapter?: NDKCacheAdapter;
    debug?: debug.Debugger;
}
export interface GetUserParams extends NDKUserParams {
    npub?: string;
    hexpubkey?: string;
}

export default class NDK extends EventEmitter {
    public pool: NDKPool;
    public signer?: NDKSigner;
    public cacheAdapter?: NDKCacheAdapter;
    public debug: debug.Debugger;
    public devWriteRelaySet?: NDKRelaySet;

    public delayedSubscriptions: Map<string, NDKSubscription[]>;

    public constructor(opts: NDKConstructorParams = {}) {
        super();

        this.debug = opts.debug || debug("ndk");
        this.pool = new NDKPool(opts.explicitRelayUrls || [], this);
        this.signer = opts.signer;
        this.cacheAdapter = opts.cacheAdapter;
        this.delayedSubscriptions = new Map();

        if (opts.devWriteRelayUrls) {
            this.devWriteRelaySet = NDKRelaySet.fromRelayUrls(opts.devWriteRelayUrls, this);
        }
    }

    public toJSON(): string {
        return {relayCount: this.pool.relays.size}.toString();
    }

    /**
     * Connect to relays with optional timeout.
     * If the timeout is reached, the connection will be continued to be established in the background.
     */
    public async connect(timeoutMs?: number): Promise<void> {
        this.debug("Connecting to relays", { timeoutMs });
        return this.pool.connect(timeoutMs);
    }

    /**
     * Get a NDKUser object
     *
     * @param opts
     * @returns
     */
    public getUser(opts: GetUserParams): NDKUser {
        const user = new NDKUser(opts);
        user.ndk = this;
        return user;
    }

    /**
     * Create a new subscription. Subscriptions automatically start and finish when all relays
     * on the set send back an EOSE. (set `opts.closeOnEose` to `false` in order avoid this)
     *
     * @param filters
     * @param opts
     * @param relaySet explicit relay set to use
     * @param autoStart automatically start the subscription
     * @returns NDKSubscription
     */
    public subscribe(
        filters: NDKFilter | NDKFilter[],
        opts?: NDKSubscriptionOptions,
        relaySet?: NDKRelaySet,
        autoStart = true
    ): NDKSubscription {
        const subscription = new NDKSubscription(this, filters, opts, relaySet);
        if (autoStart) subscription.start();

        return subscription;
    }

    /**
     * Publish an event to a relay
     * @param event event to publish
     * @param relaySet explicit relay set to use
     * @param timeoutMs timeout in milliseconds to wait for the event to be published
     * @returns The relays the event was published to
     */
    public async publish(
        event: NDKEvent,
        relaySet?: NDKRelaySet,
        timeoutMs?: number
    ): Promise<Set<NDKRelay>> {
        if (!relaySet) {
            // If we have a devWriteRelaySet, use it to publish all events
            relaySet = this.devWriteRelaySet || calculateRelaySetFromEvent(this, event);
        }

        return relaySet.publish(event, timeoutMs);
    }

    /**
     * Fetch a single event
     */
    public async fetchEvent(id: string) : Promise<NDKEvent | null>;
    public async fetchEvent(filter: NDKFilter, opts?: NDKSubscriptionOptions) : Promise<NDKEvent | null>;
    public async fetchEvent(idOrFilter: string|NDKFilter, opts?: NDKSubscriptionOptions, relaySet?: NDKRelaySet) : Promise<NDKEvent | null> {
        let filter: NDKFilter;

        if (typeof idOrFilter === "string") {
            filter = filterFromId(idOrFilter);
        } else {
            filter = idOrFilter;
        }

        if (!filter) {
            throw new Error(`Invalid filter: ${JSON.stringify(idOrFilter)}`);
        }

        return new Promise((resolve) => {
            const s = this.subscribe(filter, { ...(opts||{}), closeOnEose: true }, relaySet, false);
            s.on("event", (event) => {
                event.ndk = this;
                resolve(event);
            });

            s.on("eose", () => {
                resolve(null);
            });

            s.start();
        });
    }

    /**
     * Fetch events
     */
    public async fetchEvents(
        filter: NDKFilter,
        opts?: NDKSubscriptionOptions,
        relaySet?: NDKRelaySet,
    ): Promise<Set<NDKEvent>> {
        return new Promise((resolve) => {
            const events: Map<string, NDKEvent> = new Map();

            const relaySetSubscription = this.subscribe(filter, { ...(opts||{}), closeOnEose: true }, relaySet, false);

            relaySetSubscription.on("event", (event: NDKEvent) => {
                const existingEvent = events.get(event.tagId());
                if (existingEvent) {
                    event = dedupEvent(existingEvent, event);
                }

                event.ndk = this;
                events.set(event.tagId(), event);
            });
            relaySetSubscription.on("eose", () => {
                resolve(new Set(events.values()));
            });

            relaySetSubscription.start();
        });
    }

    /**
     * Ensures that a signer is available to sign an event.
     */
    public async assertSigner() {
        if (!this.signer) {
            this.emit("signerRequired");
            throw new Error("Signer required");
        }
    }
}
