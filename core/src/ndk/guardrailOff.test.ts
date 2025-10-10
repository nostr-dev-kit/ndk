import { describe, expect, it } from "vitest";
import { NDK } from "./index.js";

describe("guardrailOff()", () => {
    it("should disable all guardrails for one call", () => {
        const ndk = new NDK({
            explicitRelayUrls: ["wss://relay.primal.net"],
            aiGuardrails: true,
        });

        const naddrFilter = {
            kinds: [30023],
            authors: ["fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52"],
            "#d": ["identifier"],
        };

        // Set the flag
        ndk.guardrailOff();

        // Verify the flag was set to 'all'
        expect(ndk.aiGuardrails["_nextCallDisabled"]).toBe("all");

        // Verify shouldCheck returns false for any ID when 'all' is set
        expect(ndk.aiGuardrails.shouldCheck("fetch-events-usage")).toBe(false);
        expect(ndk.aiGuardrails.shouldCheck("any-other-check")).toBe(false);
    });

    it("should disable specific guardrail for one call", () => {
        const ndk = new NDK({
            explicitRelayUrls: ["wss://relay.primal.net"],
            aiGuardrails: true,
        });

        // Set the flag for a specific guardrail
        ndk.guardrailOff("fetch-events-usage");

        // Verify the flag was set correctly
        expect(ndk.aiGuardrails["_nextCallDisabled"]).toBeInstanceOf(Set);
        expect(ndk.aiGuardrails["_nextCallDisabled"]).toContain("fetch-events-usage");

        // Verify shouldCheck returns false only for the specified ID
        expect(ndk.aiGuardrails.shouldCheck("fetch-events-usage")).toBe(false);
        expect(ndk.aiGuardrails.shouldCheck("other-check")).toBe(true);
    });

    it("should disable multiple guardrails for one call", () => {
        const ndk = new NDK({
            explicitRelayUrls: ["wss://relay.primal.net"],
            aiGuardrails: true,
        });

        // Set the flag for multiple guardrails
        ndk.guardrailOff(["fetch-events-usage", "filter-large-limit"]);

        // Verify the flag was set correctly
        expect(ndk.aiGuardrails["_nextCallDisabled"]).toBeInstanceOf(Set);
        expect(ndk.aiGuardrails["_nextCallDisabled"]).toContain("fetch-events-usage");
        expect(ndk.aiGuardrails["_nextCallDisabled"]).toContain("filter-large-limit");

        // Verify shouldCheck returns false for specified IDs
        expect(ndk.aiGuardrails.shouldCheck("fetch-events-usage")).toBe(false);
        expect(ndk.aiGuardrails.shouldCheck("filter-large-limit")).toBe(false);
        expect(ndk.aiGuardrails.shouldCheck("other-check")).toBe(true);
    });

    it("should return this for method chaining", () => {
        const ndk = new NDK({
            explicitRelayUrls: ["wss://relay.primal.net"],
            aiGuardrails: true,
        });

        const result = ndk.guardrailOff("fetch-events-usage");
        expect(result).toBe(ndk);
    });
});
