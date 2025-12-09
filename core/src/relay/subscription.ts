import type { NostrEvent } from "../events";
import type {
    NDKFilter,
    NDKSubscription,
    NDKSubscriptionDelayedType,
    NDKSubscriptionInternalId,
} from "../subscription";
import type { NDKFilterFingerprint } from "../subscription/grouping";
import { mergeFilters } from "../subscription/grouping";
import type { NDKSubscriptionManager } from "../subscription/manager";
import { formatFilters } from "../subscription/utils/format-filters";
import type { NDKRelay } from ".";
import { NDKRelayStatus } from ".";

type Item = {
    subscription: NDKSubscription;
    filters: NDKFilter[];
};

export enum NDKRelaySubscriptionStatus {
    INITIAL = 0,

    /**
     * The subscription is pending execution.
     */
    PENDING = 1,

    /**
     * The subscription is waiting for the relay to be ready.
     */
    WAITING = 2,

    /**
     * The subscription is currently running.
     */
    RUNNING = 3,
    CLOSED = 4,
}

/**
 * Groups together a number of NDKSubscriptions (as created by the user),
 * filters (as computed internally), executed, or to be executed, within
 * a single specific relay.
 */
export class NDKRelaySubscription {
    public fingerprint: NDKFilterFingerprint;
    public items: Map<NDKSubscriptionInternalId, Item> = new Map();
    public topSubManager: NDKSubscriptionManager;

    public debug: debug.Debugger;

    /**
     * Tracks the status of this REQ.
     */
    public status: NDKRelaySubscriptionStatus = NDKRelaySubscriptionStatus.INITIAL;

    public onClose?: (sub: NDKRelaySubscription) => void;

    private relay: NDKRelay;

    /**
     * Whether this subscription has reached EOSE.
     */
    private eosed = false;

    /**
     * Timeout at which this subscription will
     * start executing.
     */
    private executionTimer?: NodeJS.Timeout | number;

    /**
     * Track the time at which this subscription will fire.
     */
    private fireTime?: number;

    /**
     * The delay type that the current fireTime was calculated with.
     */
    private delayType?: NDKSubscriptionDelayedType;

    /**
     * The filters that have been executed.
     */
    public executeFilters?: NDKFilter[];

    readonly id = Math.random().toString(36).substring(7);

    /**
     *
     * @param fingerprint The fingerprint of this subscription.
     */
    constructor(
        relay: NDKRelay,
        fingerprint: NDKFilterFingerprint | null,
        topSubManager: NDKSubscriptionManager,
    ) {
        this.relay = relay;
        this.topSubManager = topSubManager;
        this.debug = relay.debug.extend(`sub[${this.id}]`);
        this.fingerprint = fingerprint || Math.random().toString(36).substring(7);
    }

    private _subId?: string;

    get subId(): string {
        if (this._subId) return this._subId;

        this._subId = this.fingerprint.slice(0, 15);
        return this._subId;
    }

    private subIdParts = new Set<string>();
    private addSubIdPart(part: string) {
        this.subIdParts.add(part);
    }

    public addItem(subscription: NDKSubscription, filters: NDKFilter[]) {
        if (this.items.has(subscription.internalId)) {
            return;
        }

        subscription.on("close", this.removeItem.bind(this, subscription));
        this.items.set(subscription.internalId, { subscription, filters });

        if (this.status !== NDKRelaySubscriptionStatus.RUNNING) {
            // if we have an explicit subId in this subscription, append it to the subId
            if (subscription.subId && (!this._subId || this._subId.length < 25)) {
                if (
                    this.status === NDKRelaySubscriptionStatus.INITIAL ||
                    this.status === NDKRelaySubscriptionStatus.PENDING
                ) {
                    this.addSubIdPart(subscription.subId);
                }
            }
        }

        switch (this.status) {
            case NDKRelaySubscriptionStatus.INITIAL:
                this.evaluateExecutionPlan(subscription);
                break;
            case NDKRelaySubscriptionStatus.RUNNING:
                break;
            case NDKRelaySubscriptionStatus.PENDING:
                // this subscription is already scheduled to be executed
                // we need to evaluate whether this new NDKSubscription
                // modifies our execution plan
                this.evaluateExecutionPlan(subscription);
                break;
            case NDKRelaySubscriptionStatus.CLOSED:
                this.debug("Subscription is closed, cannot add new items", {
                    filters: formatFilters(filters),
                    subId: subscription.subId,
                    internalId: subscription.internalId,
                });
                throw new Error("Cannot add new items to a closed subscription");
        }
    }

