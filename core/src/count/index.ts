/**
 * NIP-45 COUNT with HyperLogLog (HLL) support
 *
 * This module provides support for COUNT requests with HLL cardinality estimation
 * as specified in NIP-45.
 *
 * HLL allows relays to provide approximate unique counts that can be merged
 * across multiple relays without double-counting.
 */

/**
 * The number of HLL registers (256 as per NIP-45)
 */
export const HLL_REGISTER_COUNT = 256;

/**
 * Represents an HLL (HyperLogLog) data structure for cardinality estimation.
 * Contains 256 uint8 registers as specified in NIP-45.
 */
export class NDKCountHll {
    /**
     * The 256 uint8 registers used for HLL estimation
     */
    public readonly registers: Uint8Array;

    constructor(registers?: Uint8Array) {
        if (registers) {
            if (registers.length !== HLL_REGISTER_COUNT) {
                throw new Error(`HLL must have exactly ${HLL_REGISTER_COUNT} registers, got ${registers.length}`);
            }
            this.registers = registers;
        } else {
            this.registers = new Uint8Array(HLL_REGISTER_COUNT);
        }
    }

    /**
     * Creates an NDKCountHll from a hex-encoded string (512 characters).
     * Each register is a uint8 value encoded as 2 hex characters.
     *
     * @param hex - The hex string (512 characters = 256 bytes)
     * @returns A new NDKCountHll instance
     * @throws Error if the hex string is invalid
     */
    static fromHex(hex: string): NDKCountHll {
        if (hex.length !== HLL_REGISTER_COUNT * 2) {
            throw new Error(`HLL hex string must be ${HLL_REGISTER_COUNT * 2} characters, got ${hex.length}`);
        }

        const registers = new Uint8Array(HLL_REGISTER_COUNT);
        for (let i = 0; i < HLL_REGISTER_COUNT; i++) {
            registers[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
        }

        return new NDKCountHll(registers);
    }

    /**
     * Converts the HLL registers to a hex-encoded string.
     *
     * @returns The hex string representation (512 characters)
     */
    toHex(): string {
        return Array.from(this.registers)
            .map((v) => v.toString(16).padStart(2, "0"))
            .join("");
    }

    /**
     * Merges this HLL with another HLL by taking the maximum value for each register.
     * This is the standard HLL merge operation that allows combining counts
     * from multiple relays without double-counting.
     *
     * @param other - The other HLL to merge with
     * @returns A new NDKCountHll with the merged registers
     */
    merge(other: NDKCountHll): NDKCountHll {
        const merged = new Uint8Array(HLL_REGISTER_COUNT);
        for (let i = 0; i < HLL_REGISTER_COUNT; i++) {
            merged[i] = Math.max(this.registers[i], other.registers[i]);
        }
        return new NDKCountHll(merged);
    }

    /**
     * Merges multiple HLLs by taking the maximum value for each register.
     *
     * @param hlls - Array of HLLs to merge
     * @returns A new NDKCountHll with the merged registers
     */
    static merge(hlls: NDKCountHll[]): NDKCountHll {
        if (hlls.length === 0) {
            return new NDKCountHll();
        }

        const merged = new Uint8Array(HLL_REGISTER_COUNT);
        for (let i = 0; i < HLL_REGISTER_COUNT; i++) {
            merged[i] = Math.max(...hlls.map((hll) => hll.registers[i]));
        }
        return new NDKCountHll(merged);
    }

    /**
     * Estimates the cardinality (unique count) using the HyperLogLog algorithm.
     *
     * Uses the standard HLL formula with bias correction for small and large cardinalities.
     *
     * @returns The estimated unique count
     */
    estimate(): number {
        const m = HLL_REGISTER_COUNT;
        // Alpha constant for m=256 (0.7213 / (1 + 1.079/m))
        const alpha = 0.7213 / (1 + 1.079 / m);

        // Calculate harmonic mean of 2^(-register)
        let sum = 0;
        let zeros = 0;
        for (let i = 0; i < m; i++) {
            sum += Math.pow(2, -this.registers[i]);
            if (this.registers[i] === 0) {
                zeros++;
            }
        }

        // Raw estimate
        let estimate = alpha * m * m / sum;

        // Small range correction (linear counting for small cardinalities)
        if (estimate <= 2.5 * m && zeros > 0) {
            estimate = m * Math.log(m / zeros);
        }

        // Large range correction is typically not needed for 256 registers
        // as the threshold is very high

        return Math.round(estimate);
    }

    /**
     * Checks if this HLL is empty (all registers are zero).
     *
     * @returns True if all registers are zero
     */
    isEmpty(): boolean {
        return this.registers.every((v) => v === 0);
    }

    /**
     * Creates a copy of this HLL.
     *
     * @returns A new NDKCountHll with the same register values
     */
    clone(): NDKCountHll {
        return new NDKCountHll(new Uint8Array(this.registers));
    }
}

/**
 * Result of a COUNT request, including optional HLL data.
 */
export interface NDKCountResult {
    /**
     * The count value returned by the relay.
     * This is the exact count if HLL is not available,
     * or an approximate count if HLL is used.
     */
    count: number;

    /**
     * The HLL data if returned by the relay.
     * Can be used to merge counts from multiple relays.
     */
    hll?: NDKCountHll;
}

/**
 * Aggregated result from multiple relays for a COUNT request.
 */
export interface NDKAggregatedCountResult {
    /**
     * The best estimate of the count.
     * If HLL data is available from multiple relays, this is computed from the merged HLL.
     * Otherwise, it's the maximum count from all relays.
     */
    count: number;

    /**
     * The merged HLL from all relays that returned HLL data.
     * Can be used for further aggregation or analysis.
     */
    mergedHll?: NDKCountHll;

    /**
     * Individual results from each relay.
     */
    relayResults: Map<string, NDKCountResult>;
}

/**
 * Options for count requests.
 */
export interface NDKCountOptions {
    /**
     * Custom ID for the count request.
     */
    id?: string;

    /**
     * Timeout in milliseconds for the count request.
     * @default 5000
     */
    timeout?: number;
}
