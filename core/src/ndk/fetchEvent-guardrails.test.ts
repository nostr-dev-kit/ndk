import { describe, expect, it } from "vitest";
import { NDK } from "./index.js";

describe("fetchEvent guardrails", () => {
    it("should warn when fetchEvent is called with a decoded naddr filter", async () => {
        const ndk = new NDK({
            explicitRelayUrls: ["wss://relay.primal.net"],
            aiGuardrails: true,
        });

        const naddrFilter = {
            kinds: [30023],
            authors: ["fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52"],
            "#d": ["identifier"],
        };

        try {
            await ndk.fetchEvent(naddrFilter);
            expect.fail("Should have thrown a guardrails error");
        } catch (error: any) {
            expect(error.message).toContain("For fetching a NIP-33 addressable event");
            expect(error.message).toContain("use fetchEvent() with the naddr directly");
            expect(error.message).toContain("nip19.decode(naddr)");
        }
    });

    it("should warn when fetchEvent is called with a single ID filter", async () => {
        const ndk = new NDK({
            explicitRelayUrls: ["wss://relay.primal.net"],
            aiGuardrails: true,
        });

        const idFilter = {
            ids: ["abc123"],
        };

        try {
            await ndk.fetchEvent(idFilter);
            expect.fail("Should have thrown a guardrails error");
        } catch (error: any) {
            expect(error.message).toContain("For fetching a single event");
            expect(error.message).toContain("use fetchEvent() instead");
            expect(error.message).toContain("fetchEvent(eventId)");
        }
    });

    it("should NOT warn when fetchEvent is called with a filter that is NOT a single event", async () => {
        const ndk = new NDK({
            explicitRelayUrls: ["wss://relay.primal.net"],
            aiGuardrails: true,
        });

        // This is a filter for multiple events - should not trigger the specific warnings
        // The fetchEvents guardrail will still trigger, but with the "use subscribe()" message
        try {
            await ndk.fetchEvent(
                {
                    kinds: [1],
                    limit: 10,
                },
                { closeOnEose: true },
            );
            expect.fail("Should have thrown a guardrails error");
        } catch (error: any) {
            // This should get the general "use subscribe()" warning, not the specific ones
            expect(error.message).toContain("In most cases, you should use subscribe()");
            expect(error.message).not.toContain("For fetching a NIP-33 addressable event");
            expect(error.message).not.toContain("For fetching a single event");
        }
    });

    it("should allow skipping the guardrail check", async () => {
        const ndk = new NDK({
            explicitRelayUrls: ["wss://relay.primal.net"],
            aiGuardrails: { skip: new Set(["fetch-events-usage"]) },
        });

        const naddrFilter = {
            kinds: [30023],
            authors: ["fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52"],
            "#d": ["identifier"],
        };

        // Should not throw because we skipped the check
        // Race against timeout to avoid network connection
        try {
            await Promise.race([
                ndk.fetchEvent(naddrFilter, { closeOnEose: true }),
                new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 100)),
            ]);
        } catch (error: any) {
            if (error.message !== "timeout") {
                // If it errors, it should NOT be a guardrails error
                expect(error?.message || "").not.toContain("AI_GUARDRAILS");
            }
        }
    });

    it("should disable all guardrails for one call with guardrailOff()", async () => {
        const ndk = new NDK({
            explicitRelayUrls: ["wss://relay.primal.net"],
            aiGuardrails: true,
        });

        const naddrFilter = {
            kinds: [30023],
            authors: ["fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52"],
            "#d": ["identifier"],
        };

        // Test that guardrailOff() suppresses the error
        let errorThrown = false;
        try {
            // This would normally throw immediately due to guardrails
            // We wrap in a promise race to avoid waiting for network
            await Promise.race([
                ndk.guardrailOff().fetchEvent(naddrFilter, { closeOnEose: true }),
                new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 100)),
            ]);
        } catch (error: any) {
            if (error.message !== "timeout") {
                errorThrown = true;
                // If it errors, it should NOT be a guardrails error
                expect(error?.message || "").not.toContain("AI_GUARDRAILS");
            }
        }

        // Verify that the next call DOES trigger the guardrail
        try {
            await ndk.fetchEvent(naddrFilter);
            expect.fail("Should have thrown a guardrails error");
        } catch (error: any) {
            expect(error.message).toContain("AI_GUARDRAILS");
        }
    });

    it("should disable specific guardrail for one call with guardrailOff('id')", async () => {
        const ndk = new NDK({
            explicitRelayUrls: ["wss://relay.primal.net"],
            aiGuardrails: true,
        });

        const naddrFilter = {
            kinds: [30023],
            authors: ["fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52"],
            "#d": ["identifier"],
        };

        // Test that guardrailOff('id') suppresses the specific error
        try {
            await Promise.race([
                ndk.guardrailOff("fetch-events-usage").fetchEvent(naddrFilter, { closeOnEose: true }),
                new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 100)),
            ]);
        } catch (error: any) {
            if (error.message !== "timeout") {
                // If it errors, it should NOT be a guardrails error
                expect(error?.message || "").not.toContain("AI_GUARDRAILS");
            }
        }

        // Verify that the next call DOES trigger the guardrail
        try {
            await ndk.fetchEvent(naddrFilter);
            expect.fail("Should have thrown a guardrails error");
        } catch (error: any) {
            expect(error.message).toContain("AI_GUARDRAILS");
        }
    });

    it("should disable multiple guardrails for one call with guardrailOff(['id1', 'id2'])", async () => {
        const ndk = new NDK({
            explicitRelayUrls: ["wss://relay.primal.net"],
            aiGuardrails: true,
        });

        const naddrFilter = {
            kinds: [30023],
            authors: ["fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52"],
            "#d": ["identifier"],
        };

        // Test that guardrailOff(['id1', 'id2']) suppresses the errors
        try {
            await Promise.race([
                ndk
                    .guardrailOff(["fetch-events-usage", "some-other-check"])
                    .fetchEvent(naddrFilter, { closeOnEose: true }),
                new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 100)),
            ]);
        } catch (error: any) {
            if (error.message !== "timeout") {
                // If it errors, it should NOT be a guardrails error
                expect(error?.message || "").not.toContain("AI_GUARDRAILS");
            }
        }

        // Verify that the next call DOES trigger the guardrail
        try {
            await ndk.fetchEvent(naddrFilter);
            expect.fail("Should have thrown a guardrails error");
        } catch (error: any) {
            expect(error.message).toContain("AI_GUARDRAILS");
        }
    });
});
