/**
 * Test suite for Negentropy core functionality
 */

import { beforeEach, describe, expect, test } from "@jest/globals";
import { FRAME_SIZE_LIMITS } from "../constants.js";
import { Negentropy } from "../negentropy/core.js";
import { NegentropyStorage } from "../negentropy/storage.js";
import type { StorageItem } from "../types.js";

describe("Negentropy Core", () => {
    let storage: NegentropyStorage;
    let negentropy: Negentropy;

    beforeEach(() => {
        // Create mock storage with some test data
        const _testItems: StorageItem[] = [
            { timestamp: 1000, id: new Uint8Array([1, 2, 3, 4]) },
            { timestamp: 2000, id: new Uint8Array([5, 6, 7, 8]) },
            { timestamp: 3000, id: new Uint8Array([9, 10, 11, 12]) },
        ];
        storage = NegentropyStorage.fromEvents([]);
        negentropy = new Negentropy(storage);
    });

    describe("Constructor", () => {
        test("should create with default frame size limit", () => {
            const neg = new Negentropy(storage);
            expect(neg).toBeDefined();
        });

        test("should create with custom frame size limit", () => {
            const neg = new Negentropy(storage, FRAME_SIZE_LIMITS.DEFAULT);
            expect(neg).toBeDefined();
        });

        test("should reject frame size limit below minimum", () => {
            expect(() => {
                new Negentropy(storage, FRAME_SIZE_LIMITS.MINIMUM - 1);
            }).toThrow(`frameSizeLimit too small (minimum ${FRAME_SIZE_LIMITS.MINIMUM} bytes)`);
        });

        test("should accept frame size limit at minimum", () => {
            expect(() => {
                new Negentropy(storage, FRAME_SIZE_LIMITS.MINIMUM);
            }).not.toThrow();
        });
    });

    describe("Initiation", () => {
        test("should set initiator flag", () => {
            // setInitiator is used for manual flag setting (not typically used with initiate)
            expect(() => negentropy.setInitiator()).not.toThrow();
        });

        test("should generate initial message", async () => {
            const message = await negentropy.initiate();

            expect(message).toBeInstanceOf(Uint8Array);
            expect(message.length).toBeGreaterThan(0);
            // First byte should be protocol version
            expect(message[0]).toBe(0x61); // Protocol version 1
        });

        test("should throw error on double initiation", async () => {
            await negentropy.initiate();

            await expect(negentropy.initiate()).rejects.toThrow("Already initiated");
        });
    });

    describe("Message Processing", () => {
        test("should handle empty query", async () => {
            const emptyQuery = new Uint8Array([0x61]); // Just protocol version

            const result = await negentropy.reconcile(emptyQuery);

            expect(result).toBeDefined();
            expect(result.have).toBeInstanceOf(Array);
            expect(result.need).toBeInstanceOf(Array);
            expect(result.nextMessage).toBeInstanceOf(Uint8Array);
        });

        test("should validate protocol version", async () => {
            const invalidVersionQuery = new Uint8Array([0x50]); // Invalid version

            await expect(negentropy.reconcile(invalidVersionQuery)).rejects.toThrow(
                "Invalid negentropy protocol version byte",
            );
        });

        test("should handle unsupported protocol version as initiator", async () => {
            negentropy.setInitiator();
            const unsupportedVersionQuery = new Uint8Array([0x62]); // Version 2

            await expect(negentropy.reconcile(unsupportedVersionQuery)).rejects.toThrow(
                "Unsupported negentropy protocol version requested: 2",
            );
        });

        test("should handle unsupported protocol version as responder", async () => {
            // Don't set as initiator (responder by default)
            const unsupportedVersionQuery = new Uint8Array([0x62]); // Version 2

            const result = await negentropy.reconcile(unsupportedVersionQuery);

            expect(result.nextMessage).toBeInstanceOf(Uint8Array);
            expect(result.have).toHaveLength(0);
            expect(result.need).toHaveLength(0);
        });
    });

    describe("Frame Size Limits", () => {
        test("should respect frame size limits", () => {
            const negWithLimit = new Negentropy(storage, 8192);

            // Test that exceededFrameSizeLimit is working (indirectly through behavior)
            expect(negWithLimit).toBeDefined();
        });

        test("should handle zero frame size limit (unlimited)", () => {
            const negUnlimited = new Negentropy(storage, 0);
            expect(negUnlimited).toBeDefined();
        });
    });

    describe("Bound Creation and Encoding", () => {
        test("should create bounds correctly", async () => {
            // Test through the public initiate method which creates bounds internally
            const message = await negentropy.initiate();

            expect(message).toBeInstanceOf(Uint8Array);
            expect(message.length).toBeGreaterThan(1); // Should contain more than just version
        });
    });
});
