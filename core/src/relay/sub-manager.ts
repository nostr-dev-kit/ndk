import type { NDKFilterFingerprint } from "../subscription/grouping.js";
import { filterFingerprint } from "../subscription/grouping.js";
import type { NDKFilter, NDKSubscription } from "../subscription/index.js";
import type { NDKSubscriptionManager } from "../subscription/manager";
import type { NDKRelay } from ".";
import { NDKRelaySubscription, NDKRelaySubscriptionStatus } from "./subscription";

/**
 * The subscription manager of an NDKRelay is in charge of orchestrating the subscriptions
 * that are created and closed in a given relay.
 *
 * The manager is responsible for:
 * * restarting subscriptions when they are unexpectedly closed
 * * scheduling subscriptions that are received before the relay is connected
 * * grouping similar subscriptions to be compiled into individual REQs
 */
export class NDKRelaySubscriptionManager {
    private relay: NDKRelay;
    public subscriptions: Map<NDKFilterFingerprint, NDKRelaySubscription[]>;
    private generalSubManager: NDKSubscriptionManager;

    /**
     * @param relay - The relay instance.
     * @param generalSubManager - The subscription manager instance.
     */
    constructor(relay: NDKRelay, generalSubManager: NDKSubscriptionManager) {
        this.relay = relay;
        this.subscriptions = new Map();
        this.generalSubManager = generalSubManager;
    }

    /**
     * Adds a subscription to the manager.
     */
    public addSubscription(sub: NDKSubscription, filters: NDKFilter[]) {
        let relaySub: NDKRelaySubscription | undefined;

        if (!sub.isGroupable()) {
            // if the subscription is not groupable, just execute it
            relaySub = this.createSubscription(sub, filters);
        } else {
            const filterFp = filterFingerprint(filters, sub.closeOnEose);
            if (filterFp) {
                const existingSubs = this.subscriptions.get(filterFp);

                // Go through the subscriptions with this fingerprint and see if we there is one
                // that is not running yet
                relaySub = (existingSubs || []).find((sub) => sub.status < NDKRelaySubscriptionStatus.RUNNING);
            }
            relaySub ??= this.createSubscription(sub, filters, filterFp);
        }

        // at this point, relaySub is guaranteed to be defined
        relaySub.addItem(sub, filters);
    }

    public createSubscription(
        _sub: NDKSubscription,
        _filters: NDKFilter[],
        fingerprint?: NDKFilterFingerprint,
    ): NDKRelaySubscription {
        const relaySub = new NDKRelaySubscription(this.relay, fingerprint || null, this.generalSubManager);
        relaySub.onClose = this.onRelaySubscriptionClose.bind(this);
        const currentVal = this.subscriptions.get(relaySub.fingerprint) ?? [];
        this.subscriptions.set(relaySub.fingerprint, [...currentVal, relaySub]);

        return relaySub;
    }

    private onRelaySubscriptionClose(sub: NDKRelaySubscription) {
        let currentVal = this.subscriptions.get(sub.fingerprint) ?? [];
        if (!currentVal) {
            console.warn("Unexpectedly did not find a subscription with fingerprint", sub.fingerprint);
        } else if (currentVal.length === 1) {
            this.subscriptions.delete(sub.fingerprint);
        } else {
            currentVal = currentVal.filter((s) => s.id !== sub.id);
            this.subscriptions.set(sub.fingerprint, currentVal);
        }
    }
}
