import { describe, expect, it } from "vitest";
import { NDK } from "../ndk/index.js";
import {
    assertSignedEvent,
    createSignedEvent,
    isSignedEvent,
    isUnsignedEvent,
    NDKEvent,
    type NDKSignedEvent,
} from "./index.js";

describe("NDKEvent signed/unsigned type system", () => {
    const ndk = new NDK();

    it("should identify unsigned events", () => {
        const event = new NDKEvent(ndk);
        event.content = "test";
        event.kind = 1;
        event.pubkey = "test-pubkey";

        // Without created_at, id, or sig, it's unsigned
        expect(isUnsignedEvent(event)).toBe(true);
        expect(isSignedEvent(event)).toBe(false);

        // Even with created_at but no id/sig, still unsigned
        event.created_at = Date.now() / 1000;
        expect(isUnsignedEvent(event)).toBe(true);
        expect(isSignedEvent(event)).toBe(false);
    });

    it("should identify signed events", () => {
        const event = new NDKEvent(ndk);
        event.content = "test";
        event.created_at = Date.now() / 1000;
        event.kind = 1;
        event.pubkey = "test-pubkey";
        event.id = "test-id";
        event.sig = "test-sig";

        expect(isSignedEvent(event)).toBe(true);
        expect(isUnsignedEvent(event)).toBe(false);
    });

    it("should require all three fields (id, sig, created_at) for signed events", () => {
        const event = new NDKEvent(ndk);
        event.content = "test";
        event.kind = 1;
        event.pubkey = "test-pubkey";

        // Missing all three
        expect(isSignedEvent(event)).toBe(false);

        // Only id
        event.id = "test-id";
        expect(isSignedEvent(event)).toBe(false);

        // id + sig
        event.sig = "test-sig";
        expect(isSignedEvent(event)).toBe(false);

        // All three - now it's signed
        event.created_at = Date.now() / 1000;
        expect(isSignedEvent(event)).toBe(true);

        // Test with created_at = 0 (invalid)
        event.created_at = 0;
        expect(isSignedEvent(event)).toBe(false);
    });

    it("should assert signed events correctly", () => {
        const signedEvent = new NDKEvent(ndk);
        signedEvent.content = "test";
        signedEvent.created_at = Date.now() / 1000;
        signedEvent.kind = 1;
        signedEvent.pubkey = "test-pubkey";
        signedEvent.id = "test-id";
        signedEvent.sig = "test-sig";

        // Should not throw
        expect(() => assertSignedEvent(signedEvent)).not.toThrow();

        const unsignedEvent = new NDKEvent(ndk);
        unsignedEvent.content = "test";
        unsignedEvent.created_at = Date.now() / 1000;

        // Should throw
        expect(() => assertSignedEvent(unsignedEvent)).toThrow("Expected signed event but event is not signed");
    });

    it("should create signed event type from signed event", () => {
        const event = new NDKEvent(ndk);
        event.content = "test";
        event.created_at = Date.now() / 1000;
        event.kind = 1;
        event.pubkey = "test-pubkey";
        event.id = "test-id";
        event.sig = "test-sig";

        const signedEvent = createSignedEvent(event);

        // TypeScript should know these are defined
        const id: string = signedEvent.id;
        const sig: string = signedEvent.sig;

        expect(id).toBe("test-id");
        expect(sig).toBe("test-sig");
    });

    it("should fail to create signed event from unsigned event", () => {
        const event = new NDKEvent(ndk);
        event.content = "test";
        // Missing created_at, id, and sig

        expect(() => createSignedEvent(event)).toThrow("Cannot create signed event from unsigned event");

        // Even with created_at, still needs id and sig
        event.created_at = Date.now() / 1000;
        expect(() => createSignedEvent(event)).toThrow("Cannot create signed event from unsigned event");
    });

    it("should demonstrate type-safe subscription usage", () => {
        // This test demonstrates the types, not actual subscription behavior

        // Mock subscription event handler
        const handleEvent = (event: NDKSignedEvent) => {
            // No type assertions needed!
            const id: string = event.id;
            const sig: string = event.sig;
            const created_at: number = event.created_at;

            expect(typeof id).toBe("string");
            expect(typeof sig).toBe("string");
            expect(typeof created_at).toBe("number");
        };

        // Create a signed event to test with
        const event = new NDKEvent(ndk);
        event.content = "test";
        event.created_at = Date.now() / 1000;
        event.kind = 1;
        event.pubkey = "test-pubkey";
        event.id = "test-id";
        event.sig = "test-sig";

        if (isSignedEvent(event)) {
            handleEvent(event);
        }
    });
});
