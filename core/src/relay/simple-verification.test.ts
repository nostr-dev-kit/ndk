import { describe, expect, test } from "vitest";
import { NDK } from "../ndk/index";
import { NDKRelay } from "./index";

describe("Basic Relay Tests", () => {
    test("relay should have correct initial properties", () => {
        const ndk = new NDK();
        const relay = new NDKRelay("wss://test.relay", undefined, ndk);

        expect(relay.url).toBe("wss://test.relay/");
        expect(typeof relay.shouldValidateEvent).toBe("function");
    });
});
