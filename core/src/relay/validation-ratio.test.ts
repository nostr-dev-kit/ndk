import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { NDK } from "../ndk/index";
import { NDKRelay } from "./index";

describe("Relay Validation Ratio", () => {
    test("relay should have correct initial validation ratio", () => {
        const ndk = new NDK({
            initialValidationRatio: 1.0,
            lowestValidationRatio: 0.1,
        });
        const relay = new NDKRelay("wss://test.relay", undefined, ndk);

        // Initial ratio should be 1.0
        expect(relay.targetValidationRatio).toBe(1.0);
        expect(relay.shouldValidateEvent()).toBe(true);
    });

    test("validation tracking methods exist", () => {
        const ndk = new NDK();
        const relay = new NDKRelay("wss://test.relay", undefined, ndk);

        expect(typeof relay.addValidatedEvent).toBe("function");
        expect(typeof relay.addNonValidatedEvent).toBe("function");
        expect(typeof relay.shouldValidateEvent).toBe("function");
    });

    test("trusted relays skip validation", () => {
        const ndk = new NDK();
        const relay = new NDKRelay("wss://test.relay", undefined, ndk);

        // Mark relay as trusted
        relay.trusted = true;

        // Should never validate events from trusted relays
        expect(relay.shouldValidateEvent()).toBe(false);
    });
});

describe("Validation ratio of relays created after the NDK instance", () => {
    // NDKRelay works its target ratio out again every 30 seconds.
    const RATIO_UPDATE_MS = 30_000;

    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.clearAllTimers();
        vi.useRealTimers();
    });

    // One relay from the configured list, and one for each way a relay can
    // join the pool later.
    function relaysOf(ndk: NDK): NDKRelay[] {
        const configured = ndk.pool.getRelay("wss://configured.test", false);
        const added = new NDKRelay("wss://added.test", undefined, ndk);
        ndk.pool.addRelay(added, false);
        const explicit = ndk.addExplicitRelay("wss://explicit.test", undefined, false);
        const onDemand = ndk.pool.getRelay("wss://on-demand.test", false);
        return [configured, added, explicit, onDemand];
    }

    function addValidatedEvents(relays: NDKRelay[], count: number): void {
        for (const relay of relays) {
            for (let i = 0; i < count; i++) relay.addValidatedEvent();
        }
    }

    function checksEveryEvent(relay: NDKRelay): boolean {
        return Array.from({ length: 200 }, () => relay.shouldValidateEvent()).every(Boolean);
    }

    test("keep checking every event by default", () => {
        const ndk = new NDK({ explicitRelayUrls: ["wss://configured.test"] });
        const relays = relaysOf(ndk);

        addValidatedEvents(relays, 50);
        vi.advanceTimersByTime(RATIO_UPDATE_MS * 3);

        for (const relay of relays) {
            expect(relay.targetValidationRatio).toBe(1);
            expect(checksEveryEvent(relay)).toBe(true);
        }
    });

    test("follow the same sampling schedule as a relay from the configured list", () => {
        const ndk = new NDK({ explicitRelayUrls: ["wss://configured.test"], lowestValidationRatio: 0.1 });
        const relays = relaysOf(ndk);

        addValidatedEvents(relays, 50);
        vi.advanceTimersByTime(RATIO_UPDATE_MS);

        // Halfway from initialValidationRatio (1.0) to lowestValidationRatio (0.1).
        for (const relay of relays) {
            expect(relay.targetValidationRatio).toBeCloseTo(0.55);
        }
    });

    test("configured relays take the ratio options given to the constructor", () => {
        const ndk = new NDK({
            explicitRelayUrls: ["wss://configured.test"],
            initialValidationRatio: 0.9,
            lowestValidationRatio: 0.5,
            validationRatioFn: () => 0.7,
        });
        const relays = relaysOf(ndk);

        for (const relay of relays) {
            expect(relay.targetValidationRatio).toBe(0.9);
            expect(relay.lowestValidationRatio).toBe(0.5);
        }

        addValidatedEvents(relays, 20);
        vi.advanceTimersByTime(RATIO_UPDATE_MS);

        for (const relay of relays) {
            expect(relay.targetValidationRatio).toBe(0.7);
        }
    });

    test("the default ratio function reads the NDK instance whatever it is called on", () => {
        const ndk = new NDK({ lowestValidationRatio: 0.1 });
        const relay = new NDKRelay("wss://added.test", undefined, ndk);
        const fn = ndk.validationRatioFn;
        if (!fn) throw new Error("NDK has no default validationRatioFn");

        expect(fn.call(relay, relay, 50, 0)).toBeCloseTo(0.55);
        expect(fn.call(undefined, relay, 50, 0)).toBeCloseTo(0.55);
        expect(fn(relay, 5, 0)).toBe(1);
    });

    test("a ratio that is not a number makes the relay check every event", () => {
        const ndk = new NDK({ validationRatioFn: () => Number.NaN });
        const relay = new NDKRelay("wss://added.test", undefined, ndk);

        addValidatedEvents([relay], 50);
        vi.advanceTimersByTime(RATIO_UPDATE_MS);

        expect(checksEveryEvent(relay)).toBe(true);
    });
});
