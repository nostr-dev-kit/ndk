import debug from "debug";
import EventEmitter from "eventemitter3";
import type { NDKCacheAdapter } from "../cache/index.js";
import dedupEvent from "../events/dedup.js";
import type { NDKEvent } from "../events/index.js";
import { OutboxTracker } from "../outbox/tracker.js";
import type { NDKRelay, NDKRelayUrl } from "../relay/index.js";
import { NDKPool } from "../relay/pool/index.js";
import { NDKRelaySet } from "../relay/sets/index.js";
import { correctRelaySet } from "../relay/sets/utils.js";
import type { NDKSigner } from "../signers/index.js";
import {
    NDKSubscription,
    type NDKFilter,
    type NDKSubscriptionOptions,
    relaysFromBech32,
    filterFromId,
} from "../subscription/index.js";
import { NDKUser, type NDKUserParams } from "../user/index.js";

export interface NDKConstructorParams {
    /**
     * Relays we should explicitly connect to
     */
    explicitRelayUrls?: string[];

    /**
     * Relays we should never connect to
     */
    blacklistRelayUrls?: string[];

    /**
     * When this is set, we always write only to this relays.
     */
    devWriteRelayUrls?: string[];

    /**
     * Outbox relay URLs.
     */
    outboxRelayUrls?: string[];

    /**
     * Enable outbox model (defaults to false)
     */
    enableOutboxModel?: boolean;

    /**
     * Signer to use for signing events by default
     */
    signer?: NDKSigner;

    /**
     * Cache adapter to use for caching events
     */
    cacheAdapter?: NDKCacheAdapter;

    /**
     * Debug instance to use
     */
    debug?: debug.Debugger;
}

export interface GetUserParams extends NDKUserParams {
    npub?: string;
    hexpubkey?: string;
}

export const DEFAULT_OUTBOX_RELAYS = [
    "wss://purplepag.es",
    "wss://relay.snort.social",
];

export const DEFAULT_BLACKLISTED_RELAYS = [
    "wss://brb.io", // BRB
];

export class NDK extends EventEmitter {
    public explicitRelayUrls?: NDKRelayUrl[];
    public pool: NDKPool;
    public outboxPool?: NDKPool;
    public signer?: NDKSigner;
    public cacheAdapter?: NDKCacheAdapter;
    public debug: debug.Debugger;
    public devWriteRelaySet?: NDKRelaySet;
    public outboxTracker?: OutboxTracker;

    public constructor(opts: NDKConstructorParams = {}) {
        super();

        this.debug = opts.debug || debug("ndk");
        this.explicitRelayUrls = opts.explicitRelayUrls;
        this.pool = new NDKPool(
            opts.explicitRelayUrls || [],
            opts.blacklistRelayUrls,
            this
        );

        this.debug(
            `Starting with explicit relays: ${JSON.stringify(
                this.explicitRelayUrls
            )}`
        );

        if (opts.enableOutboxModel) {
            this.outboxPool = new NDKPool(
                opts.outboxRelayUrls || DEFAULT_OUTBOX_RELAYS,
                opts.blacklistRelayUrls || DEFAULT_BLACKLISTED_RELAYS,
                this,
                this.debug.extend("outbox-pool")
            );

            this.outboxTracker = new OutboxTracker(this);
        }

        this.signer = opts.signer;
        this.cacheAdapter = opts.cacheAdapter;

        if (opts.devWriteRelayUrls) {
            this.devWriteRelaySet = NDKRelaySet.fromRelayUrls(
                opts.devWriteRelayUrls,
                this
            );
        }
    }

    public toJSON(): string {
        return { relayCount: this.pool.relays.size }.toString();
    }

    /**
     * Connect to relays with optional timeout.
     * If the timeout is reached, the connection will be continued to be established in the background.
     */
    public async connect(timeoutMs?: number): Promise<void> {
        const connections = [this.pool.connect(timeoutMs)];

        if (this.outboxPool) {
            connections.push(this.outboxPool.connect(timeoutMs));
        }

        this.debug("Connecting to relays", { timeoutMs });

        // eslint-disable-next-line @typescript-eslint/no-empty-function
        return Promise.allSettled(connections).then(() => {});
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
     * Create a new subscription. Subscriptions automatically start, you can make them automatically close when all relays send back an EOSE by setting `opts.closeOnEose` to `true`)
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

        // Signal to the relays that they are explicitly being used
        if (relaySet) {
            for (const relay of relaySet.relays) {
                this.pool.useTemporaryRelay(relay);
            }
        }

        // if we have an authors filter and we are using the outbox pool,
        // we want to track the authors in the outbox tracker
        if (this.outboxPool && subscription.hasAuthorsFilter()) {
            const authors: string[] = subscription.filters
                .filter(
                    (filter) => filter.authors && filter.authors?.length > 0
                )
                .map((filter) => filter.authors!)
                .flat();

            this.outboxTracker?.trackUsers(authors);
        }

        if (autoStart) subscription.start();

        return subscription;
    }

    /**
     * Publish an event to a relay
     * @param event event to publish
     * @param relaySet explicit relay set to use
     * @param timeoutMs timeout in milliseconds to wait for the event to be published
     * @returns The relays the event was published to
     *
     * @deprecated Use `event.publish()` instead
     */
    public async publish(
        event: NDKEvent,
        relaySet?: NDKRelaySet,
        timeoutMs?: number
    ): Promise<Set<NDKRelay>> {
        this.debug("Deprecated: Use `event.publish()` instead");

        return event.publish(relaySet, timeoutMs);
    }

    /**
     * Fetch a single event.
     *
     * @param idOrFilter event id in bech32 format or filter
     * @param opts subscription options
     * @param relaySet explicit relay set to use
     */
    public async fetchEvent(
        idOrFilter: string | NDKFilter,
        opts?: NDKSubscriptionOptions,
        relaySet?: NDKRelaySet
    ): Promise<NDKEvent | null> {
        let filter: NDKFilter;

        // if no relayset has been provided, try to get one from the event id
        if (!relaySet && typeof idOrFilter === "string") {
            const relays = relaysFromBech32(idOrFilter);

            if (relays.length > 0) {
                relaySet = new NDKRelaySet(new Set<NDKRelay>(relays), this);

                // Make sure we have connected relays in this set
                relaySet = correctRelaySet(relaySet, this.pool);
            }
        }

        if (typeof idOrFilter === "string") {
            filter = filterFromId(idOrFilter);
        } else {
            filter = idOrFilter;
        }

        if (!filter) {
            throw new Error(`Invalid filter: ${JSON.stringify(idOrFilter)}`);
        }

        return new Promise((resolve) => {
            const s = this.subscribe(
                filter,
                { ...(opts || {}), closeOnEose: true },
                relaySet,
                false
            );
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
        filters: NDKFilter | NDKFilter[],
        opts?: NDKSubscriptionOptions,
        relaySet?: NDKRelaySet
    ): Promise<Set<NDKEvent>> {
        return new Promise((resolve) => {
            const events: Map<string, NDKEvent> = new Map();

            const relaySetSubscription = this.subscribe(
                filters,
                { ...(opts || {}), closeOnEose: true },
                relaySet,
                false
            );

            const onEvent = (event: NDKEvent) => {
                const dedupKey = event.deduplicationKey();

                const existingEvent = events.get(dedupKey);
                if (existingEvent) {
                    event = dedupEvent(existingEvent, event);
                }

                event.ndk = this;
                events.set(dedupKey, event);
            };

            // We want to inspect duplicated events
            // so we can dedup them
            relaySetSubscription.on("event", onEvent);
            relaySetSubscription.on("event:dup", onEvent);

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
