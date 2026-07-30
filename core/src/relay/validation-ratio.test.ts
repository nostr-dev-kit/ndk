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

// Regression: defaultValidationRatioFn was bound to NDKRelay (which lacks
// initialValidationRatio) instead of NDK, producing NaN at validatedCount>=10.
describe("defaultValidationRatioFn binding (NaN regression)", () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    test("rebound fn returns finite ratios at every count threshold", () => {
        const ndk = new NDK({ initialValidationRatio: 1.0, lowestValidationRatio: 0.1 });
        const relay = new NDKRelay("wss://t.relay", undefined, ndk);
        const fn = relay.validationRatioFn!; // rebound to relay in its ctor

        for (const c of [0, 9, 10, 50, 100, 1000]) {
            const r = fn(relay, c, 0);
            expect(Number.isFinite(r)).toBe(true);
            expect(r).toBeGreaterThanOrEqual(0.1);
            expect(r).toBeLessThanOrEqual(1.0);
        }

        // Exact decay: <10 -> initial; 10 -> 0.91; >=100 -> floor 0.1.
        expect(fn(relay, 9, 0)).toBe(1.0);
        expect(fn(relay, 10, 0)).toBeCloseTo(0.91, 5);
        expect(fn(relay, 100, 0)).toBeCloseTo(0.1, 5);
    });

    test("30s timer keeps targetValidationRatio finite; verification not stuck off", () => {
        const ndk = new NDK({ initialValidationRatio: 1.0, lowestValidationRatio: 0.1 });
        const relay = new NDKRelay("wss://t.relay", undefined, ndk);

        for (let i = 0; i < 100; i++) relay.addValidatedEvent();
        vi.advanceTimersByTime(30_000);

        expect(Number.isFinite(relay.targetValidationRatio)).toBe(true);
        // At a finite ratio in [0.1, 1.0), some draws verify. Not permanently false.
        const anyTrue = Array.from({ length: 1000 }, () => relay.shouldValidateEvent()).some(Boolean);
        expect(anyTrue).toBe(true);
    });

    test("non-finite targetValidationRatio fails safe (verifies)", () => {
        const ndk = new NDK();
        const relay = new NDKRelay("wss://t.relay", undefined, ndk);

        // Simulate the pre-fix stuck state directly.
        (relay as any).targetValidationRatio = NaN;
        expect(relay.shouldValidateEvent()).toBe(true);

        (relay as any).targetValidationRatio = undefined;
        expect(relay.shouldValidateEvent()).toBe(true);
    });
});
