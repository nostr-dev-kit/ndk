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
    NDKFilterOptions,
    NDKSubscription,
    NDKSubscriptionOptions,
    filterFromId
} from "./subscription/index.js";
import NDKUser, { NDKUserParams } from "./user/index.js";
import { NDKUserProfile } from "./user/profile.js";

export * from "./events/index.js";
export * from "./events/kinds/index.js";
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
export * from "./zap/index.js";
export { NDKZapInvoice, zapInvoiceFromEvent } from "./zap/invoice.js";
export { NDKEvent, NDKUser, NDKFilter, NDKUserProfile, NDKCacheAdapter };

/**
 * Params object used to create a new NDK instance
 */
export interface NDKConstructorParams {
    explicitRelayUrls?: string[];
    devWriteRelayUrls?: string[];
    signer?: NDKSigner;
    cacheAdapter?: NDKCacheAdapter;
    debug?: debug.Debugger;
}
/**
 * Params object passed to getUser method
 */
export interface GetUserParams extends NDKUserParams {
    npub?: string;
    hexpubkey?: string;
}
/**
 * The base NDK class, contains several helper
 * methods to help access common use cases faster.
 */
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

    /**
     * Connect to relays with optional timeout.
     * If the timeout is reached, the connection will be continued to be established in the background.
     * @param timeoutMs an optional timeout in milliseconds
     */
    public async connect(timeoutMs?: number): Promise<void> {
        this.debug("Connecting to relays", { timeoutMs });
        return this.pool.connect(timeoutMs);
    }

    /**
     * Get a NDKUser object
     * @param opts A GetUserParams object
     * @returns NDKUser object
     */
    public getUser(opts: GetUserParams): NDKUser {
        const user = new NDKUser(opts);
        user.ndk = this;
        return user;
    }

    /**
     * Create a new subscription. Subscriptions automatically start and finish when all relays
     * on the set send back an EOSE (set `opts.closeOnEose` to `false` in order avoid this).
     * @param filter NDKFilter object
     * @param opts NDKSubscriptionOptions object
     * @param relaySet explicit relay set to use
     * @returns NDKSubscription
     */
    public subscribe(
        filter: NDKFilter,
        opts?: NDKSubscriptionOptions,
        relaySet?: NDKRelaySet
    ): NDKSubscription {
        const subscription = new NDKSubscription(this, filter, opts, relaySet);
        subscription.start();

        return subscription;
    }

    /**
     * Publish an event
     * @param event an NDKE object of the event to publish
     * @returns Promise<void>
     */
    public async publish(event: NDKEvent, relaySet?: NDKRelaySet): Promise<void> {
        if (!relaySet) {
            // If we have a devWriteRelaySet, use it to publish all events
            relaySet = this.devWriteRelaySet || calculateRelaySetFromEvent(this, event);
        }

        return relaySet.publish(event);
    }

    /**
     * Fetch a single event. There are two ways to use this method. You can either pass
     * a nip-19 id (e.g. note1...) or you can pass a filter and filter options.
     * @param id A nip-19 id.
     * @param filter An NDKFilter object
     * @param opts NDKFilterOptions object
     * @returns Promise<NDKEvent | null> will resolve to null if no event is found from the specified relays.
     */
    public async fetchEvent(id: string): Promise<NDKEvent | null>;
    public async fetchEvent(filter: NDKFilter, opts: NDKFilterOptions): Promise<NDKEvent | null>;
    public async fetchEvent(
        idOrFilter: string | NDKFilter,
        opts: NDKFilterOptions = {}
    ): Promise<NDKEvent | null> {
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
            const s = this.subscribe(filter, { ...opts, closeOnEose: true });
            s.on("event", (event) => {
                event.ndk = this;
                resolve(event);
            });

            s.on("eose", () => {
                resolve(null);
            });
        });
    }

    /**
     * Fetch all events based on a filter. Will disconnect upon receiving EOSE from relays.
     * @param filter An NDKFilter object
     * @param opts An NDKFilterOptions object
     * @returns Promise<Set<NDKEvent>>
     */
    public async fetchEvents(
        filter: NDKFilter,
        opts: NDKFilterOptions = {}
    ): Promise<Set<NDKEvent>> {
        return new Promise((resolve) => {
            const events: Map<string, NDKEvent> = new Map();

            const relaySetSubscription = this.subscribe(filter, { ...opts, closeOnEose: true });

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
