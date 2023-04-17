import {NDKRelay, NDKRelayStatus} from '../index.js';
import NDKEvent from '../../events/index.js';
import {NDKSubscription, NDKSubscriptionGroup} from '../../subscription/index.js';
import * as secp256k1 from '@noble/secp256k1';
import {sha256} from '@noble/hashes/sha256';
import type NDK from '../../index.js';

/**
 * A relay set is a group of relays. This grouping can be short-living, for a single
 * REQ or can be long-lasting, for example for the explicit relay list the user
 * has specified.
 *
 * Requests to relays should be sent through this interface.
 */
export class NDKRelaySet {
    readonly relays: Set<NDKRelay>;
    private debug: debug.Debugger;
    private ndk: NDK;

    public constructor(relays: Set<NDKRelay>, ndk: NDK) {
        this.relays = relays;
        this.ndk = ndk;
        this.debug = ndk.debug.extend('relayset');
    }

    private subscribeOnRelay(relay: NDKRelay, subscription: NDKSubscription) {
        const sub = relay.subscribe(subscription);
        subscription.relaySubscriptions.set(relay, sub);
    }

    /**
     * Calculates an ID of this specific combination of relays.
     */
    public getId() {
        const urls = Array.from(this.relays).map(r => r.url);
        const urlString  = urls.sort().join(',');
        return secp256k1.utils.bytesToHex(sha256(urlString));
    }

    /**
     * Add a subscription to this relay set
     */
    public subscribe(subscription: NDKSubscription): NDKSubscription {
        const subGroupableId = subscription.groupableId();
        const groupableId = `${this.getId()}:${subGroupableId}`;

        if (!groupableId) {
            this.executeSubscription(subscription);
            return subscription;
        }

        const delayedSubscription = this.ndk.delayedSubscriptions.get(groupableId);
        if (delayedSubscription) {
            delayedSubscription.push(subscription);
        } else {
            setTimeout(() => {
                this.executeDelayedSubscription(groupableId);
            }, subscription.opts.groupableDelay);

            this.ndk.delayedSubscriptions.set(groupableId, [subscription]);
        }

        return subscription;
    }

    private executeDelayedSubscription(groupableId: string) {
        const subscriptions = this.ndk.delayedSubscriptions.get(groupableId);
        this.ndk.delayedSubscriptions.delete(groupableId);

        if (subscriptions) {
            if (subscriptions.length > 1) {
                this.executeSubscriptions(subscriptions);
            } else {
                this.executeSubscription(subscriptions[0]);
            }
        }
    }

    /**
     * This function takes a similar group of subscriptions, merges the filters
     * and sends a single subscription to the relay.
     */
    private executeSubscriptions(subscriptions: NDKSubscription[]) {
        const ndk = subscriptions[0].ndk;
        const subGroup = new NDKSubscriptionGroup(ndk, subscriptions);

        this.executeSubscription(subGroup);
    }

    private executeSubscription(subscription: NDKSubscription): NDKSubscription {
        // If the relay is connected, send the subscription
        // If the relay is not connected, wait for it to connect (during the lifetime of the subscription)

        this.debug('subscribing', {filter: subscription.filter});

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
