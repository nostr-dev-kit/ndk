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

export {NDKEvent};
export {NDKUser};
export {NDKFilter};
export {NDKUserProfile};
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
        relaySet?: NDKRelaySet,
        opts?: NDKSubscriptionOptions
    ): NDKSubscription {
        if (!relaySet) {
            relaySet = calculateRelaySetFromFilter(this, filter);
        }

        if (!relaySet) {
            throw new Error('No relay set');
        }

        return relaySet.subscribe(filter, opts);
    }

    public async publish(event: NDKEvent): Promise<void> {
        const relaySet = calculateRelaySetFromEvent(this, event);

        return relaySet.publish(event);
    }

    /**
     * Fetch a single event
     */
    public async fetchEvent(filter: NDKFilter): Promise<NDKEvent> {
        const relaySet = calculateRelaySetFromFilter(this, filter);

        return new Promise(resolve => {
            const s = this.subscribe(filter, relaySet, {closeOnEose: true});
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
        // check for cached event
        if (!opts?.skipCache && this.cacheAdapter) {
            const cachedEvents = await this.cacheAdapter.getEvents(filter);
        }

        const relaySet = await calculateRelaySetFromFilter(this, filter);

        return new Promise(resolve => {
            const events: Set<NDKEvent> = new Set();
            const s = this.subscribe(filter, relaySet, {closeOnEose: true});

            s.on('event', (event: NDKEvent) => {
                events.add(event);
            });
            s.on('eose', () => {
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
