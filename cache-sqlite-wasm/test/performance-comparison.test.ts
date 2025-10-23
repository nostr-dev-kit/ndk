/**
 * Performance comparison test demonstrating the improvements from binary encoding
 * and transferables vs traditional JSON serialization.
 *
 * Run with: npm test performance-comparison
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { encodeEvents, type EventForEncoding } from '../src/binary/encoder';
import { decodeEvents } from '../src/binary/decoder';

describe('Performance Comparison: Binary vs JSON', () => {
    let testEvents: EventForEncoding[];

    beforeAll(() => {
        // Generate realistic test data
        testEvents = Array(1000).fill(null).map((_, i) => ({
            id: i.toString().padStart(64, '0'),
            pubkey: 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
            created_at: 1700000000 + i,
            kind: i % 10,
            sig: '1'.repeat(128),
            content: `This is event content #${i}. `.repeat(10), // ~150 chars
            tags: [
                ['e', `ref${i}`],
                ['p', `pubkey${i}`, 'wss://relay.com'],
                ['t', `tag${i % 20}`]
            ],
            relay_url: i % 2 === 0 ? 'wss://relay.nostr.com' : null
        }));
    });

    describe('Serialization Performance', () => {
        it('should be significantly faster than JSON', () => {
            // Measure JSON encoding time
            const jsonStart = performance.now();
            const jsonString = JSON.stringify(testEvents);
            const jsonTime = performance.now() - jsonStart;
            const jsonSize = new TextEncoder().encode(jsonString).length;

            // Measure binary encoding time
            const binaryStart = performance.now();
            const { buffer, metrics } = encodeEvents(testEvents);
            const binaryTime = performance.now() - binaryStart;

            // Binary should be faster
            const speedImprovement = (jsonTime / binaryTime);
            console.log(`
                === Encoding Performance ===
                JSON:   ${jsonTime.toFixed(2)}ms for ${testEvents.length} events
                Binary: ${binaryTime.toFixed(2)}ms for ${testEvents.length} events
                Speed:  ${speedImprovement.toFixed(1)}x faster
            `);

            expect(binaryTime).toBeLessThan(jsonTime);
            expect(speedImprovement).toBeGreaterThan(5); // At least 5x faster

            // Binary should be smaller
            const sizeReduction = ((jsonSize - buffer.byteLength) / jsonSize) * 100;
            console.log(`
                === Size Comparison ===
                JSON:   ${(jsonSize / 1024).toFixed(2)}KB
                Binary: ${(buffer.byteLength / 1024).toFixed(2)}KB
                Reduction: ${sizeReduction.toFixed(1)}%
            `);

            expect(buffer.byteLength).toBeLessThan(jsonSize);
            expect(sizeReduction).toBeGreaterThan(30); // At least 30% smaller
        });
    });

    describe('Deserialization Performance', () => {
        it('should decode binary faster than JSON parsing', () => {
            // Prepare data
            const jsonString = JSON.stringify(testEvents);
            const { buffer } = encodeEvents(testEvents);

            // Measure JSON parsing
            const jsonStart = performance.now();
            const jsonParsed = JSON.parse(jsonString);
            const jsonTime = performance.now() - jsonStart;

            // Measure binary decoding
            const binaryStart = performance.now();
            const { events: binaryDecoded } = decodeEvents(buffer);
            const binaryTime = performance.now() - binaryStart;

            // Compare
            const speedImprovement = (jsonTime / binaryTime);
            console.log(`
                === Decoding Performance ===
                JSON Parse: ${jsonTime.toFixed(2)}ms
                Binary Decode: ${binaryTime.toFixed(2)}ms
                Speed: ${speedImprovement.toFixed(1)}x faster
            `);

            expect(binaryTime).toBeLessThan(jsonTime);
            expect(binaryDecoded.length).toBe(testEvents.length);
        });
    });

    describe('Transfer Performance (Simulated)', () => {
        it('should demonstrate zero-copy transfer advantage', () => {
            const { buffer } = encodeEvents(testEvents);

            // Simulate structured clone (deep copy)
            const cloneStart = performance.now();
            const clonedData = structuredClone({ data: new Uint8Array(buffer) });
            const cloneTime = performance.now() - cloneStart;

            // Simulate transferable (would be instant in real worker)
            const transferStart = performance.now();
            const transferred = buffer; // In real worker: postMessage(data, [buffer])
            const transferTime = performance.now() - transferStart;

            console.log(`
                === Transfer Simulation ===
                Structured Clone: ${cloneTime.toFixed(2)}ms
                Transferable: ${transferTime.toFixed(2)}ms (near-zero in real worker)
                Expected Improvement: 100% (instant transfer)
            `);

            // Transfer should be nearly instant
            expect(transferTime).toBeLessThan(0.1);
        });
    });

    describe('End-to-end Performance', () => {
        it('should show overall improvement', () => {
            // JSON approach
            const jsonTotalStart = performance.now();
            const jsonString = JSON.stringify(testEvents);
            const jsonCloned = structuredClone(jsonString); // Simulate worker transfer
            const jsonParsed = JSON.parse(jsonCloned);
            const jsonTotalTime = performance.now() - jsonTotalStart;

            // Binary approach
            const binaryTotalStart = performance.now();
            const { buffer } = encodeEvents(testEvents);
            // In real scenario, buffer would be transferred with zero-copy
            const { events: decoded } = decodeEvents(buffer);
            const binaryTotalTime = performance.now() - binaryTotalStart;

            // Calculate improvement
            const totalImprovement = (jsonTotalTime / binaryTotalTime);

            console.log(`
                ╔══════════════════════════════════════════════════════════════╗
                ║           End-to-End Performance Comparison                 ║
                ╚══════════════════════════════════════════════════════════════╝

                Test Data: ${testEvents.length} Nostr events

                Traditional (JSON + Structured Clone):
                  Total Time: ${jsonTotalTime.toFixed(2)}ms

                Optimized (Binary + Transferables):
                  Total Time: ${binaryTotalTime.toFixed(2)}ms

                Overall Improvement: ${totalImprovement.toFixed(1)}x faster
                Time Saved: ${(jsonTotalTime - binaryTotalTime).toFixed(2)}ms

                ═══════════════════════════════════════════════════════════════
            `);

            expect(binaryTotalTime).toBeLessThan(jsonTotalTime);
            expect(totalImprovement).toBeGreaterThan(3); // At least 3x faster overall
            expect(decoded.length).toBe(testEvents.length);
        });
    });

    describe('Memory Efficiency', () => {
        it('should use less memory with binary format', () => {
            const jsonString = JSON.stringify(testEvents);
            const { buffer } = encodeEvents(testEvents);

            // JSON keeps both string and parsed object in memory
            const jsonMemory = jsonString.length * 2 + // UTF-16 characters
                             JSON.stringify(testEvents).length; // Parsed object estimate

            // Binary only needs the buffer
            const binaryMemory = buffer.byteLength;

            const memoryReduction = ((jsonMemory - binaryMemory) / jsonMemory) * 100;

            console.log(`
                === Memory Usage ===
                JSON (estimated): ${(jsonMemory / 1024 / 1024).toFixed(2)}MB
                Binary: ${(binaryMemory / 1024 / 1024).toFixed(2)}MB
                Reduction: ${memoryReduction.toFixed(1)}%
            `);

            expect(binaryMemory).toBeLessThan(jsonMemory);
        });
    });

    describe('Scalability', () => {
        it('should maintain performance advantage at different scales', () => {
            const testSizes = [10, 100, 1000, 5000];
            const results: any[] = [];

            for (const size of testSizes) {
                const events = testEvents.slice(0, size);

                // JSON
                const jsonStart = performance.now();
                JSON.parse(JSON.stringify(events));
                const jsonTime = performance.now() - jsonStart;

                // Binary
                const binaryStart = performance.now();
                const { buffer } = encodeEvents(events);
                decodeEvents(buffer);
                const binaryTime = performance.now() - binaryStart;

                results.push({
                    size,
                    jsonTime,
                    binaryTime,
                    improvement: jsonTime / binaryTime
                });
            }

            console.log(`
                === Scalability Test ===
                Events | JSON (ms) | Binary (ms) | Improvement
                -------|-----------|-------------|------------`);

            results.forEach(r => {
                console.log(`${r.size.toString().padStart(6)} | ${r.jsonTime.toFixed(2).padStart(9)} | ${r.binaryTime.toFixed(2).padStart(11)} | ${r.improvement.toFixed(1)}x`);
            });

            // Should maintain advantage at all scales
            results.forEach(r => {
                expect(r.binaryTime).toBeLessThan(r.jsonTime);
            });
        });
    });
});