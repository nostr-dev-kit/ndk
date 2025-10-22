import { beforeEach, describe, expect, it } from "vitest";
import { NDKEvent } from "../../events";
import { NDK } from "../../ndk";
import { NDKPrivateKeySigner } from "../../signers/private-key";

describe("Event Publishing Guardrails - Replaceable Events", () => {
    let ndk: NDK;
    let signer: NDKPrivateKeySigner;

    beforeEach(async () => {
        signer = NDKPrivateKeySigner.generate();
        ndk = new NDK({
            explicitRelayUrls: ["wss://relay.test.com"],
            aiGuardrails: true,
            signer,
        });
    });

    describe("replaceable events with old timestamps", () => {
        it("should warn when publishing a replaceable event (kind 0) with old timestamp", async () => {
            const event = new NDKEvent(ndk);
            event.kind = 0; // Metadata - replaceable
            event.content = JSON.stringify({ name: "Test User" });
            event.created_at = Math.floor(Date.now() / 1000) - 60; // 1 minute ago
            await event.sign();

            expect(() => ndk.aiGuardrails?.event?.publishing(event)).toThrow(/AI_GUARDRAILS/);
            expect(() => ndk.aiGuardrails?.event?.publishing(event)).toThrow(/Publishing a replaceable event with an old created_at timestamp/);
            expect(() => ndk.aiGuardrails?.event?.publishing(event)).toThrow(/1 minute old/);
        });

        it("should warn when publishing a replaceable event (kind 3) with old timestamp", async () => {
            const event = new NDKEvent(ndk);
            event.kind = 3; // Contacts - replaceable
            event.content = "";
            event.created_at = Math.floor(Date.now() / 1000) - 120; // 2 minutes ago
            await event.sign();

            expect(() => ndk.aiGuardrails?.event?.publishing(event)).toThrow(/AI_GUARDRAILS/);
            expect(() => ndk.aiGuardrails?.event?.publishing(event)).toThrow(/2 minutes old/);
        });

        it("should warn when publishing a parameterized replaceable event (kind 30000) with old timestamp", async () => {
            const event = new NDKEvent(ndk);
            event.kind = 30000; // Parameterized replaceable
            event.content = "Test content";
            event.tags = [["d", "test-id"]];
            event.created_at = Math.floor(Date.now() / 1000) - 300; // 5 minutes ago
            await event.sign();

            expect(() => ndk.aiGuardrails?.event?.publishing(event)).toThrow(/AI_GUARDRAILS/);
            expect(() => ndk.aiGuardrails?.event?.publishing(event)).toThrow(/5 minutes old/);
        });

        it("should warn when publishing a kind 10000-20000 replaceable event with old timestamp", async () => {
            const event = new NDKEvent(ndk);
            event.kind = 10002; // Relay list - replaceable
            event.content = "";
            event.created_at = Math.floor(Date.now() / 1000) - 15; // 15 seconds ago
            await event.sign();

            expect(() => ndk.aiGuardrails?.event?.publishing(event)).toThrow(/AI_GUARDRAILS/);
            expect(() => ndk.aiGuardrails?.event?.publishing(event)).toThrow(/15 seconds old/);
        });

        it("should provide helpful hint about using publishReplaceable()", async () => {
            const event = new NDKEvent(ndk);
            event.kind = 0;
            event.content = JSON.stringify({ name: "Test" });
            event.created_at = Math.floor(Date.now() / 1000) - 60;
            await event.sign();

            try {
                ndk.aiGuardrails?.event?.publishing(event);
                expect.fail("Should have thrown");
            } catch (error: any) {
                expect(error.message).toContain("use publishReplaceable()");
                expect(error.message).toContain("✅ CORRECT");
                expect(error.message).toContain("await event.publishReplaceable()");
                expect(error.message).toContain("❌ WRONG");
                expect(error.message).toContain("await event.publish()");
            }
        });

        it("should NOT warn when publishing a replaceable event with fresh timestamp", async () => {
            const event = new NDKEvent(ndk);
            event.kind = 0;
            event.content = JSON.stringify({ name: "Test" });
            event.created_at = Math.floor(Date.now() / 1000); // Now
            await event.sign();

            // Test that guardrail doesn't throw - we're not testing actual relay publish
            // We check that the guardrail doesn't throw by calling the hook directly
            expect(() => ndk.aiGuardrails?.event?.publishing(event)).not.toThrow();
        });

        it("should NOT warn when publishing a replaceable event with timestamp within 10 seconds", async () => {
            const event = new NDKEvent(ndk);
            event.kind = 0;
            event.content = JSON.stringify({ name: "Test" });
            event.created_at = Math.floor(Date.now() / 1000) - 5; // 5 seconds ago (within threshold)
            await event.sign();

            expect(() => ndk.aiGuardrails?.event?.publishing(event)).not.toThrow();
        });

        it("should NOT warn when publishing a non-replaceable event with old timestamp", async () => {
            const event = new NDKEvent(ndk);
            event.kind = 1; // Text note - not replaceable
            event.content = "Test note";
            event.created_at = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
            await event.sign();

            // Should not throw warning for non-replaceable events
            expect(() => ndk.aiGuardrails?.event?.publishing(event)).not.toThrow();
        });

        it("should NOT warn when publishing an ephemeral event (kind 20000-30000)", async () => {
            const event = new NDKEvent(ndk);
            event.kind = 20001; // Ephemeral
            event.content = "Test ephemeral";
            event.created_at = Math.floor(Date.now() / 1000) - 60;
            await event.sign();

            expect(() => ndk.aiGuardrails?.event?.publishing(event)).not.toThrow();
        });

        it("should allow skipping the check with guardrailOff", async () => {
            const event = new NDKEvent(ndk);
            event.kind = 0;
            event.content = JSON.stringify({ name: "Test" });
            event.created_at = Math.floor(Date.now() / 1000) - 60;
            await event.sign();

            ndk.aiGuardrails.skip("event-replaceable-old-timestamp");

            // Should not throw
            expect(() => ndk.aiGuardrails?.event?.publishing(event)).not.toThrow();

            ndk.aiGuardrails.enable("event-replaceable-old-timestamp");
        });

        it("should not check when guardrails are disabled", async () => {
            const ndkNoGuardrails = new NDK({
                explicitRelayUrls: ["wss://relay.test.com"],
                aiGuardrails: false,
                signer,
            });

            const event = new NDKEvent(ndkNoGuardrails);
            event.kind = 0;
            event.content = JSON.stringify({ name: "Test" });
            event.created_at = Math.floor(Date.now() / 1000) - 3600;
            await event.sign();

            // Should not throw
            expect(() => ndkNoGuardrails.aiGuardrails?.event?.publishing(event)).not.toThrow();
        });

        it("should show age in seconds when less than 1 minute old", async () => {
            const event = new NDKEvent(ndk);
            event.kind = 0;
            event.content = JSON.stringify({ name: "Test" });
            event.created_at = Math.floor(Date.now() / 1000) - 45; // 45 seconds
            await event.sign();

            try {
                ndk.aiGuardrails?.event?.publishing(event);
                expect.fail("Should have thrown");
            } catch (error: any) {
                expect(error.message).toContain("45 seconds old");
                expect(error.message).not.toContain("minutes");
            }
        });
    });
});
