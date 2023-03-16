export * from './relay';
import {Event} from './events/';
import {Pool} from './relay/pool/';
import {Signer} from './signers/';
import User, {UserParams} from './user/';
import {RelaySet} from './relay/sets/';
import {Filter, Subscription, SubscriptionOptions} from './subscription/';
import {
    calculateRelaySetFromFilter,
    calculateRelaySetFromEvent,
} from './relay/sets/calculate';

export interface NDKConstructorParams {
    explicitRelayUrls?: string[];
    signer?: Signer;
}
export interface GetUserParams extends UserParams {
    nip05?: string;
}

export default class NDK {
    public relayPool?: Pool;
    public signer?: Signer | undefined;

    public constructor(opts: NDKConstructorParams) {
        if (opts.explicitRelayUrls)
            this.relayPool = new Pool(opts.explicitRelayUrls);
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
    public async getUser(opts: GetUserParams): Promise<User | undefined> {
        let user: User | undefined;

        if (opts.nip05) {
            user = await User.fromNip05(opts.nip05);
        } else {
            user = new User(opts);
        }

        if (user) user.ndk = this;
        return user;
    }

    public subscribe(
        relaySet: RelaySet,
        filter: Filter,
        opts: SubscriptionOptions
    ): Subscription {
        return relaySet.subscribe(filter, opts);
    }

    public async publish(event: Event): Promise<void> {
        const relaySet = await calculateRelaySetFromEvent(this, event);

        return relaySet.publish(event);
    }

    /**
     * Fetch events
     */
    public async fetchEvents(filter: Filter): Promise<Set<Event> | null> {
        const relaySet = await calculateRelaySetFromFilter(this, filter);

        return new Promise(resolve => {
            const events: Set<Event> = new Set();
            const s = this.subscribe(relaySet, filter, {closeOnEose: true});

            s.on('event', (event: Event) => {
                events.add(event);
            });
            s.on('eose', () => {
                resolve(events);
            });
        });
    }
}
