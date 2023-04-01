import Event from './events/';
import {Pool} from './relay/pool/';
import type {SignerType} from './signers/';
import User, {UserParams} from './user/';
import {UserProfile} from './user/profile';
import {RelaySet} from './relay/sets/';
import {Filter, FilterOptions, Subscription, SubscriptionOptions} from './subscription/';
import {
    calculateRelaySetFromFilter,
    calculateRelaySetFromEvent,
} from './relay/sets/calculate';
import EventEmitter from 'eventemitter3';

export {Event as NDKEvent};
export {User as NDKUser};
export {Filter as NDKFilter};
export {UserProfile as NDKUserProfile};
export {Nip07Signer as NDKNip07Signer} from './signers/nip07/';
export {ZapInvoice as NDKZapInvoice} from './zap/invoice';
export {zapInvoiceFromEvent} from './zap/invoice';

export interface NDKConstructorParams {
    explicitRelayUrls?: string[];
    signer?: SignerType;
    cacheAdapter?: NDKCacheAdapter;
}
export interface GetUserParams extends UserParams {
    npub?: string;
    hexpubkey?: string;
}

export interface NDKCacheAdapter {
    getEvents(filter: Filter): Promise<Set<Event>>;
}

export default class NDK extends EventEmitter {
    public relayPool?: Pool;
    public signer?: SignerType;
    public cacheAdapter?: NDKCacheAdapter;

    public constructor(opts: NDKConstructorParams) {
        super();
        if (opts.explicitRelayUrls)
            this.relayPool = new Pool(opts.explicitRelayUrls);
        this.signer = opts.signer;
    }

    public async connect(): Promise<void> {
        return this.relayPool?.connect();
    }

    /**
     * Get a User object
     *
     * @param opts
     * @returns
     */
    public getUser(opts: GetUserParams): User {
        const user = new User(opts);
        user.ndk = this;
        return user;
    }

    public subscribe(
        filter: Filter,
        relaySet?: RelaySet,
        opts?: SubscriptionOptions
    ): Subscription {
        if (!relaySet) {
            relaySet = calculateRelaySetFromFilter(this, filter);
        }

        if (!relaySet) {
            throw new Error('No relay set');
        }

        return relaySet.subscribe(filter, opts);
    }

    public async publish(event: Event): Promise<void> {
        const relaySet = await calculateRelaySetFromEvent(this, event);

        return relaySet.publish(event);
    }

    /**
     * Fetch a single event
     */
    public async fetchEvent(filter: Filter): Promise<Event> {
        const relaySet = await calculateRelaySetFromFilter(this, filter);

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
    public async fetchEvents(filter: Filter, opts?: FilterOptions): Promise<Set<Event>> {
        // check for cached event
        if (!opts?.skipCache && this.cacheAdapter) {
            const cachedEvents = await this.cacheAdapter.getEvents(filter);
        }

        const relaySet = await calculateRelaySetFromFilter(this, filter);

        return new Promise(resolve => {
            const events: Set<Event> = new Set();
            const s = this.subscribe(filter, relaySet, {closeOnEose: true});

            s.on('event', (event: Event) => {
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
