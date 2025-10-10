import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NDK } from "../ndk/index.js";

describe("NDK AI Guardrails", () => {
    let originalConsoleWarn: typeof console.warn;

    beforeEach(() => {
        originalConsoleWarn = console.warn;
        console.warn = vi.fn();
    });

    afterEach(() => {
        console.warn = originalConsoleWarn;
    });

    describe("Cache presence warning", () => {
        it("should warn when no cache adapter is set after 2.5s", async () => {
            new NDK({ aiGuardrails: true });

            // Wait for the timeout
            await new Promise((resolve) => setTimeout(resolve, 2600));

            expect(console.warn).toHaveBeenCalled();
            const warnCall = vi.mocked(console.warn).mock.calls[0][0];
            expect(warnCall).toContain("AI_GUARDRAILS WARNING");
            expect(warnCall).toContain("without a cache adapter");
        });

        it("should not warn when cache adapter is set", async () => {
            const ndk = new NDK({
                aiGuardrails: true,
                cacheAdapter: {
                    query: async () => [],
                    setEvent: async () => {},
                },
            });

            // Wait for the timeout
            await new Promise((resolve) => setTimeout(resolve, 2600));

            expect(console.warn).not.toHaveBeenCalled();
        });

        it("should not warn when guardrails are disabled", async () => {
            const ndk = new NDK({ aiGuardrails: false });

            // Wait for the timeout
            await new Promise((resolve) => setTimeout(resolve, 2600));

            expect(console.warn).not.toHaveBeenCalled();
        });

        it("should not warn when specific check is skipped", async () => {
            const ndk = new NDK({
                aiGuardrails: { skip: new Set(["ndk-no-cache"]) },
            });

            // Wait for the timeout
            await new Promise((resolve) => setTimeout(resolve, 2600));

            expect(console.warn).not.toHaveBeenCalled();
        });
    });
});
