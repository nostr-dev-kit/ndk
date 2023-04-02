import {NDKRelay} from '../index';
import Event from '../../events/index';
import {NDKSubscription} from '../../subscription/index';

/**
 * A relay set is a group of relays. This grouping can be short-living, for a single
 * REQ or can be long-lasting, for example for the explicit relay list the user
 * has specified.
 *
 * Requests to relays should be sent through this interface.
 */
export class NDKRelaySet {
    readonly relays: Set<NDKRelay>;

    public constructor(relays: Set<NDKRelay>) {
        this.relays = relays;
    }

    public subscribe(subscription: NDKSubscription): NDKSubscription {
        this.relays.forEach(relay => {
            // TODO: if relay is not connected, don't try to send, but rather attach
            // to connected event and send it at that moment if this subscription hasn't
            // been destroyed
            const sub = relay.subscribe(subscription);
            subscription.relaySubscriptions.set(relay, sub);
        });

        return subscription;
    }

    public async publish(event: Event): Promise<void> {
        this.relays.forEach(async relay => {
            try {
                // TODO: if relay is not connected, don't try to send, but rather attach
                // to `connected` event and send it at that moment
                await relay.publish(event);
            } catch (e) {
                console.log(e);
            }
        });
    }

    public size(): number {
        return this.relays.size;
    }
}
