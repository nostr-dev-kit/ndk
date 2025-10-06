/**
 * Accumulator for computing fingerprints in the Negentropy protocol.
 * This is a 256-bit integer that supports XOR-like addition.
 */

import { encodeVarInt, FINGERPRINT_SIZE, ID_SIZE } from "./utils.js";

/**
 * Accumulator class for computing fingerprints.
 * Based on the reference implementation from hoytech/negentropy.
 */
export class Accumulator {
    private buf: Uint8Array = new Uint8Array(ID_SIZE);

    constructor() {
        this.setToZero();
    }

    /**
     * Set the accumulator to zero.
     */
    setToZero(): void {
        this.buf = new Uint8Array(ID_SIZE);
    }

    /**
     * Add another buffer to this accumulator.
     * This is a 256-bit addition with carry.
     */
    add(otherBuf: Uint8Array): void {
        let currCarry = 0;
        let nextCarry = 0;
        const p = new DataView(this.buf.buffer);
        const po = new DataView(otherBuf.buffer);

        // Process 8 uint32 values (32 bytes total)
        for (let i = 0; i < 8; i++) {
            const offset = i * 4;
            const orig = p.getUint32(offset, true);
            const otherV = po.getUint32(offset, true);

            let next = orig;
            next += currCarry;
            next += otherV;

            if (next > 0xffffffff) nextCarry = 1;

            p.setUint32(offset, next & 0xffffffff, true);
            currCarry = nextCarry;
            nextCarry = 0;
        }
    }

    /**
     * Negate the accumulator (two's complement).
     */
    negate(): void {
        const p = new DataView(this.buf.buffer);

        // Bitwise NOT on all uint32 values
        for (let i = 0; i < 8; i++) {
            const offset = i * 4;
            p.setUint32(offset, ~p.getUint32(offset, true), true);
        }

        // Add 1 (for two's complement)
        const one = new Uint8Array(ID_SIZE);
        one[0] = 1;
        this.add(one);
    }

    /**
     * Get the fingerprint from this accumulator.
     * The fingerprint is SHA256(accumulator || n) truncated to FINGERPRINT_SIZE.
     *
     * @param n The number of items this fingerprint represents
     * @returns The fingerprint bytes
     */
    async getFingerprint(n: number): Promise<Uint8Array> {
        const input = new Uint8Array(this.buf.length + encodeVarInt(n).length);
        input.set(this.buf);
        input.set(encodeVarInt(n), this.buf.length);

        const hash = await this.sha256(input);
        return hash.subarray(0, FINGERPRINT_SIZE);
    }

    /**
     * SHA256 hash function that works in both Node.js and browser.
     */
    private async sha256(data: Uint8Array): Promise<Uint8Array> {
        if (crypto?.subtle) {
            // Browser or modern environment
            const hashBuffer = await crypto.subtle.digest("SHA-256", data.buffer as ArrayBuffer);
            return new Uint8Array(hashBuffer);
        }

        // Node.js
        try {
            const nodeCrypto = await import("node:crypto");
            return new Uint8Array(nodeCrypto.createHash("sha256").update(data).digest());
        } catch {
            throw new Error("No SHA256 implementation available");
        }
    }
}
