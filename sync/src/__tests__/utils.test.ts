/**
 * Test suite for utility functions
 */

import { describe, expect, test } from "vitest";
import {
    compareUint8Array,
    decodeVarInt,
    encodeVarInt,
    getByte,
    getBytes,
    hexToUint8Array,
    uint8ArrayToHex,
    WrappedBuffer,
} from "../negentropy/utils.js";

describe("Utility Functions", () => {
    describe("VarInt Encoding/Decoding", () => {
        test("should encode and decode zero", () => {
            const encoded = encodeVarInt(0);
            const decoded = decodeVarInt(new WrappedBuffer(encoded));

            expect(decoded).toBe(0);
            expect(encoded).toEqual(new Uint8Array([0]));
        });

        test("should encode and decode small numbers", () => {
            const testValues = [1, 42, 127];

            for (const value of testValues) {
                const encoded = encodeVarInt(value);
                const decoded = decodeVarInt(new WrappedBuffer(encoded));
                expect(decoded).toBe(value);
            }
        });

        test("should encode and decode large numbers", () => {
            const testValues = [128, 255, 16383, 16384, 2097151];

            for (const value of testValues) {
                const encoded = encodeVarInt(value);
                const decoded = decodeVarInt(new WrappedBuffer(encoded));
                expect(decoded).toBe(value);
            }
        });

        test("should throw on incomplete VarInt", () => {
            const incompleteVarInt = new Uint8Array([0x80]); // Continuation bit set but no following byte
            const buffer = new WrappedBuffer(incompleteVarInt);
            buffer.shiftN(1); // Make buffer empty

            expect(() => {
                decodeVarInt(buffer);
            }).toThrow("VarInt decoding: unexpected end of buffer");
        });

        test("should validate buffer types in decodeVarInt", () => {
            expect(() => {
                decodeVarInt({} as any);
            }).toThrow("Invalid buffer type: expected Uint8Array or WrappedBuffer");
        });
    });

    describe("Byte Operations", () => {
        test("should get single byte", () => {
            const buffer = new WrappedBuffer(new Uint8Array([42, 84, 126]));
            const byte = getByte(buffer);

            expect(byte).toBe(42);
            expect(buffer.length).toBe(2); // One byte consumed
        });

        test("should get multiple bytes", () => {
            const testData = new Uint8Array([1, 2, 3, 4, 5]);
            const buffer = new WrappedBuffer(testData);
            const bytes = getBytes(buffer, 3);

            expect(bytes).toEqual(new Uint8Array([1, 2, 3]));
            expect(buffer.length).toBe(2); // Three bytes consumed
        });

        test("should throw on insufficient bytes", () => {
            const buffer = new WrappedBuffer(new Uint8Array([1, 2]));

            expect(() => {
                getBytes(buffer, 5);
            }).toThrow("getBytes: unexpected end of buffer");
        });

        test("should validate buffer types in getBytes", () => {
            expect(() => {
                getBytes({} as any, 1);
            }).toThrow("Invalid buffer type: expected Uint8Array or WrappedBuffer");
        });
    });

    describe("Array Comparison", () => {
        test("should compare equal arrays", () => {
            const a = new Uint8Array([1, 2, 3]);
            const b = new Uint8Array([1, 2, 3]);

            expect(compareUint8Array(a, b)).toBe(0);
        });

        test("should compare arrays lexicographically", () => {
            const a = new Uint8Array([1, 2, 3]);
            const b = new Uint8Array([1, 2, 4]);

            expect(compareUint8Array(a, b)).toBe(-1);
            expect(compareUint8Array(b, a)).toBe(1);
        });

        test("should handle different length arrays", () => {
            const shorter = new Uint8Array([1, 2]);
            const longer = new Uint8Array([1, 2, 3]);

            expect(compareUint8Array(shorter, longer)).toBe(-1);
            expect(compareUint8Array(longer, shorter)).toBe(1);
        });

        test("should handle empty arrays", () => {
            const empty = new Uint8Array([]);
            const nonEmpty = new Uint8Array([1]);

            expect(compareUint8Array(empty, empty)).toBe(0);
            expect(compareUint8Array(empty, nonEmpty)).toBe(-1);
            expect(compareUint8Array(nonEmpty, empty)).toBe(1);
        });
    });

    describe("Hex Conversion", () => {
        test("should convert hex to Uint8Array", () => {
            const hex = "deadbeef";
            const result = hexToUint8Array(hex);

            expect(result).toEqual(new Uint8Array([0xde, 0xad, 0xbe, 0xef]));
        });

        test("should handle hex with 0x prefix", () => {
            const hex = "0xdeadbeef";
            const result = hexToUint8Array(hex);

            expect(result).toEqual(new Uint8Array([0xde, 0xad, 0xbe, 0xef]));
        });

        test("should convert Uint8Array to hex", () => {
            const arr = new Uint8Array([0xde, 0xad, 0xbe, 0xef]);
            const result = uint8ArrayToHex(arr);

            expect(result).toBe("deadbeef");
        });

        test("should handle empty arrays", () => {
            const empty = new Uint8Array([]);

            expect(uint8ArrayToHex(empty)).toBe("");
            expect(hexToUint8Array("")).toEqual(empty);
        });

        test("should throw on odd-length hex strings", () => {
            expect(() => {
                hexToUint8Array("abc");
            }).toThrow("Hex string has odd length");
        });

        test("should roundtrip hex conversion", () => {
            const original = new Uint8Array([0, 15, 16, 255, 128, 64]);
            const hex = uint8ArrayToHex(original);
            const roundtrip = hexToUint8Array(hex);

            expect(roundtrip).toEqual(original);
        });
    });

    describe("WrappedBuffer", () => {
        test("should create empty buffer", () => {
            const buffer = new WrappedBuffer();

            expect(buffer.length).toBe(0);
            expect(buffer.capacity).toBeGreaterThan(0);
        });

        test("should create with initial data", () => {
            const data = new Uint8Array([1, 2, 3]);
            const buffer = new WrappedBuffer(data);

            expect(buffer.length).toBe(3);
            expect(buffer.unwrap()).toEqual(data);
        });

        test("should create with capacity", () => {
            const buffer = new WrappedBuffer(1024);

            expect(buffer.length).toBe(0);
            expect(buffer.capacity).toBe(1024);
        });

        test("should append data", () => {
            const buffer = new WrappedBuffer();
            const data1 = new Uint8Array([1, 2]);
            const data2 = new Uint8Array([3, 4]);

            buffer.append(data1);
            buffer.append(data2);

            expect(buffer.length).toBe(4);
            expect(buffer.unwrap()).toEqual(new Uint8Array([1, 2, 3, 4]));
        });

        test("should grow when needed", () => {
            const buffer = new WrappedBuffer(2);
            const largeData = new Uint8Array(100);

            buffer.append(largeData);

            expect(buffer.length).toBe(100);
            expect(buffer.capacity).toBeGreaterThanOrEqual(100);
        });

        test("should shift bytes", () => {
            const buffer = new WrappedBuffer(new Uint8Array([1, 2, 3, 4]));

            const first = buffer.shift();
            expect(first).toBe(1);
            expect(buffer.length).toBe(3);

            const next = buffer.shiftN(2);
            expect(next).toEqual(new Uint8Array([2, 3]));
            expect(buffer.length).toBe(1);
        });

        test("should throw on shift from empty buffer", () => {
            const buffer = new WrappedBuffer();

            expect(() => {
                buffer.shift();
            }).toThrow("Cannot shift from empty buffer");
        });

        test("should throw on shift more than available", () => {
            const buffer = new WrappedBuffer(new Uint8Array([1, 2]));

            expect(() => {
                buffer.shiftN(5);
            }).toThrow("Cannot shift more bytes than available");
        });

        test("should set data", () => {
            const buffer = new WrappedBuffer();
            const data = new Uint8Array([5, 6, 7]);

            buffer.set(data);

            expect(buffer.length).toBe(3);
            expect(buffer.unwrap()).toEqual(data);
        });

        test("should clear buffer", () => {
            const buffer = new WrappedBuffer(new Uint8Array([1, 2, 3]));

            buffer.clear();

            expect(buffer.length).toBe(0);
            expect(buffer.unwrap()).toEqual(new Uint8Array([]));
        });
    });
});
