import NDKEvent from './events/';
import {NDKPool} from './relay/pool/';
import type {NDKSigner} from './signers/';
import NDKUser, {NDKUserParams} from './user/';
import {NDKUserProfile} from './user/profile';
import {NDKRelaySet} from './relay/sets/';
import {NDKFilter, NDKFilterOptions, NDKSubscription, NDKSubscriptionOptions} from './subscription/';
import { NDKCacheAdapter } from './cache';
import {
    calculateRelaySetFromFilter,
    calculateRelaySetFromEvent,
} from './relay/sets/calculate';
import EventEmitter from 'eventemitter3';

export {
    NDKEvent,
    NDKUser,
    NDKFilter,
    NDKUserProfile,
    NDKCacheAdapter,
};
export {NDKNip07Signer} from './signers/nip07/';
export {NDKZapInvoice} from './zap/invoice';
export {zapInvoiceFromEvent} from './zap/invoice';

export interface NDKConstructorParams {
    explicitRelayUrls?: string[];
    signer?: NDKSigner;
    cacheAdapter?: NDKCacheAdapter;
}
export interface GetUserParams extends NDKUserParams {
    npub?: string;
    hexpubkey?: string;
}

export default class NDK extends EventEmitter {
    public relayPool?: NDKPool;
    public signer?: NDKSigner;
    public cacheAdapter?: NDKCacheAdapter;

    public constructor(opts: NDKConstructorParams) {
        super();

        if (opts.explicitRelayUrls)
            this.relayPool = new NDKPool(opts.explicitRelayUrls);
        this.signer = opts.signer;
    }

    public async connect(): Promise<void> {
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
        const subscription = new NDKSubscription(this, filter, opts)
            .start();

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
                if (this.cacheAdapter) {
                    this.cacheAdapter.setEvent(event);
                }

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
