/**
 * Negentropy utility functions for encoding, decoding, and comparing data.
 * Based on the Negentropy Protocol V1 specification.
 */

/**
 * Typeguard to check if a buffer is a WrappedBuffer instance.
 */
function isWrappedBuffer(buf: Uint8Array | WrappedBuffer): buf is WrappedBuffer {
    return buf instanceof WrappedBuffer;
}

/**
 * Typeguard to check if a buffer is a plain Uint8Array.
 */
function isUint8Array(buf: Uint8Array | WrappedBuffer): buf is Uint8Array {
    return buf instanceof Uint8Array && !isWrappedBuffer(buf);
}

import { BUFFER_SIZES } from "../constants.js";

export const PROTOCOL_VERSION = 0x61; // Version 1
export const ID_SIZE = 32;
export const FINGERPRINT_SIZE = 16;

/**
 * Encodes a number as a VarInt (variable-length integer).
 * VarInt encoding uses 7 bits per byte, with the high bit indicating continuation.
 */
export function encodeVarInt(n: number): Uint8Array {
    if (n === 0) return new Uint8Array([0]);

    const bytes: number[] = [];

    while (n !== 0) {
        bytes.push(n & 127);
        n >>>= 7;
    }

    bytes.reverse();

    // Set continuation bit on all but the last byte
    for (let i = 0; i < bytes.length - 1; i++) {
        bytes[i] |= 128;
    }

    return new Uint8Array(bytes);
}

/**
 * Decodes a VarInt from a buffer.
 * The buffer is mutated by removing the decoded bytes.
 */
export function decodeVarInt(buf: Uint8Array | WrappedBuffer): number {
    if (!isWrappedBuffer(buf) && !isUint8Array(buf)) {
        throw new Error("Invalid buffer type: expected Uint8Array or WrappedBuffer");
    }

    let res = 0;

    while (true) {
        if (buf.length === 0) {
            throw new Error("VarInt decoding: unexpected end of buffer");
        }

        const byte = shiftByte(buf);
        res = (res << 7) | (byte & 127);

        if ((byte & 128) === 0) break;
    }

    return res;
}

/**
 * Gets a single byte from the buffer and removes it.
 */
export function getByte(buf: Uint8Array | WrappedBuffer): number {
    return getBytes(buf, 1)[0];
}

/**
 * Gets N bytes from the buffer and removes them.
 */
export function getBytes(buf: Uint8Array | WrappedBuffer, n: number): Uint8Array {
    if (!isWrappedBuffer(buf) && !isUint8Array(buf)) {
        throw new Error("Invalid buffer type: expected Uint8Array or WrappedBuffer");
    }

    if (buf.length < n) {
        throw new Error("getBytes: unexpected end of buffer");
    }

    if (isWrappedBuffer(buf)) {
        return buf.shiftN(n);
    }

    const result = buf.slice(0, n);
    // For plain Uint8Array, we can't mutate, so this is read-only
    // The caller must handle slicing
    return result;
}

/**
 * Shifts a single byte off the front of the buffer.
 */
function shiftByte(buf: Uint8Array | WrappedBuffer): number {
    if (!isWrappedBuffer(buf) && !isUint8Array(buf)) {
        throw new Error("Invalid buffer type: expected Uint8Array or WrappedBuffer");
    }

    if (isWrappedBuffer(buf)) {
        return buf.shift();
    }
    // For plain Uint8Array, we just read the first byte
    // The caller must handle slicing
    return buf[0];
}

/**
 * Compares two Uint8Arrays lexicographically.
 * @returns -1 if a < b, 1 if a > b, 0 if equal
 */
export function compareUint8Array(a: Uint8Array, b: Uint8Array): number {
    const minLength = Math.min(a.length, b.length);

    for (let i = 0; i < minLength; i++) {
        if (a[i] < b[i]) return -1;
        if (a[i] > b[i]) return 1;
    }

    if (a.length < b.length) return -1;
    if (a.length > b.length) return 1;

    return 0;
}

/**
 * Converts a hex string to Uint8Array.
 */
export function hexToUint8Array(hex: string): Uint8Array {
    if (hex.startsWith("0x")) hex = hex.slice(2);
    if (hex.length % 2 !== 0) {
        throw new Error("Hex string has odd length");
    }

    const arr = new Uint8Array(hex.length / 2);
    for (let i = 0; i < arr.length; i++) {
        arr[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    }

    return arr;
}

const hexLookupTable = new Array(256);
{
    const hexAlphabet = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"];
    for (let i = 0; i < 256; i++) {
        hexLookupTable[i] = hexAlphabet[(i >>> 4) & 0xf] + hexAlphabet[i & 0xf];
    }
}

/**
 * Converts a Uint8Array to hex string.
 */
export function uint8ArrayToHex(arr: Uint8Array): string {
    let out = "";
    for (let i = 0; i < arr.length; i++) {
        out += hexLookupTable[arr[i]];
    }
    return out;
}

/**
 * A buffer wrapper that supports efficient append and shift operations.
 * Based on the reference implementation.
 */
export class WrappedBuffer {
    private _raw: Uint8Array;
    public length: number;

    constructor(buffer?: Uint8Array | number) {
        if (typeof buffer === "number") {
            this._raw = new Uint8Array(buffer);
            this.length = 0;
        } else if (buffer) {
            this._raw = new Uint8Array(buffer);
            this.length = buffer.length;
        } else {
            this._raw = new Uint8Array(BUFFER_SIZES.DEFAULT_WRAPPED_BUFFER_SIZE);
            this.length = 0;
        }
    }

    /**
     * Get the underlying buffer (sliced to actual length).
     */
    unwrap(): Uint8Array {
        return this._raw.subarray(0, this.length);
    }

    /**
     * Get the capacity of the internal buffer.
     */
    get capacity(): number {
        return this._raw.byteLength;
    }

    /**
     * Append data to the buffer, growing if necessary.
     */
    append(buf: Uint8Array | WrappedBuffer): void {
        const data = buf instanceof WrappedBuffer ? buf.unwrap() : buf;
        const targetSize = data.length + this.length;

        if (this.capacity < targetSize) {
            const oldRaw = this._raw;
            const newCapacity = Math.max(this.capacity * 2, targetSize);
            this._raw = new Uint8Array(newCapacity);
            this._raw.set(oldRaw);
        }

        this._raw.set(data, this.length);
        this.length += data.length;
    }

    /**
     * Set data at the beginning, replacing current content.
     */
    set(data: Uint8Array | number[]): void {
        const arr = data instanceof Uint8Array ? data : new Uint8Array(data);
        if (this.capacity < arr.length) {
            this._raw = new Uint8Array(Math.max(this.capacity * 2, arr.length));
        }
        this._raw.set(arr);
        this.length = arr.length;
    }

    /**
     * Remove and return the first byte.
     */
    shift(): number {
        if (this.length === 0) {
            throw new Error("Cannot shift from empty buffer");
        }
        const first = this._raw[0];
        this._raw = this._raw.subarray(1);
        this.length--;
        return first;
    }

    /**
     * Remove and return the first N bytes.
     */
    shiftN(n: number): Uint8Array {
        if (this.length < n) {
            throw new Error("Cannot shift more bytes than available");
        }
        const result = this._raw.subarray(0, n);
        this._raw = this._raw.subarray(n);
        this.length -= n;
        return result;
    }

    /**
     * Clear the buffer.
     */
    clear(): void {
        this.length = 0;
    }
}
