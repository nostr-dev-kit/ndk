import NDKEvent from './events/index.js';
import {NDKPool} from './relay/pool/index.js';
import type {NDKSigner} from './signers/index.js';
import NDKUser, {NDKUserParams} from './user/index.js';
import {NDKUserProfile} from './user/profile.js';
import {NDKFilter, NDKFilterOptions, NDKSubscription, NDKSubscriptionOptions} from './subscription/index.js';
import { NDKCacheAdapter } from './cache/index.js';
import { calculateRelaySetFromEvent } from './relay/sets/calculate.js';
import dedupEvent from './events/dedup.js';
import EventEmitter from 'eventemitter3';
import debug from 'debug';

export {
    NDKEvent,
    NDKUser,
    NDKFilter,
    NDKUserProfile,
    NDKCacheAdapter,
    NDKSubscription
};
export {NDKRelay} from './relay/index.js';
export {NDKKind} from './events/kind.js';
export {NDKNip07Signer} from './signers/nip07/index.js';
export {NDKZapInvoice, zapInvoiceFromEvent} from './zap/invoice.js';

export interface NDKConstructorParams {
    explicitRelayUrls?: string[];
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

    public constructor(opts: NDKConstructorParams = {}) {
        super();

        this.debug = opts.debug || debug('ndk');
        this.pool = new NDKPool(opts.explicitRelayUrls||[], this);
        this.signer = opts.signer;
        this.cacheAdapter = opts.cacheAdapter;

        this.debug('initialized', {
            relays: opts.explicitRelayUrls,
            signer: opts.signer?.constructor.name || 'none',
            cacheAdapter: opts.cacheAdapter?.constructor.name || 'none',
        });
    }

    /**
     * Connect to relays with optional timeout.
     * If the timeout is reached, the connection will be continued to be established in the background.
     */
    public async connect(timeoutMs?: number): Promise<void> {
        this.debug('Connecting to relays');
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

    public subscribe(
        filter: NDKFilter,
        opts?: NDKSubscriptionOptions
    ): NDKSubscription {
        const subscription = new NDKSubscription(this, filter, opts);
        subscription.start();

        return subscription;
    }

    public async publish(event: NDKEvent): Promise<void> {
        const relaySet = calculateRelaySetFromEvent(this, event);

        return relaySet.publish(event);
    }

    /**
     * Fetch a single event
     */
    public async fetchEvent(filter: NDKFilter, opts: NDKFilterOptions = {}): Promise<NDKEvent> {
        return new Promise(resolve => {
            const s = this.subscribe(filter, {...opts, closeOnEose: true});
            s.on('event', event => {
                event.ndk = this;
                resolve(event);
            });
        });
    }

    /**
     * Fetch events
     */
    public async fetchEvents(filter: NDKFilter, opts: NDKFilterOptions = {}): Promise<Set<NDKEvent>> {
        return new Promise(resolve => {
            const events: Map<string, NDKEvent> = new Map();

            const relaySetSubscription = this.subscribe(filter, {...opts, closeOnEose: true});

            relaySetSubscription.on('event', (event: NDKEvent) => {
                const existingEvent = events.get(event.tagId());
                if (existingEvent) {
                    event = dedupEvent(existingEvent, event);
                }

                event.ndk = this;
                events.set(event.tagId(), event);
            });
            relaySetSubscription.on('eose', () => {
                resolve(new Set(events.values()));
            });
        });
    }

    /**
     * Ensures that a signer is available to sign an event.
     */
    public async assertSigner() {
        if (!this.signer) {
            this.emit('signerRequired');
            throw new Error('Signer required');
        }
    }
}
