import NDKEvent from './events/index';
import {NDKPool} from './relay/pool/index';
import type {NDKSigner} from './signers/index';
import NDKUser, {NDKUserParams} from './user/index';
import {NDKUserProfile} from './user/profile';
import {NDKFilter, NDKFilterOptions, NDKSubscription, NDKSubscriptionOptions} from './subscription/index';
import { NDKCacheAdapter } from './cache/index';
import { calculateRelaySetFromEvent } from './relay/sets/calculate';
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
export {NDKNip07Signer} from './signers/nip07/index';
export {NDKZapInvoice, zapInvoiceFromEvent} from './zap/invoice';

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
    public relayPool?: NDKPool;
    public signer?: NDKSigner;
    public cacheAdapter?: NDKCacheAdapter;
    public debug: debug.Debugger;

    public constructor(opts: NDKConstructorParams) {
        super();

        if (opts.explicitRelayUrls)
            this.relayPool = new NDKPool(opts.explicitRelayUrls);
        this.signer = opts.signer;
        this.cacheAdapter = opts.cacheAdapter;
        this.debug = opts.debug || debug('ndk');

        this.debug('initialized', {
            relays: opts.explicitRelayUrls,
            signer: opts.signer?.constructor.name || 'none',
            cacheAdapter: opts.cacheAdapter?.constructor.name || 'none',
        });
    }

    public async connect(): Promise<void> {
        this.debug('Connecting to relays');
        return this.relayPool?.connect();
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
    public async fetchEvent(filter: NDKFilter): Promise<NDKEvent> {
        return new Promise(resolve => {
            const s = this.subscribe(filter, {closeOnEose: true});
            s.on('event', event => {
                event.ndk = this;
                resolve(event);
            });
        });
    }

    /**
     * Fetch events
     */
    public async fetchEvents(filter: NDKFilter, opts?: NDKFilterOptions): Promise<Set<NDKEvent>> {
        return new Promise(resolve => {
            const events: Set<NDKEvent> = new Set();

            const relaySetSubscription = this.subscribe(filter, {closeOnEose: true});

            relaySetSubscription.on('event', (event: NDKEvent) => {
                events.add(event);
            });
            relaySetSubscription.on('eose', () => {
                resolve(events);
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
