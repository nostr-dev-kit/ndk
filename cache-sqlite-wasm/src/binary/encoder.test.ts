import { describe, it, expect, vi } from 'vitest';
import { encodeEvents, encodeSingleEvent, isValidBinaryFormat, type EventForEncoding } from './encoder';
import { decodeEvents, decodeSingleEvent } from './decoder';

describe('Binary Encoder/Decoder', () => {
    const sampleEvent: EventForEncoding = {
        id: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        pubkey: 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        created_at: 1700000000,
        kind: 1,
        sig: '1111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111',
        content: 'Hello, Nostr!',
        tags: [
            ['e', 'eventid123'],
            ['p', 'pubkey456', 'wss://relay.example.com'],
            ['t', 'bitcoin']
        ],
        relay_url: 'wss://relay.nostr.com'
    };

    describe('Single Event Encoding/Decoding', () => {
        it('should encode and decode a single event correctly', () => {
            const buffer = encodeSingleEvent(sampleEvent);

            expect(buffer).toBeInstanceOf(ArrayBuffer);
            expect(buffer.byteLength).toBeGreaterThan(0);

            const decoded = decodeSingleEvent(buffer);

            expect(decoded.id).toBe(sampleEvent.id);
            expect(decoded.pubkey).toBe(sampleEvent.pubkey);
            expect(decoded.created_at).toBe(sampleEvent.created_at);
            expect(decoded.kind).toBe(sampleEvent.kind);
            expect(decoded.sig).toBe(sampleEvent.sig);
            expect(decoded.content).toBe(sampleEvent.content);
            expect(decoded.tags).toEqual(sampleEvent.tags);
            expect(decoded.relay_url).toBe(sampleEvent.relay_url);
        });

        it('should handle event without relay_url', () => {
            const eventWithoutRelay = { ...sampleEvent, relay_url: null };
            const buffer = encodeSingleEvent(eventWithoutRelay);
            const decoded = decodeSingleEvent(buffer);

            expect(decoded.relay_url).toBe(null);
        });

        it('should handle empty tags array', () => {
            const eventWithoutTags = { ...sampleEvent, tags: [] };
            const buffer = encodeSingleEvent(eventWithoutTags);
            const decoded = decodeSingleEvent(buffer);

            expect(decoded.tags).toEqual([]);
        });

        it('should handle empty content', () => {
            const eventWithoutContent = { ...sampleEvent, content: '' };
            const buffer = encodeSingleEvent(eventWithoutContent);
            const decoded = decodeSingleEvent(buffer);

            expect(decoded.content).toBe('');
        });
    });

    describe('Multiple Events Encoding/Decoding', () => {
        it('should encode and decode multiple events correctly', () => {
            const events: EventForEncoding[] = [
                sampleEvent,
                { ...sampleEvent, id: 'fedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321', content: 'Second event' },
                { ...sampleEvent, id: '0000000000000000000000000000000000000000000000000000000000000000', content: 'Third event', tags: [] }
            ];

            const buffer = encodeEvents(events);

            expect(buffer).toBeInstanceOf(ArrayBuffer);

            const decoded = decodeEvents(buffer);

            expect(decoded.length).toBe(3);
            expect(decoded[0].id).toBe(events[0].id);
            expect(decoded[1].content).toBe('Second event');
            expect(decoded[2].tags).toEqual([]);
        });

        it('should handle empty events array', () => {
            const buffer = encodeEvents([]);
            const decoded = decodeEvents(buffer);

            expect(decoded).toEqual([]);
        });
    });

    describe('Binary Format Validation', () => {
        it('should validate correct binary format', () => {
            const buffer = encodeSingleEvent(sampleEvent);
            expect(isValidBinaryFormat(buffer)).toBe(true);
        });

        it('should reject invalid binary format', () => {
            const invalidBuffer = new ArrayBuffer(100);
            expect(isValidBinaryFormat(invalidBuffer)).toBe(false);
        });

        it('should reject too small buffers', () => {
            const tinyBuffer = new ArrayBuffer(5);
            expect(isValidBinaryFormat(tinyBuffer)).toBe(false);
        });
    });

    describe('Special Characters and Edge Cases', () => {
        it('should handle unicode content correctly', () => {
            const unicodeEvent = {
                ...sampleEvent,
                content: '👋 Hello 世界 🌍 नमस्ते мир'
            };

            const buffer = encodeSingleEvent(unicodeEvent);
            const decoded = decodeSingleEvent(buffer);

            expect(decoded.content).toBe(unicodeEvent.content);
        });

        it('should handle very long content', () => {
            const longContent = 'a'.repeat(50000);
            const longEvent = {
                ...sampleEvent,
                content: longContent
            };

            const buffer = encodeSingleEvent(longEvent);
            const decoded = decodeSingleEvent(buffer);

            expect(decoded.content).toBe(longContent);
        });

        it('should handle deeply nested tags', () => {
            const complexTags = [
                ['a', 'b', 'c', 'd', 'e', 'f'],
                ['very', 'long', 'tag', 'with', 'many', 'items', 'here'],
                ['x'.repeat(100)]
            ];

            const complexEvent = {
                ...sampleEvent,
                tags: complexTags
            };

            const buffer = encodeSingleEvent(complexEvent);
            const decoded = decodeSingleEvent(buffer);

            expect(decoded.tags).toEqual(complexTags);
        });
    });

    describe('Transferable ArrayBuffer', () => {
        it('should produce transferable ArrayBuffer', () => {
            const buffer = encodeSingleEvent(sampleEvent);

            // ArrayBuffer should be transferable
            expect(buffer).toBeInstanceOf(ArrayBuffer);
            expect(buffer.byteLength).toBeGreaterThan(0);

            // In a real worker environment, this buffer could be transferred
            // with zero-copy semantics via postMessage(data, [buffer])
        });
    });

    describe('Round-trip consistency', () => {
        it('should maintain data integrity through multiple encode/decode cycles', () => {
            let currentEvent = sampleEvent;

            for (let i = 0; i < 5; i++) {
                const buffer = encodeSingleEvent(currentEvent);
                const decoded = decodeSingleEvent(buffer);

                expect(decoded.id).toBe(sampleEvent.id);
                expect(decoded.pubkey).toBe(sampleEvent.pubkey);
                expect(decoded.created_at).toBe(sampleEvent.created_at);
                expect(decoded.kind).toBe(sampleEvent.kind);
                expect(decoded.sig).toBe(sampleEvent.sig);
                expect(decoded.content).toBe(sampleEvent.content);
                expect(decoded.tags).toEqual(sampleEvent.tags);

                currentEvent = decoded;
            }
        });
    });
});