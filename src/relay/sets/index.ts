import { sha256 } from "@noble/hashes/sha256";
import { bytesToHex } from "@noble/hashes/utils";
import NDKEvent from "../../events/index.js";
import type NDK from "../../index.js";
import {
    NDKSubscription,
    NDKSubscriptionGroup,
} from "../../subscription/index.js";
import { NDKRelay, NDKRelayStatus } from "../index.js";

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
        this.debug = ndk.debug.extend("relayset");
    }

    /**
     * Adds a relay to this set.
     */
    public addRelay(relay: NDKRelay) {
        this.relays.add(relay);
    }

    /**
     * Creates a relay set from a list of relay URLs.
     *
     * This is useful for testing in development to pass a local relay
     * to publish methods.
     *
     * @param relayUrls - list of relay URLs to include in this set
     * @param ndk
     * @returns NDKRelaySet
     */
    static fromRelayUrls(relayUrls: string[], ndk: NDK): NDKRelaySet {
        const relays = new Set<NDKRelay>();
        for (const url of relayUrls) {
            const relay = ndk.pool.relays.get(url);
            if (relay) {
                relays.add(relay);
            }
        }

        return new NDKRelaySet(new Set(relays), ndk);
    }

    private subscribeOnRelay(relay: NDKRelay, subscription: NDKSubscription) {
        const sub = relay.subscribe(subscription);
        subscription.relaySubscriptions.set(relay, sub);
    }

    /**
     * Calculates an ID of this specific combination of relays.
     */
    public getId() {
        const urls = Array.from(this.relays).map((r) => r.url);
        const urlString = urls.sort().join(",");
        return bytesToHex(sha256(urlString));
    }

    /**
     * Add a subscription to this relay set
     */
    public subscribe(subscription: NDKSubscription): NDKSubscription {
        const subGroupableId = subscription.groupableId();
        const groupableId = `${this.getId()}:${subGroupableId}`;

        if (!subGroupableId) {
            this.executeSubscription(subscription);
            return subscription;
        }

        const delayedSubscription =
            this.ndk.delayedSubscriptions.get(groupableId);
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

    private executeSubscription(
        subscription: NDKSubscription
    ): NDKSubscription {
        this.debug("subscribing", { filters: subscription.filters });

        for (const relay of this.relays) {
            if (relay.status === NDKRelayStatus.CONNECTED) {
                // If the relay is already connected, subscribe immediately
                this.subscribeOnRelay(relay, subscription);
            } else {
                // If the relay is not connected, add a one-time listener to wait for the 'connected' event
                const connectedListener = () => {
                    this.debug(
                        "new relay coming online for active subscription",
                        {
                            relay: relay.url,
                            filters: subscription.filters,
                        }
                    );
                    this.subscribeOnRelay(relay, subscription);
                };
                relay.once("connect", connectedListener);

                // Add a one-time listener to remove the connectedListener when the subscription stops
                subscription.once("close", () => {
                    relay.removeListener("connect", connectedListener);
                });
            }
        }

        return subscription;
    }

    /**
     * Publish an event to all relays in this set. Returns the number of relays that have received the event.
     * @param event
     * @param timeoutMs - timeout in milliseconds for each publish operation and connection operation
     * @returns A set where the event was successfully published to
     */
    public async publish(
        event: NDKEvent,
        timeoutMs?: number
    ): Promise<Set<NDKRelay>> {
        const publishedToRelays: Set<NDKRelay> = new Set();

        // go through each relay and publish the event
        const promises: Promise<void>[] = Array.from(this.relays).map(
            (relay: NDKRelay) => {
                return new Promise<void>((resolve) => {
                    relay
                        .publish(event, timeoutMs)
                        .then(() => {
                            publishedToRelays.add(relay);
                            resolve();
                        })
                        .catch((err) => {
                            this.debug("error publishing to relay", {
                                relay: relay.url,
                                err,
                            });
                            resolve();
                        });
                });
            }
        );

        await Promise.all(promises);

        if (publishedToRelays.size === 0) {
            throw new Error("No relay was able to receive the event");
        }

        return publishedToRelays;
    }

    public size(): number {
        return this.relays.size;
    }
}
