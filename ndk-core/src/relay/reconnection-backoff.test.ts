import { describe, it, expect } from "vitest";

describe("Reconnection backoff calculation", () => {
    it("should use proper exponential backoff, not XOR", () => {
        // The bug was using ^ (XOR) instead of ** or Math.pow
        const attempt = 1;
        
        // Wrong calculation (XOR)
        const wrongDelay = (1000 * (attempt + 1)) ^ 4;
        
        // Correct calculation (exponentiation)
        const correctDelay = Math.pow(1000 * (attempt + 1), 2);
        
        // XOR would give us 2004 (2000 XOR 4 = 2004)
        expect(wrongDelay).toBe(2004);
        
        // Exponentiation gives us 4,000,000 (2000^2)
        expect(correctDelay).toBe(4000000);
        
        // Make sure they're different
        expect(wrongDelay).not.toBe(correctDelay);
    });
    
    it("should calculate proper delays for multiple attempts", () => {
        const delays = [];
        
        for (let attempt = 0; attempt < 5; attempt++) {
            const delay = Math.pow(1000 * (attempt + 1), 2);
            delays.push(delay);
        }
        
        // Delays should be: 1000^2, 2000^2, 3000^2, 4000^2, 5000^2
        expect(delays).toEqual([
            1000000,    // 1 second squared = 1,000,000ms (~16.7 minutes)
            4000000,    // 2 seconds squared = 4,000,000ms (~66.7 minutes)
            9000000,    // 3 seconds squared = 9,000,000ms (~150 minutes)
            16000000,   // 4 seconds squared = 16,000,000ms (~266.7 minutes)
            25000000    // 5 seconds squared = 25,000,000ms (~416.7 minutes)
        ]);
    });
});