import { describe, it, expect, beforeEach } from 'vitest';
import { createEventContent } from './index.svelte';
import { NDKEvent } from '@nostr-dev-kit/ndk';

describe('createEventContent', () => {
    describe('with valid event', () => {
        it('should handle event with content', () => {
            const event = new NDKEvent();
            event.content = 'Hello World';
            event.tags = [];

            const content = createEventContent(() => ({ event }));

            expect(content.content).toBe('Hello World');
            expect(content.segments).toBeDefined();
            expect(Array.isArray(content.segments)).toBe(true);
        });

        it('should handle event with emoji tags', () => {
            const event = new NDKEvent();
            event.content = 'Hello :custom:';
            event.tags = [['emoji', 'custom', 'https://example.com/emoji.png']];

            const content = createEventContent(() => ({ event }));

            expect(content.emojiMap.size).toBe(1);
            expect(content.emojiMap.get('custom')).toBe('https://example.com/emoji.png');
        });

        it('should handle event with no content', () => {
            const event = new NDKEvent();
            event.content = '';
            event.tags = [];

            const content = createEventContent(() => ({ event }));

            expect(content.content).toBe('');
            expect(content.segments).toEqual([]);
        });
    });

    describe('with undefined/null event', () => {
        it('should handle undefined event', () => {
            const content = createEventContent(() => ({ event: undefined }));

            expect(content.content).toBe('');
            expect(content.segments).toBeDefined();
            expect(Array.isArray(content.segments)).toBe(true);
        });

        it('should handle null event', () => {
            const content = createEventContent(() => ({ event: null as any }));

            expect(content.content).toBe('');
            expect(content.segments).toBeDefined();
        });
    });

    describe('with invalid event data', () => {
        it('should handle event with undefined content', () => {
            const event = new NDKEvent();
            event.content = undefined as any;
            event.tags = [];

            const content = createEventContent(() => ({ event }));

            expect(content.content).toBe('');
            expect(() => content.segments).not.toThrow();
        });

        it('should handle event with null content', () => {
            const event = new NDKEvent();
            event.content = null as any;
            event.tags = [];

            const content = createEventContent(() => ({ event }));

            expect(content.content).toBe('');
        });

        it('should handle event with non-string content', () => {
            const event = new NDKEvent();
            event.content = 123 as any;
            event.tags = [];

            const content = createEventContent(() => ({ event }));

            expect(typeof content.content).toBe('string');
            expect(content.content).toBe('123');
        });

        it('should handle event with undefined tags', () => {
            const event = new NDKEvent();
            event.content = 'Hello';
            event.tags = undefined as any;

            const content = createEventContent(() => ({ event }));

            expect(() => content.emojiMap).not.toThrow();
            expect(content.emojiMap.size).toBe(0);
        });

        it('should handle event with null tags', () => {
            const event = new NDKEvent();
            event.content = 'Hello';
            event.tags = null as any;

            const content = createEventContent(() => ({ event }));

            expect(() => content.emojiMap).not.toThrow();
            expect(content.emojiMap.size).toBe(0);
        });

        it('should handle event with non-array tags', () => {
            const event = new NDKEvent();
            event.content = 'Hello';
            event.tags = 'not-an-array' as any;

            const content = createEventContent(() => ({ event }));

            expect(() => content.emojiMap).not.toThrow();
            expect(content.emojiMap.size).toBe(0);
        });
    });

    describe('with direct content parameter', () => {
        it('should handle content string', () => {
            const content = createEventContent(() => ({ content: 'Direct content' }));

            expect(content.content).toBe('Direct content');
            expect(content.segments).toBeDefined();
        });

        it('should handle emojiTags parameter', () => {
            const emojiTags = [['emoji', 'test', 'https://example.com/test.png']];
            const content = createEventContent(() => ({
                content: 'Hello :test:',
                emojiTags
            }));

            expect(content.emojiMap.size).toBe(1);
            expect(content.emojiMap.get('test')).toBe('https://example.com/test.png');
        });
    });

    describe('content cleaning', () => {
        it('should remove [Image #N] markers', () => {
            const event = new NDKEvent();
            event.content = 'Hello [Image #1] World [Image #2]';
            event.tags = [];

            const content = createEventContent(() => ({ event }));

            expect(content.content).toBe('Hello  World');
        });

        it('should trim whitespace', () => {
            const event = new NDKEvent();
            event.content = '  Hello World  ';
            event.tags = [];

            const content = createEventContent(() => ({ event }));

            expect(content.content).toBe('Hello World');
        });
    });

    describe('reactive updates', () => {
        it('should recompute when config changes', () => {
            let eventContent = 'First';
            const event = new NDKEvent();
            event.tags = [];

            const content = createEventContent(() => {
                event.content = eventContent;
                return { event };
            });

            expect(content.content).toBe('First');

            eventContent = 'Second';
            event.content = eventContent;

            expect(content.content).toBe('Second');
        });
    });
});
