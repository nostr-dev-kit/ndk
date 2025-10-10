import { describe, expect, test } from "vitest";
import { NDKUser } from "../../user/index.js";
import type { NDKTag } from "../index.js";
import { NDKStory, NDKStorySticker, NDKStoryStickerType } from "./story.js";

const sampleUser = new NDKUser({
    pubkey: "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52",
});

const sampleTag: NDKTag = ["sticker", "text", "Hello world!", "540,960", "500x150", "style bold", "rot 15"];

const invalidEvent = {
    created_at: 1740489132,
    content: "Very nice track.",
    tags: [
        ["t", "music"],
        ["title", "Test Track"],
        ["artist", "Test Artist"],
        ["file_url", "https://raw.githubusercontent.com/nostrdude9/pay-to-play/main/test.mp3"],
        ["duration", "43"],
        ["price", "100"],
        ["free_seconds", "5"],
        ["lightning_address", "nostrdude9@coinos.io"],
        ["album", "Best Album Name"],
        ["image", "https://i.nostr.build/7AaXpMushYmjKAi1.png"],
        ["split", "bob111@coinos.io:50"],
    ],
    kind: 23,
    pubkey: "5f3e7e412eb65a638258fcec4f616a7ffe1f94bc929ce1373e63869b81cb07cf",
    id: "216044a95664b22368f0bf42c794cd5c38b0e553d2fb6c782b3bb316616c3006",
    sig: "3a0cd8904004a521efce1ca19e8ba4044c66adc077e6edcd538d28963d1c3f8bc682141f47dcf30af60c0ae6a2aecee3771a5e20bcd733cbb8b083e348e9dc37",
};

describe("NDKStorySticker", () => {
    test("should initialize correctly from explicit type", () => {
        const sticker = new NDKStorySticker(NDKStoryStickerType.Pubkey);

        expect(sticker.type).toBe(NDKStoryStickerType.Pubkey);
        expect(sticker.value).toBeUndefined();
        expect(sticker.position).toEqual({ x: 0, y: 0 });
        expect(sticker.dimension).toEqual({ width: 0, height: 0 });
    });

    test("should initialize correctly from a tag", () => {
        const sticker = new NDKStorySticker(sampleTag);

        expect(sticker.type).toBe(NDKStoryStickerType.Text);
        expect(sticker.value).toBe("Hello world!");
        expect(sticker.position).toEqual({ x: 540, y: 960 });
        expect(sticker.dimension).toEqual({ width: 500, height: 150 });
        expect(sticker.style).toBe("bold");
        expect(sticker.rotation).toBe(15);
    });

    test("should correctly set and get properties", () => {
        const sticker = new NDKStorySticker(NDKStoryStickerType.Text);

        sticker.value = "Test Sticker";
        sticker.position = { x: 100, y: 200 };
        sticker.dimension = { width: 300, height: 100 };
        sticker.style = "italic";
        sticker.rotation = 45;

        expect(sticker.value).toBe("Test Sticker");
        expect(sticker.position).toEqual({ x: 100, y: 200 });
        expect(sticker.dimension).toEqual({ width: 300, height: 100 });
        expect(sticker.style).toBe("italic");
        expect(sticker.rotation).toBe(45);
    });

    test("should correctly serialize to tag", () => {
        const sticker = new NDKStorySticker(NDKStoryStickerType.Pubkey);

        sticker.value = sampleUser;
        sticker.position = { x: 250, y: 400 };
        sticker.dimension = { width: 150, height: 150 };
        sticker.style = "highlight";

        const expectedTag: NDKTag = [
            "sticker",
            "pubkey",
            "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52",
            "250,400",
            "150x150",
            "style highlight",
        ];

        expect(sticker.toTag()).toEqual(expectedTag);
    });

    test("fromTag should return null for invalid tags", () => {
        const invalidTag: NDKTag = ["invalid", "tag"];
        const sticker = NDKStorySticker.fromTag(invalidTag);
        expect(sticker).toBeNull();
    });

    test("isValid should return true for valid stickers", () => {
        const sticker = new NDKStorySticker(NDKStoryStickerType.Text);
        sticker.value = "Test Sticker";
        sticker.position = { x: 100, y: 200 };
        sticker.dimension = { width: 300, height: 100 };

        expect(sticker.isValid).toBe(true);
    });

    test("isValid should return false when dimensions are invalid", () => {
        const sticker = new NDKStorySticker(NDKStoryStickerType.Text);
        sticker.value = "Test Sticker";
        sticker.position = { x: 100, y: 200 };
        sticker.dimension = { width: Number.NaN, height: 100 };

        expect(sticker.isValid).toBe(false);
        expect(sticker.hasValidDimensions()).toBe(false);
        expect(sticker.hasValidPosition()).toBe(true);
    });

    test("isValid should return false when position is invalid", () => {
        const sticker = new NDKStorySticker(NDKStoryStickerType.Text);
        sticker.value = "Test Sticker";
        sticker.position = { x: Number.NaN, y: 200 };
        sticker.dimension = { width: 300, height: 100 };

        expect(sticker.isValid).toBe(false);
        expect(sticker.hasValidDimensions()).toBe(true);
        expect(sticker.hasValidPosition()).toBe(false);
    });

    test("toTag should throw an error for invalid stickers", () => {
        const sticker = new NDKStorySticker(NDKStoryStickerType.Text);
        sticker.value = "Test Sticker";
        sticker.position = { x: Number.NaN, y: 200 };
        sticker.dimension = { width: 300, height: 100 };

        expect(() => sticker.toTag()).toThrow("Invalid sticker: position is invalid");
    });

    test("isValid should return false when event is invalid", () => {
        const story = new NDKStory(undefined, invalidEvent);
        expect(story.isValid).toBe(false);
    });
});
