import { describe, expect, test } from "vitest";
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
