import { beforeEach, describe, expect, it } from "vitest";
import { NDKEvent } from "../../events";
import { NDK } from "../../ndk";
import { NDKPrivateKeySigner } from "../../signers/private-key";

describe("Event Signing Guardrails - Hashtag Tags", () => {
    let ndk: NDK;
    let signer: NDKPrivateKeySigner;

    beforeEach(async () => {
        // Create a signer for testing
        signer = NDKPrivateKeySigner.generate();

        // Create NDK instance with AI guardrails enabled
        ndk = new NDK({
            explicitRelayUrls: ["wss://relay.test.com"],
            aiGuardrails: true,
            signer,
        });
    });

    describe("hashtag tags with # prefix", () => {
        it("should throw fatal error when t-tag contains hashtag with # prefix", async () => {
            const event = new NDKEvent(ndk);
            event.kind = 1;
            event.content = "Test event";
            event.tags = [["t", "#nostr"]];

            await expect(event.sign()).rejects.toThrow(/AI_GUARDRAILS/);
            await expect(event.sign()).rejects.toThrow(/t-tag\[0\] contains hashtag with # prefix/);
            await expect(event.sign()).rejects.toThrow(/"#nostr"/);
        });

        it("should throw fatal error for multiple hashtags with # prefix", async () => {
            const event = new NDKEvent(ndk);
            event.kind = 1;
            event.content = "Test event";
            event.tags = [
                ["t", "#bitcoin"],
                ["t", "#nostr"],
                ["t", "programming"],
            ];

            await expect(event.sign()).rejects.toThrow(/AI_GUARDRAILS/);
            await expect(event.sign()).rejects.toThrow(/t-tag\[0\] contains hashtag with # prefix/);
            await expect(event.sign()).rejects.toThrow(/"#bitcoin"/);
        });

        it("should allow valid hashtags without # prefix", async () => {
            const event = new NDKEvent(ndk);
            event.kind = 1;
            event.content = "Test event";
            event.tags = [
                ["t", "bitcoin"],
                ["t", "nostr"],
                ["t", "programming"],
            ];

            await expect(event.sign()).resolves.toBeDefined();
        });

        it("should provide helpful hint about removing # prefix", async () => {
            const event = new NDKEvent(ndk);
            event.kind = 1;
            event.content = "Test event";
            event.tags = [["t", "#nostr"]];

            try {
                await event.sign();
                expect.fail("Should have thrown");
            } catch (error: any) {
                expect(error.message).toContain("Remove the # prefix from hashtag tags");
                expect(error.message).toContain("✅ event.tags.push(['t', 'nostr'])");
                expect(error.message).toContain("❌ event.tags.push(['t', '#nostr'])");
            }
        });

        it("should check mixed valid and invalid hashtags", async () => {
            const event = new NDKEvent(ndk);
            event.kind = 1;
            event.content = "Test event";
            event.tags = [
                ["t", "bitcoin"],
                ["t", "#nostr"], // Invalid
                ["t", "programming"],
            ];

            await expect(event.sign()).rejects.toThrow(/AI_GUARDRAILS/);
            await expect(event.sign()).rejects.toThrow(/t-tag\[1\] contains hashtag with # prefix/);
        });

        it("should not check hashtags when guardrails are disabled", async () => {
            const ndkNoGuardrails = new NDK({
                explicitRelayUrls: ["wss://relay.test.com"],
                aiGuardrails: false,
                signer,
            });

            const event = new NDKEvent(ndkNoGuardrails);
            event.kind = 1;
            event.content = "Test event";
            event.tags = [["t", "#nostr"]];

            // Should not throw
            await expect(event.sign()).resolves.toBeDefined();
        });

        it("should allow skipping the check with guardrailOff", async () => {
            const event = new NDKEvent(ndk);
            event.kind = 1;
            event.content = "Test event";
            event.tags = [["t", "#nostr"]];

            // Skip this specific check
            ndk.aiGuardrails.skip("tag-hashtag-with-prefix");

            // Should not throw
            await expect(event.sign()).resolves.toBeDefined();

            // Re-enable for other tests
            ndk.aiGuardrails.enable("tag-hashtag-with-prefix");
        });
    });
});
