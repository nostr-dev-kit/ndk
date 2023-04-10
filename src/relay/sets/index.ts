import {NDKRelay, NDKRelayStatus} from '../index.js';
import NDKEvent from '../../events/index.js';
import {NDKSubscription} from '../../subscription/index.js';

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

    private subscribeOnRelay(relay: NDKRelay, subscription: NDKSubscription) {
        const sub = relay.subscribe(subscription);
        subscription.relaySubscriptions.set(relay, sub);
    }

    public subscribe(subscription: NDKSubscription): NDKSubscription {
        // If the relay is connected, send the subscription
        // If the relay is not connected, wait for it to connect (during the lifetime of the subscription)
        this.relays.forEach(relay => {
            if (relay.status === NDKRelayStatus.CONNECTED) {
                this.subscribeOnRelay(relay, subscription);
            // } else {
            //     relay.on('connect', () => this.subscribeOnRelay(relay, subscription), this.relaysetContext);
            //     relay.off('connect')
            }
        });

        return subscription;
    }

    public async publish(event: NDKEvent): Promise<void> {
        this.relays.forEach(async relay => {
            try {
                // TODO: if relay is not connected, don't try to send, but rather attach
                // to `connected` event and send it at that moment
                await relay.publish(event);
            } catch (e) {}
        });
    }

    public size(): number {
        return this.relays.size;
    }
}
