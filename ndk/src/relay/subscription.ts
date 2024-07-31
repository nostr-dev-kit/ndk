import type { Event } from "nostr-tools";
import { matchFilters } from "nostr-tools";
import type { NDKRelay } from ".";
import { NDKRelayStatus } from ".";
import type { NDKEventId, NostrEvent } from "../events";
import type {
    NDKFilter,
    NDKSubscription,
    NDKSubscriptionDelayedType,
    NDKSubscriptionInternalId,
} from "../subscription";
import type { NDKFilterFingerprint } from "../subscription/grouping";
import { mergeFilters } from "../subscription/grouping";
import type { NDKSubscriptionManager } from "../subscription/manager";

type Item = {
    subscription: NDKSubscription;
    filters: NDKFilter[];
};

export enum NDKRelaySubscriptionStatus {
    INITIAL,

    /**
     * The subscription is pending execution.
     */
    PENDING,

    /**
     * The subscription is waiting for the relay to be ready.
     */
    WAITING,

    /**
     * The subscription is currently running.
     */
    RUNNING,
    CLOSED,
}

/**
 * Groups together a number of NDKSubscriptions (as created by the user),
 * filters (as computed internally), executed, or to be executed, within
 * a single specific relay.
 */
export class NDKRelaySubscription {
    public fingerprint: NDKFilterFingerprint;
    public items: Map<NDKSubscriptionInternalId, Item> = new Map();
    public topSubscriptionManager?: NDKSubscriptionManager;

    public debug: debug.Debugger;

    /**
     * Tracks the status of this REQ.
     */
    private status: NDKRelaySubscriptionStatus = NDKRelaySubscriptionStatus.INITIAL;

    public onClose?: (sub: NDKRelaySubscription) => void;

    private relay: NDKRelay;

    /**
     * Whether this subscription has reached EOSE.
     */
    private eosed = false;

    /**
     * These are subscriptions that have indicated they want to close before
     * we received an EOSE.
     *
     * This happens when this relay is the slowest to respond once the NDKSubscription
     * has received enough EOSEs to give up on this relay.
     */
    private itemsToRemoveAfterEose: NDKSubscriptionInternalId[] = [];

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

    /**
     * Event IDs that have been seen by this subscription.
     */
    private eventIds: Set<NDKEventId> = new Set();

    /**
     *
     * @param fingerprint The fingerprint of this subscription.
     */
    constructor(relay: NDKRelay, fingerprint?: NDKFilterFingerprint) {
        this.relay = relay;
        const rand = Math.random().toString(36).substring(7);
        this.debug = relay.debug.extend("subscription-" + rand);
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
        if (this.items.has(subscription.internalId)) return;

        subscription.on("close", this.removeItem.bind(this, subscription));
        this.items.set(subscription.internalId, { subscription, filters });

        if (this.status !== NDKRelaySubscriptionStatus.RUNNING) {
            // if we have an explicit subId in this subscription, append it to the subId
            if (subscription.subId && (!this._subId || this._subId.length < 48)) {
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
                // the subscription was already running when this new NDKSubscription came
                // so we might have some events this new NDKSubscription wants
                // this.catchUpSubscription(subscription, filters);
                break;
            case NDKRelaySubscriptionStatus.PENDING:
                // this subscription is already scheduled to be executed
                // we need to evaluate whether this new NDKSubscription
                // modifies our execution plan
                this.evaluateExecutionPlan(subscription);
                break;
            case NDKRelaySubscriptionStatus.CLOSED:
                this.debug("Subscription is closed, cannot add new items");
                throw new Error("Cannot add new items to a closed subscription");
        }
    }

    /**
     * A subscription has been closed, remove it from the list of items.
     * @param subscription
     */
    public removeItem(subscription: NDKSubscription) {
        // If we have not EOSEd yet, don't delete the item, rather mark it for deletion
        if (!this.eosed) {
            this.itemsToRemoveAfterEose.push(subscription.internalId);
            return;
        }

        this.items.delete(subscription.internalId);

        if (this.items.size === 0) {
            // no more items, close the subscription
            this.close();
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

    private catchUpSubscription(subscription: NDKSubscription, filters: NDKFilter[]) {
        this.debug("TODO: catch up subscription", subscription, filters);
    }

    private evaluateExecutionPlan(subscription: NDKSubscription) {
        if (!subscription.isGroupable()) {
            // execute immediately
            this.status = NDKRelaySubscriptionStatus.PENDING;
            this.execute();
            return;
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
                throw new Error(
                    "Unknown delay type combination " + existingDelayType + " " + delayType
                );
            }
        }
    }

    private schedule(delay: number, delayType: NDKSubscriptionDelayedType) {
        this.status = NDKRelaySubscriptionStatus.PENDING;
        const currentTime = Date.now();
        this.fireTime = currentTime + delay;
        this.delayType = delayType;
        const timer = setTimeout(this.execute.bind(this), delay);

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

        this.status = NDKRelaySubscriptionStatus.PENDING;
        this.execute();
    };

    private finalizeSubId() {
        // if we have subId parts, join those
        if (this.subIdParts.size > 0) {
            this._subId = Array.from(this.subIdParts).join("-");
        } else {
            this._subId = this.fingerprint.slice(0, 15);
        }

        this._subId += "-" + Math.random().toString(36).substring(2, 7);
    }

    // we do it this way so that we can remove the listener
    private reExecuteAfterAuth = (() => {
        const oldSubId = this.subId;
        this.debug("Re-executing after auth", this.items.size);
        this.relay.close(this.subId);
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
            this.relay.once("ready", this.executeOnRelayReady);
            return;
        } else if (this.relay.status < NDKRelayStatus.AUTHENTICATED) {
            this.relay.once("authed", this.reExecuteAfterAuth);
        }

        this.status = NDKRelaySubscriptionStatus.RUNNING;

        this.finalizeSubId();

        this.executeFilters = this.compileFilters();

        this.relay.req(this);
    }

    public onstart() {}
    public onevent(event: NostrEvent) {
        this.topSubscriptionManager?.seenEvent(event.id!, this.relay);

        for (const { subscription } of this.items.values()) {
            if (matchFilters(subscription.filters, event as Event)) {
                subscription.eventReceived(event, this.relay, false);
            }
        }
    }

    public oneose() {
        this.eosed = true;

        for (const { subscription } of this.items.values()) {
            subscription.eoseReceived(this.relay);

            if (subscription.closeOnEose) {
                this.removeItem(subscription);
            }
        }
    }

    public onclose(reason?: string) {
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
        const filterCount = filters[0].length;

        for (let i = 0; i < filterCount; i++) {
            const allFiltersAtIndex = filters.map((filter) => filter[i]);
            mergedFilters.push(mergeFilters(allFiltersAtIndex));
        }

        return mergedFilters;
    }
}
