import { describe, expect, it } from "vitest";
import { sampleBeta } from "./sample-beta.js";

// Seeded PRNG for deterministic tests (mulberry32)
function mulberry32(seed: number): () => number {
    return () => {
        seed |= 0;
        seed = (seed + 0x6d2b79f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

describe("sampleBeta", () => {
    it("uniform prior (1,1) returns values in [0,1]", () => {
        const rng = mulberry32(42);
        for (let i = 0; i < 100; i++) {
            const v = sampleBeta(1, 1, rng);
            expect(v).toBeGreaterThanOrEqual(0);
            expect(v).toBeLessThanOrEqual(1);
        }
    });

    it("Beta(2,5) mean ≈ 0.286", () => {
        const rng = mulberry32(123);
        const N = 10000;
        let sum = 0;
        for (let i = 0; i < N; i++) {
            sum += sampleBeta(2, 5, rng);
        }
        const mean = sum / N;
        // Expected mean = alpha / (alpha + beta) = 2/7 ≈ 0.286
        expect(mean).toBeCloseTo(2 / 7, 1);
    });

    it("Beta(10,10) mean ≈ 0.5", () => {
        const rng = mulberry32(456);
        const N = 10000;
        let sum = 0;
        for (let i = 0; i < N; i++) {
            sum += sampleBeta(10, 10, rng);
        }
        const mean = sum / N;
        expect(mean).toBeCloseTo(0.5, 1);
    });

    it("Beta(0.5, 0.5) uses Jöhnk's algorithm, mean ≈ 0.5", () => {
        const rng = mulberry32(789);
        const N = 10000;
        let sum = 0;
        for (let i = 0; i < N; i++) {
            sum += sampleBeta(0.5, 0.5, rng);
        }
        const mean = sum / N;
        expect(mean).toBeCloseTo(0.5, 1);
    });

    it("returns 0.5 on invalid inputs", () => {
        const rng = mulberry32(1);
        expect(sampleBeta(0, 1, rng)).toBe(0.5);
        expect(sampleBeta(1, 0, rng)).toBe(0.5);
        expect(sampleBeta(-1, 1, rng)).toBe(0.5);
        expect(sampleBeta(1, -1, rng)).toBe(0.5);
        expect(sampleBeta(Infinity, 1, rng)).toBe(0.5);
        expect(sampleBeta(1, Infinity, rng)).toBe(0.5);
        expect(sampleBeta(NaN, 1, rng)).toBe(0.5);
        expect(sampleBeta(1, NaN, rng)).toBe(0.5);
    });

    it("is deterministic with seeded RNG", () => {
        const results1: number[] = [];
        const results2: number[] = [];
        for (let i = 0; i < 10; i++) {
            results1.push(sampleBeta(3, 7, mulberry32(999)));
        }
        for (let i = 0; i < 10; i++) {
            results2.push(sampleBeta(3, 7, mulberry32(999)));
        }
        // Each call with the same seed should produce the same first sample
        expect(results1[0]).toBe(results2[0]);
    });

    it("defaults to Math.random when no rng provided", () => {
        const v = sampleBeta(2, 2);
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(1);
    });
});