    /**
     * A subscription has been closed, remove it from the list of items.
     * @param subscription
     */
    public removeItem(subscription: NDKSubscription) {
        // this.debug("Removing item", { filters: subscription.filters, internalId: subscription.internalId, status: this.status, id: this.subId, fingerprint: this.fingerprint, items: this.items, itemsSize: this.items.size });
        this.items.delete(subscription.internalId);

        if (this.items.size === 0) {
            // If we haven't started executing yet (INITIAL or PENDING), cleanup immediately
            // to prevent sending an empty REQ when the timer fires
            if (this.status === NDKRelaySubscriptionStatus.INITIAL ||
                this.status === NDKRelaySubscriptionStatus.PENDING) {
                this.status = NDKRelaySubscriptionStatus.CLOSED;
                this.cleanup();
                return;
            }

            // if we haven't received an EOSE yet, don't close, relays don't like that
            // rather, when we EOSE and we have 0 items we will close there.
            if (!this.eosed) return;

            // no more items, close the subscription
            this.close();
            this.cleanup();
        }
    }

    private close() {
        if (this.status === NDKRelaySubscriptionStatus.CLOSED) return;

        const prevStatus = this.status;
        this.status = NDKRelaySubscriptionStatus.CLOSED;
        if (prevStatus === NDKRelaySubscriptionStatus.RUNNING) {
            try {
                this.relay.close(this.subId);
            } catch (e) {
                this.debug("Error closing subscription", e, this);
            }
        } else {
            this.debug("Subscription wanted to close but it wasn't running, this is probably ok", {
                subId: this.subId,
                prevStatus,
                sub: this,
            });
        }
        this.cleanup();
    }

    public cleanup() {
        // remove delayed execution
        if (this.executionTimer) clearTimeout(this.executionTimer as NodeJS.Timeout);

        // remove callback from relay
        this.relay.off("ready", this.executeOnRelayReady);
        this.relay.off("authed", this.reExecuteAfterAuth);

        // callback
        if (this.onClose) this.onClose(this);
    }

    private evaluateExecutionPlan(subscription: NDKSubscription) {
        if (!subscription.isGroupable()) {
            // execute immediately
            this.status = NDKRelaySubscriptionStatus.PENDING;
            this.execute();
            return;
        }

        // if the subscription is adding a limit filter we want to make sure
        // we are not adding too many, since limit filters concatenate filters instead of merging them
        // (as merging them would change the meaning)
        if (subscription.filters.find((filter) => !!filter.limit)) {
            // compile the filter
            this.executeFilters = this.compileFilters();

            // if we have 10 filters, we execute immediately, as most relays don't want more than 10
            if (this.executeFilters.length >= 10) {
                this.status = NDKRelaySubscriptionStatus.PENDING;
                this.execute();
                return;
            }
        }

        const delay = subscription.groupableDelay;
        const delayType = subscription.groupableDelayType;

        if (!delay) throw new Error("Cannot group a subscription without a delay");

        if (this.status === NDKRelaySubscriptionStatus.INITIAL) {
            this.schedule(delay, delayType);
        } else {
            // we already scheduled it, do we need to change it?
            const existingDelayType = this.delayType;
            const timeUntilFire = this.fireTime! - Date.now();

            if (existingDelayType === "at-least" && delayType === "at-least") {
                if (timeUntilFire < delay) {
                    // extend the timeout to the bigger timeout
                    if (this.executionTimer) clearTimeout(this.executionTimer as NodeJS.Timeout);
                    this.schedule(delay, delayType);
                }
            } else if (existingDelayType === "at-least" && delayType === "at-most") {
                if (timeUntilFire > delay) {
                    if (this.executionTimer) clearTimeout(this.executionTimer as NodeJS.Timeout);
                    this.schedule(delay, delayType);
                }
            } else if (existingDelayType === "at-most" && delayType === "at-most") {
                if (timeUntilFire > delay) {
                    if (this.executionTimer) clearTimeout(this.executionTimer as NodeJS.Timeout);
                    this.schedule(delay, delayType);
                }
            } else if (existingDelayType === "at-most" && delayType === "at-least") {
                if (timeUntilFire > delay) {
                    if (this.executionTimer) clearTimeout(this.executionTimer as NodeJS.Timeout);
                    this.schedule(delay, delayType);
                }
            } else {
                throw new Error(`Unknown delay type combination ${existingDelayType} ${delayType}`);
            }
        }
    }

    private schedule(delay: number, delayType: NDKSubscriptionDelayedType) {
        this.status = NDKRelaySubscriptionStatus.PENDING;
        const currentTime = Date.now();
        this.fireTime = currentTime + delay;
        this.delayType = delayType;

        const timer = setTimeout(() => {
            this.execute();
        }, delay);

        /**
         * We only store the execution timer if it's an "at-least" delay,
         * since "at-most" delays should not be cancelled.
         */
        if (delayType === "at-least") {
            this.executionTimer = timer;
        }
    }

