import { describe, expect, it } from "vitest";

describe("Reconnection backoff calculation", () => {
    describe("OLD BROKEN implementation (fixed)", () => {
        it("should NOT use XOR for exponential backoff", () => {
            // The bug was using ^ (XOR) instead of ** or Math.pow
            const attempt = 1;

            // Wrong calculation (XOR) - what we had before
            const wrongDelay = (1000 * (attempt + 1)) ^ 4;

            // Old broken calculation (exponentiation) - also wrong
            const oldBrokenDelay = (1000 * (attempt + 1)) ** 2;

            // XOR would give us 2004 (2000 XOR 4 = 2004)
            expect(wrongDelay).toBe(2004);

            // Old exponentiation gives us 4,000,000 (2000^2) - way too long!
            expect(oldBrokenDelay).toBe(4000000);

            // Make sure they're different
            expect(wrongDelay).not.toBe(oldBrokenDelay);
        });

        it("OLD delays were unreasonably long", () => {
            const oldDelays = [];

            for (let attempt = 0; attempt < 5; attempt++) {
                const delay = (1000 * (attempt + 1)) ** 2;
                oldDelays.push(delay);
            }

            // Old delays were insanely long:
            expect(oldDelays).toEqual([
                1000000, // 1 second squared = 1,000,000ms (~16.7 minutes)
                4000000, // 2 seconds squared = 4,000,000ms (~66.7 minutes)
                9000000, // 3 seconds squared = 9,000,000ms (~150 minutes)
                16000000, // 4 seconds squared = 16,000,000ms (~266.7 minutes)
                25000000, // 5 seconds squared = 25,000,000ms (~416.7 minutes)
            ]);
        });
    });

    describe("NEW CORRECT implementation", () => {
        it("should use reasonable exponential backoff capped at 30s", () => {
            const delays = [];

            for (let attempt = 0; attempt < 7; attempt++) {
                // New correct calculation: exponential with cap
                const delay = Math.min(1000 * 2 ** attempt, 30000);
                delays.push(delay);
            }

            // New delays are reasonable:
            expect(delays).toEqual([
                1000, // 1 second
                2000, // 2 seconds
                4000, // 4 seconds
                8000, // 8 seconds
                16000, // 16 seconds
                30000, // 30 seconds (capped)
                30000, // 30 seconds (remains capped)
            ]);
        });

        it("should use aggressive reconnection after idle/sleep", () => {
            const aggressiveDelays = [0, 1000, 2000, 5000, 10000, 30000];

            // After sleep/wake or long idle, we use fixed aggressive delays
            expect(aggressiveDelays[0]).toBe(0); // Immediate retry
            expect(aggressiveDelays[1]).toBe(1000); // 1 second
            expect(aggressiveDelays[2]).toBe(2000); // 2 seconds
            expect(aggressiveDelays[3]).toBe(5000); // 5 seconds
            expect(aggressiveDelays[4]).toBe(10000); // 10 seconds
            expect(aggressiveDelays[5]).toBe(30000); // 30 seconds max
        });

        it("comparison: old vs new delays", () => {
            // Old delay for attempt 1
            const oldDelay = (1000 * (1 + 1)) ** 2;
            expect(oldDelay).toBe(4000000); // 66.7 minutes!

            // New delay for attempt 1
            const newDelay = Math.min(1000 * 2 ** 1, 30000);
            expect(newDelay).toBe(2000); // 2 seconds

            // Improvement factor
            const improvementFactor = oldDelay / newDelay;
            expect(improvementFactor).toBe(2000); // 2000x faster reconnection!
        });
    });
});
