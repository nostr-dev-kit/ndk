import { NDKRelaySubscription } from "./subscription";
import type { NDKSubscription } from "../subscription/index.js";
import type { NDKFilter } from "../subscription/index.js";
import type { NDKFilterFingerprint } from "../subscription/grouping.js";
import { filterFingerprint } from "../subscription/grouping.js";
import type { NDKRelay } from ".";
import type { NDKSubscriptionManager } from "../subscription/manager";

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
    private subscriptions: Map<NDKFilterFingerprint, NDKRelaySubscription>;
    private topSubscriptionManager?: NDKSubscriptionManager;
    private debug: debug.Debugger;

    constructor(relay: NDKRelay, topSubscriptionManager?: NDKSubscriptionManager) {
        this.relay = relay;
        this.subscriptions = new Map();
        this.debug = relay.debug.extend("sub-manager");
        this.topSubscriptionManager = topSubscriptionManager;
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
            if (filterFp) relaySub = this.subscriptions.get(filterFp);
            relaySub ??= this.createSubscription(sub, filters, filterFp);
        }

        // at this point, relaySub is guaranteed to be defined
        relaySub.addItem(sub, filters);
    }

    public createSubscription(
        sub: NDKSubscription,
        filters: NDKFilter[],
        fingerprint?: NDKFilterFingerprint
    ): NDKRelaySubscription {
        const relaySub = new NDKRelaySubscription(this.relay, fingerprint);
        relaySub.topSubscriptionManager = this.topSubscriptionManager;
        relaySub.onClose = this.onRelaySubscriptionClose.bind(this);

        this.subscriptions.set(relaySub.fingerprint, relaySub);

        return relaySub;
    }

    private onRelaySubscriptionClose(sub: NDKRelaySubscription) {
        this.subscriptions.delete(sub.fingerprint);
    }
}