    private executeOnRelayReady = () => {
        if (this.status !== NDKRelaySubscriptionStatus.WAITING) return;
        if (this.items.size === 0) {
            this.debug(
                "No items to execute; this relay was probably too slow to respond and the caller gave up",
                {
                    status: this.status,
                    fingerprint: this.fingerprint,
                    id: this.id,
                    subId: this.subId,
                },
            );
            this.cleanup();
            return;
        }

        this.debug("Executing on relay ready", {
            status: this.status,
            fingerprint: this.fingerprint,
            itemsSize: this.items.size,
            filters: formatFilters(this.compileFilters()),
        });

        this.status = NDKRelaySubscriptionStatus.PENDING;
        this.execute();
    };

    private finalizeSubId() {
        // if we have subId parts, join those
        if (this.subIdParts.size > 0) {
            // Truncate individual parts and limit total length
            const parts = Array.from(this.subIdParts).map((part) => part.substring(0, 10));
            let joined = parts.join("-");

            // Ensure total subId doesn't exceed reasonable length (20 chars + 5 for random)
            if (joined.length > 20) {
                joined = joined.substring(0, 20);
            }

            this._subId = joined;
        } else {
            this._subId = this.fingerprint.slice(0, 15);
        }

        this._subId += `-${Math.random().toString(36).substring(2, 7)}`;
    }

    // we do it this way so that we can remove the listener
    private reExecuteAfterAuth = (() => {
        const oldSubId = this.subId;
        this.debug("Re-executing after auth", this.items.size);
        if (this.eosed) {
            // we already received eose, so we can immediately close the old subscription
            // to create the new one
            this.relay.close(this.subId);
        } else {
            // relays don't like to have the subscription close before they eose back,
            // so wait until we eose before closing the old subscription
            this.debug(
                "We are abandoning an opened subscription, once it EOSE's, the handler will close it",
                {
                    oldSubId,
                },
            );
        }
        this._subId = undefined;
        this.status = NDKRelaySubscriptionStatus.PENDING;
        this.execute();
        this.debug("Re-executed after auth %s 👉 %s", oldSubId, this.subId);
    }).bind(this);

    private execute() {
        if (this.status !== NDKRelaySubscriptionStatus.PENDING) {
            // Because we might schedule this execution multiple times,
            // ensure we only execute once
            return;
        }

        // check on the relay connectivity status
        if (!this.relay.connected) {
            this.status = NDKRelaySubscriptionStatus.WAITING;
            this.debug("Waiting for relay to be ready", {
                status: this.status,
                id: this.subId,
                fingerprint: this.fingerprint,
                itemsSize: this.items.size,
            });
            this.relay.once("ready", this.executeOnRelayReady);
            return;
        }
        if (this.relay.status < NDKRelayStatus.AUTHENTICATED) {
            this.relay.once("authed", this.reExecuteAfterAuth);
        }

        this.status = NDKRelaySubscriptionStatus.RUNNING;

        this.finalizeSubId();

        this.executeFilters = this.compileFilters();
        this.relay.req(this);
    }

    public onstart() {}
    public onevent(event: NostrEvent) {
        this.topSubManager.dispatchEvent(event, this.relay);
    }

    public oneose(subId: string) {
        this.eosed = true;

        // if this is a different subId, then it belongs to a previously
        // created subscription we have abandoned; we can clean it up here
        if (subId !== this.subId) {
            this.debug("Received EOSE for an abandoned subscription", subId, this.subId);
            this.relay.close(subId);
            return;
        }

        // if we don't have any items left, this is a subscription in a slow
        // relay and the subscriptions have been EOSEd due to a timeout, we can
        // close this subscription
        if (this.items.size === 0) {
            this.close();
        }

        for (const { subscription } of this.items.values()) {
            subscription.eoseReceived(this.relay);

            if (subscription.closeOnEose) {
                this.removeItem(subscription);
            }
        }
    }

    public onclose(_reason?: string) {
        this.status = NDKRelaySubscriptionStatus.CLOSED;
    }

    public onclosed(reason?: string) {
        if (!reason) return;

        for (const { subscription } of this.items.values()) {
            subscription.closedReceived(this.relay, reason);
        }
    }

    /**
     * Grabs the filters from all the subscriptions
     * and merges them into a single filter.
     */
    private compileFilters(): NDKFilter[] {
        const mergedFilters: NDKFilter[] = [];
        const filters = Array.from(this.items.values()).map((item) => item.filters);

        if (!filters[0]) {
            this.debug("👀 No filters to merge", { itemsSize: this.items.size });
            return [];
        }
        const filterCount = filters[0].length;

        for (let i = 0; i < filterCount; i++) {
            const allFiltersAtIndex = filters.map((filter) => filter[i]);
            const merged = mergeFilters(allFiltersAtIndex);
            mergedFilters.push(...merged);
        }

        return mergedFilters;
    }
}
