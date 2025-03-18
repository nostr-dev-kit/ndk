import { describe, test, expect } from 'vitest';
import { NDKStorySticker, NDKStoryStickerType, type NDKTag } from './ndk-story-sticker';
import { NDKUser } from '../../user/index.js';

const sampleUser = new NDKUser('sample-pubkey');

const sampleTag: NDKTag = [
    'sticker',
    'text',
    'Hello world!',
    '540,960',
    '500x150',
    'style bold',
    'rot 15',
];

describe('NDKStorySticker', () => {
    test('should initialize correctly from explicit type', () => {
        const sticker = new NDKStorySticker(NDKStoryStickerType.Pubkey);

        expect(sticker.type).toBe(NDKStoryStickerType.Pubkey);
        expect(sticker.value).toBeUndefined();
        expect(sticker.position).toEqual({ x: 0, y: 0 });
        expect(sticker.dimension).toEqual({ width: 0, height: 0 });
    });

    test('should initialize correctly from a tag', () => {
        const sticker = new NDKStorySticker(sampleTag);

        expect(sticker.type).toBe(NDKStoryStickerType.Text);
        expect(sticker.value).toBe('Hello world!');
        expect(sticker.position).toEqual({ x: 540, y: 960 });
        expect(sticker.dimension).toEqual({ width: 500, height: 150 });
        expect(sticker.style).toBe('bold');
        expect(sticker.rotation).toBe(15);
    });

    test('should correctly set and get properties', () => {
        const sticker = new NDKStorySticker(NDKStoryStickerType.Text);

        sticker.value = 'Test Sticker';
        sticker.position = { x: 100, y: 200 };
        sticker.dimension = { width: 300, height: 100 };
        sticker.style = 'italic';
        sticker.rotation = 45;

        expect(sticker.value).toBe('Test Sticker');
        expect(sticker.position).toEqual({ x: 100, y: 200 });
        expect(sticker.dimension).toEqual({ width: 300, height: 100 });
        expect(sticker.style).toBe('italic');
        expect(sticker.rotation).toBe(45);
    });

    test('should correctly serialize to tag', () => {
        const sticker = new NDKStorySticker(NDKStoryStickerType.Pubkey);

        sticker.value = sampleUser;
        sticker.position = { x: 250, y: 400 };
        sticker.dimension = { width: 150, height: 150 };
        sticker.style = 'highlight';

        const expectedTag: NDKTag = [
            'sticker',
            'pubkey',
            'sample-pubkey',
            '250,400',
            '150x150',
            'style highlight',
        ];

        expect(sticker.toTag()).toEqual(expectedTag);
    });

    test('fromTag should return null for invalid tags', () => {
        const invalidTag: NDKTag = ['invalid', 'tag'];
        const sticker = NDKStorySticker.fromTag(invalidTag);
        expect(sticker).toBeNull();
    });
});
