/**
 * Tests for deprecated subscription handler guardrails
 */

import { NDK } from "../../ndk/index.js";
import type { NDKFilter } from "../../subscription/index.js";

describe("deprecated subscription handlers guardrail", () => {
    let ndk: NDK;
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
        ndk = new NDK({ aiGuardrails: true });
        consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });

    it("should warn when handlers are passed in third parameter", () => {
        const filter: NDKFilter = { kinds: [1], authors: ["test"] };

        expect(() => {
            ndk.subscribe(
                filter,
                { closeOnEose: true },
                {
                    onEvent: jest.fn(),
                    onEose: jest.fn(),
                }
            );
        }).toThrow(/Event handlers.*passed via third parameter are DEPRECATED/);
    });

    it("should NOT warn when handlers are passed in second parameter (correct usage)", () => {
        const filter: NDKFilter = { kinds: [1], authors: ["test"] };

        expect(() => {
            ndk.subscribe(filter, {
                closeOnEose: true,
                onEvent: jest.fn(),
                onEvents: jest.fn(),
                onEose: jest.fn(),
            });
        }).not.toThrow();
    });

    it("should NOT warn when third parameter is boolean (autoStart)", () => {
        const filter: NDKFilter = { kinds: [1], authors: ["test"] };

        expect(() => {
            ndk.subscribe(filter, { closeOnEose: true }, false);
        }).not.toThrow();
    });

    it("should detect all handler types in third parameter", () => {
        const filter: NDKFilter = { kinds: [1], authors: ["test"] };

        expect(() => {
            ndk.subscribe(
                filter,
                {},
                {
                    onEvent: jest.fn(),
                    onEvents: jest.fn(),
                    onEose: jest.fn(),
                    onClose: jest.fn(),
                }
            );
        }).toThrow(/onEvent, onEvents, onEose, onClose/);
    });

    it("should not warn when guardrails are disabled", () => {
        ndk.aiGuardrails.setMode(false);
        const filter: NDKFilter = { kinds: [1], authors: ["test"] };

        expect(() => {
            ndk.subscribe(
                filter,
                {},
                {
                    onEvent: jest.fn(),
                    onEose: jest.fn(),
                }
            );
        }).not.toThrow();
    });

    it("should not warn when specific guardrail is skipped", () => {
        ndk.aiGuardrails.skip("subscription-deprecated-handlers");
        const filter: NDKFilter = { kinds: [1], authors: ["test"] };

        expect(() => {
            ndk.subscribe(
                filter,
                {},
                {
                    onEvent: jest.fn(),
                    onEose: jest.fn(),
                }
            );
        }).not.toThrow();
    });
});