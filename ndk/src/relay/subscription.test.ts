// NDKRelaySubscription.test.ts

import { NDKRelaySubscription, NDKRelaySubscriptionStatus } from "./subscription.js";
import type { NDKFilter, NDKSubscriptionInternalId } from "../subscription/index.js";
import { NDKSubscription } from "../subscription/index.js";
import debug from "debug";
import { NDK } from "../ndk/index.js";
import { NDKRelay } from "../index.js";

const ndk = new NDK();
const relay = new NDKRelay("wss://fake-relay.com");
const filters: NDKFilter[] = [{ kinds: [1] }];

// mock
relay.req = jest.fn();

// Mock classes for NDKSubscription and NDKFilter
class MockNDKSubscription extends NDKSubscription {
    internalId: NDKSubscriptionInternalId;
    private _groupableDelay: number;
    private _groupableDelayType: "at-most" | "at-least";
    public groupable = true;

    constructor(
        internalId: NDKSubscriptionInternalId,
        delay: number,
        delayType: "at-most" | "at-least"
    ) {
        super(ndk, filters);
        this.internalId = internalId;
        this._groupableDelay = delay;
        this._groupableDelayType = delayType;
    }

    get groupableDelay() {
        return this._groupableDelay;
    }

    get groupableDelayType() {
        return this._groupableDelayType;
    }

    public isGroupable(): boolean {
        return this.groupable;
    }
}

describe("NDKRelaySubscription", () => {
    let ndkRelaySubscription: NDKRelaySubscription;

    beforeEach(() => {
        ndkRelaySubscription = new NDKRelaySubscription(relay);
        ndkRelaySubscription.debug = debug("test");
    });

    it("should initialize with status INITIAL", () => {
        expect(ndkRelaySubscription["status"]).toBe(NDKRelaySubscriptionStatus.INITIAL);
    });

    it("should add item and schedule execution", () => {
        const subscription = new MockNDKSubscription("sub1", 1000, "at-least");

        ndkRelaySubscription.addItem(subscription, filters);
        expect(ndkRelaySubscription.items.size).toBe(1);
        expect(ndkRelaySubscription.items.get("sub1")).toEqual({ subscription, filters });
        expect(ndkRelaySubscription["status"]).toBe(NDKRelaySubscriptionStatus.PENDING);
    });

    it("should execute immediately if subscription is not groupable", () => {
        const subscription = new MockNDKSubscription("sub2", 1000, "at-least");
        jest.spyOn(subscription, "isGroupable").mockReturnValue(false);

        const executeSpy = jest.spyOn(ndkRelaySubscription as any, "execute");
        ndkRelaySubscription.addItem(subscription, filters);
        expect(executeSpy).toHaveBeenCalled();
    });

    it("should not add items to a closed subscription", () => {
        const subscription = new MockNDKSubscription("sub4", 1000, "at-least");
        ndkRelaySubscription["status"] = NDKRelaySubscriptionStatus.CLOSED;

        expect(() => {
            ndkRelaySubscription.addItem(subscription, []);
        }).toThrow("Cannot add new items to a closed subscription");
    });

    it("should schedule execution correctly", () => {
        const subscription = new MockNDKSubscription("sub5", 1000, "at-least");

        ndkRelaySubscription.addItem(subscription, filters);
        expect(ndkRelaySubscription["fireTime"]).toBeGreaterThan(Date.now());
    });

    it("should execute subscription", () => {
        const executeSpy = jest.spyOn(ndkRelaySubscription as any, "execute");
        const subscription = new MockNDKSubscription("sub6", 1000, "at-least");

        ndkRelaySubscription.addItem(subscription, filters);
        jest.advanceTimersByTime(1000);
        expect(executeSpy).toHaveBeenCalled();
    });

    it("should reschedule execution when a new subscription with a longer delay is added", () => {
        const subscription1 = new MockNDKSubscription("sub7", 5000, "at-least");
        const subscription2 = new MockNDKSubscription("sub8", 10000, "at-least");

        ndkRelaySubscription.addItem(subscription1, filters);
        const initialTimer = ndkRelaySubscription["executionTimer"];

        ndkRelaySubscription.addItem(subscription2, filters);
        const rescheduledTimer = ndkRelaySubscription["executionTimer"];

        expect(ndkRelaySubscription["fireTime"]).toBeGreaterThan(Date.now() + 5000);
        expect(rescheduledTimer).not.toBe(initialTimer);
    });

    it('should reset timer to shorter "at-most" delay when added after an "at-least" delay', () => {
        const subscription1 = new MockNDKSubscription("sub9", 5000, "at-least");
        const subscription2 = new MockNDKSubscription("sub10", 3000, "at-most");

        ndkRelaySubscription.addItem(subscription1, filters);
        ndkRelaySubscription.addItem(subscription2, filters);

        // Since the second subscription is "at-most", the timer should be reset to 3000ms
        expect(ndkRelaySubscription["fireTime"]).toBeLessThanOrEqual(Date.now() + 3000);
    });

    it('should maintain timer for shorter "at-most" delay when an "at-least" delay is added afterwards', () => {
        const subscription1 = new MockNDKSubscription("sub11", 3000, "at-most");
        const subscription2 = new MockNDKSubscription("sub12", 5000, "at-least");

        ndkRelaySubscription.addItem(subscription1, filters);
        const initialTimer = ndkRelaySubscription["executionTimer"];

        ndkRelaySubscription.addItem(subscription2, filters);
        const rescheduledTimer = ndkRelaySubscription["executionTimer"];

        // Since the first subscription is "at-most", it should not change when "at-least" is added
        expect(ndkRelaySubscription["fireTime"]).toBeLessThanOrEqual(Date.now() + 3000);
        expect(rescheduledTimer).toBe(initialTimer);
    });

    fit("should not close until we have reached EOSE", () => {
        const sub = new MockNDKSubscription("sub11", 0, "at-most");
        sub.groupable = false;
        ndkRelaySubscription.addItem(sub, filters);
        const closeSpy = jest.spyOn(ndkRelaySubscription as any, "close");
        sub.stop();
        expect(closeSpy).not.toHaveBeenCalled();
    });

    fit("it should close when we reach EOSE if the subscription said it was closed", () => {
        const sub = new MockNDKSubscription("sub11", 0, "at-most");
        sub.groupable = false;
        sub.closeOnEose = true;
        ndkRelaySubscription.addItem(sub, filters);
        const closeSpy = jest.spyOn(ndkRelaySubscription as any, "close");
        sub.stop();
        expect(closeSpy).not.toHaveBeenCalled();
        ndkRelaySubscription.oneose();
        expect(closeSpy).toHaveBeenCalled();
    });
});

jest.useFakeTimers();
