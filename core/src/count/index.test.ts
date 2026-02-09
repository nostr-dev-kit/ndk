import { describe, it, expect } from "vitest";
import { NDKCountHll, HLL_REGISTER_COUNT } from "./index.js";

describe("NDKCountHll", () => {
    describe("constructor", () => {
        it("creates an empty HLL with 256 zero registers", () => {
            const hll = new NDKCountHll();
            expect(hll.registers.length).toBe(HLL_REGISTER_COUNT);
            expect(hll.registers.every((v) => v === 0)).toBe(true);
        });

        it("creates HLL from provided registers", () => {
            const registers = new Uint8Array(HLL_REGISTER_COUNT);
            registers[0] = 5;
            registers[100] = 10;
            registers[255] = 3;

            const hll = new NDKCountHll(registers);
            expect(hll.registers[0]).toBe(5);
            expect(hll.registers[100]).toBe(10);
            expect(hll.registers[255]).toBe(3);
        });

        it("throws error for wrong register count", () => {
            const registers = new Uint8Array(100);
            expect(() => new NDKCountHll(registers)).toThrow(
                `HLL must have exactly ${HLL_REGISTER_COUNT} registers, got 100`,
            );
        });
    });

    describe("fromHex", () => {
        it("parses valid hex string", () => {
            // Create a hex string with known values
            // First byte = 0x05, second = 0x0a, rest are zeros
            const hex = "050a" + "00".repeat(254);
            const hll = NDKCountHll.fromHex(hex);

            expect(hll.registers[0]).toBe(5);
            expect(hll.registers[1]).toBe(10);
            expect(hll.registers[2]).toBe(0);
        });

        it("throws error for wrong hex length", () => {
            expect(() => NDKCountHll.fromHex("0a0b0c")).toThrow(
                `HLL hex string must be ${HLL_REGISTER_COUNT * 2} characters`,
            );
        });

        it("parses max value correctly", () => {
            const hex = "ff" + "00".repeat(255);
            const hll = NDKCountHll.fromHex(hex);
            expect(hll.registers[0]).toBe(255);
        });
    });

    describe("toHex", () => {
        it("converts to hex string correctly", () => {
            const hll = new NDKCountHll();
            hll.registers[0] = 5;
            hll.registers[1] = 10;
            hll.registers[255] = 15;

            const hex = hll.toHex();
            expect(hex.length).toBe(HLL_REGISTER_COUNT * 2);
            expect(hex.substring(0, 4)).toBe("050a");
            expect(hex.substring(510, 512)).toBe("0f");
        });

        it("roundtrips correctly", () => {
            const original = new NDKCountHll();
            original.registers[0] = 1;
            original.registers[50] = 15;
            original.registers[100] = 255;
            original.registers[200] = 128;

            const hex = original.toHex();
            const parsed = NDKCountHll.fromHex(hex);

            expect(parsed.registers[0]).toBe(1);
            expect(parsed.registers[50]).toBe(15);
            expect(parsed.registers[100]).toBe(255);
            expect(parsed.registers[200]).toBe(128);
        });
    });

    describe("merge", () => {
        it("takes maximum value for each register", () => {
            const hll1 = new NDKCountHll();
            hll1.registers[0] = 5;
            hll1.registers[1] = 10;
            hll1.registers[2] = 3;

            const hll2 = new NDKCountHll();
            hll2.registers[0] = 3;
            hll2.registers[1] = 15;
            hll2.registers[2] = 1;

            const merged = hll1.merge(hll2);

            expect(merged.registers[0]).toBe(5); // max(5, 3)
            expect(merged.registers[1]).toBe(15); // max(10, 15)
            expect(merged.registers[2]).toBe(3); // max(3, 1)
        });

        it("does not modify original HLLs", () => {
            const hll1 = new NDKCountHll();
            hll1.registers[0] = 5;

            const hll2 = new NDKCountHll();
            hll2.registers[0] = 10;

            hll1.merge(hll2);

            expect(hll1.registers[0]).toBe(5);
            expect(hll2.registers[0]).toBe(10);
        });
    });

    describe("static merge", () => {
        it("returns empty HLL for empty array", () => {
            const merged = NDKCountHll.merge([]);
            expect(merged.isEmpty()).toBe(true);
        });

        it("merges multiple HLLs correctly", () => {
            const hll1 = new NDKCountHll();
            hll1.registers[0] = 5;

            const hll2 = new NDKCountHll();
            hll2.registers[0] = 10;
            hll2.registers[1] = 7;

            const hll3 = new NDKCountHll();
            hll3.registers[0] = 3;
            hll3.registers[1] = 12;
            hll3.registers[2] = 4;

            const merged = NDKCountHll.merge([hll1, hll2, hll3]);

            expect(merged.registers[0]).toBe(10); // max(5, 10, 3)
            expect(merged.registers[1]).toBe(12); // max(0, 7, 12)
            expect(merged.registers[2]).toBe(4); // max(0, 0, 4)
        });
    });

    describe("estimate", () => {
        it("returns 0 for empty HLL", () => {
            const hll = new NDKCountHll();
            // Empty HLL should return 0 (uses linear counting for small cardinalities)
            expect(hll.estimate()).toBe(0);
        });

        it("estimates small cardinality", () => {
            // Simulate a small number of items by setting some registers
            const hll = new NDKCountHll();
            // Set a few registers to simulate seeing a few unique items
            for (let i = 0; i < 10; i++) {
                hll.registers[i] = 1;
            }

            const estimate = hll.estimate();
            // Estimate should be in a reasonable range for small cardinality
            expect(estimate).toBeGreaterThan(0);
            expect(estimate).toBeLessThan(50);
        });

        it("estimates larger cardinality", () => {
            const hll = new NDKCountHll();
            // Simulate more items by setting more registers with higher values
            for (let i = 0; i < 256; i++) {
                hll.registers[i] = Math.floor(Math.random() * 5) + 1;
            }

            const estimate = hll.estimate();
            // For HLL with 256 registers and values 1-5, estimate should be reasonable
            expect(estimate).toBeGreaterThan(100);
        });

        it("merged HLLs give reasonable estimate", () => {
            // Create two HLLs representing overlapping sets
            const hll1 = new NDKCountHll();
            const hll2 = new NDKCountHll();

            // Simulate some overlap by setting similar patterns
            for (let i = 0; i < 128; i++) {
                hll1.registers[i] = 2;
            }
            for (let i = 64; i < 192; i++) {
                hll2.registers[i] = 3;
            }

            const merged = hll1.merge(hll2);
            const estimate = merged.estimate();

            // The merged estimate should be at least as large as the individual estimates
            expect(estimate).toBeGreaterThan(0);
        });
    });

    describe("isEmpty", () => {
        it("returns true for empty HLL", () => {
            const hll = new NDKCountHll();
            expect(hll.isEmpty()).toBe(true);
        });

        it("returns false for non-empty HLL", () => {
            const hll = new NDKCountHll();
            hll.registers[100] = 1;
            expect(hll.isEmpty()).toBe(false);
        });
    });

    describe("clone", () => {
        it("creates independent copy", () => {
            const original = new NDKCountHll();
            original.registers[0] = 5;

            const cloned = original.clone();

            // Modify the clone
            cloned.registers[0] = 10;

            // Original should be unchanged
            expect(original.registers[0]).toBe(5);
            expect(cloned.registers[0]).toBe(10);
        });
    });
});

describe("NIP-45 HLL specification compliance", () => {
    it("uses 256 registers as specified", () => {
        expect(HLL_REGISTER_COUNT).toBe(256);
    });

    it("hex string is 512 characters (256 bytes)", () => {
        const hll = new NDKCountHll();
        const hex = hll.toHex();
        expect(hex.length).toBe(512);
    });

    it("registers are uint8 values (0-255)", () => {
        const hex = "ff".repeat(256);
        const hll = NDKCountHll.fromHex(hex);
        expect(hll.registers.every((v) => v === 255)).toBe(true);
    });
});
