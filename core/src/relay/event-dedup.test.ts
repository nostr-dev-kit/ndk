import { beforeEach, describe, expect, it } from "vitest";
import { NDKRelayConnectivity } from "./connectivity";

describe("getEventIdFromMessage", () => {
    let connectivity: NDKRelayConnectivity;

    beforeEach(() => {
        const mockRelay = {
            url: "wss://test.relay",
            debug: {
                extend: () => () => {},
            },
        } as any;

        connectivity = new NDKRelayConnectivity(mockRelay);
    });

    it("should extract event ID from valid EVENT message", () => {
        const msg = '["EVENT","sub123",{"id":"abc123def456789012345678901234567890123456789012345678901234abcd","pubkey":"xyz","content":"test"}]';
        const eventId = connectivity["getEventIdFromMessage"](msg);

        expect(eventId).toBe("abc123def456789012345678901234567890123456789012345678901234abcd");
    });

    it("should return null for non-EVENT messages", () => {
        expect(connectivity["getEventIdFromMessage"]('["EOSE","sub123"]')).toBeNull();
        expect(connectivity["getEventIdFromMessage"]('["OK","eventid",true]')).toBeNull();
        expect(connectivity["getEventIdFromMessage"]('["NOTICE","test"]')).toBeNull();
        expect(connectivity["getEventIdFromMessage"]('["COUNT","sub",{"count":5}]')).toBeNull();
    });

    it("should return null for malformed EVENT messages", () => {
        expect(connectivity["getEventIdFromMessage"]('["EVENT","sub",{}]')).toBeNull();
        expect(connectivity["getEventIdFromMessage"]('["EVENT","sub",{"noid":"value"}]')).toBeNull();
    });

    it("should handle event ID not being first field", () => {
        const msg = '["EVENT","sub",{"pubkey":"xyz","created_at":123,"id":"fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210"}]';
        const eventId = connectivity["getEventIdFromMessage"](msg);

        expect(eventId).toBe("fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210");
    });

    it("should be fast on non-EVENT messages", () => {
        const messages = [
            '["EOSE","sub"]',
            '["OK","id",true]',
            '["NOTICE","test"]',
            '["CLOSED","sub","reason"]',
        ];

        const start = performance.now();
        for (let i = 0; i < 10000; i++) {
            for (const msg of messages) {
                connectivity["getEventIdFromMessage"](msg);
            }
        }
        const elapsed = performance.now() - start;

        // Should process 40k non-EVENT messages in under 50ms
        expect(elapsed).toBeLessThan(50);
    });

    it("should handle real-world EVENT message format", () => {
        const realMsg = '["EVENT","test-sub",{"id":"0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef","pubkey":"a1b2c3d4","created_at":1234567890,"kind":1,"tags":[],"content":"hello","sig":"abcd"}]';
        const eventId = connectivity["getEventIdFromMessage"](realMsg);

        expect(eventId).toBe("0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef");
    });
});
