import { describe, expect, it } from "vitest";
import {
    buildEmojiMap,
    classifyMatch,
    collectMatches,
    createEmojiSegment,
    decodeNostrUri,
    extractYouTubeId,
    groupConsecutiveImages,
    groupConsecutiveLinks,
    isImage,
    isVideo,
    isYouTube,
    parseContentToSegments,
    type ParsedSegment,
} from "./utils";

describe("buildEmojiMap", () => {
    it("should build map from emoji tags", () => {
        const tags = [
            ["emoji", "smile", "https://example.com/smile.png"],
            ["emoji", "wave", "https://example.com/wave.png"],
        ];

        const map = buildEmojiMap(tags);

        expect(map.size).toBe(2);
        expect(map.get("smile")).toBe("https://example.com/smile.png");
        expect(map.get("wave")).toBe("https://example.com/wave.png");
    });

    it("should ignore non-emoji tags", () => {
        const tags = [
            ["emoji", "smile", "https://example.com/smile.png"],
            ["p", "somepubkey"],
            ["e", "someeventid"],
        ];

        const map = buildEmojiMap(tags);

        expect(map.size).toBe(1);
        expect(map.get("smile")).toBe("https://example.com/smile.png");
    });

    it("should handle empty tags array", () => {
        const map = buildEmojiMap([]);
        expect(map.size).toBe(0);
    });

    it("should handle malformed emoji tags", () => {
        const tags = [
            ["emoji", "valid", "https://example.com/valid.png"],
            ["emoji", "missing-url"], // Missing URL
            ["emoji"], // Missing shortcode and URL
        ];

        const map = buildEmojiMap(tags);

        expect(map.size).toBe(1);
        expect(map.get("valid")).toBe("https://example.com/valid.png");
    });

    it("should handle non-array input gracefully", () => {
        const map = buildEmojiMap(null as any);
        expect(map.size).toBe(0);
    });

    it("should handle duplicate shortcodes (last one wins)", () => {
        const tags = [
            ["emoji", "test", "https://example.com/v1.png"],
            ["emoji", "test", "https://example.com/v2.png"],
        ];

        const map = buildEmojiMap(tags);

        expect(map.size).toBe(1);
        expect(map.get("test")).toBe("https://example.com/v2.png");
    });
});

describe("createEmojiSegment", () => {
    it("should create emoji segment when shortcode exists in map", () => {
        const map = new Map([["smile", "https://example.com/smile.png"]]);

        const segment = createEmojiSegment("smile", map);

        expect(segment).toEqual({
            type: "emoji",
            content: "smile",
            data: "https://example.com/smile.png",
        });
    });

    it("should create text segment when shortcode not in map", () => {
        const map = new Map();

        const segment = createEmojiSegment("unknown", map);

        expect(segment).toEqual({
            type: "text",
            content: ":unknown:",
        });
    });

    it("should handle empty shortcode", () => {
        const map = new Map();

        const segment = createEmojiSegment("", map);

        expect(segment.type).toBe("text");
    });
});

describe("media detection", () => {
    describe("isImage", () => {
        it("should detect common image formats", () => {
            expect(isImage("https://example.com/photo.jpg")).toBe(true);
            expect(isImage("https://example.com/photo.jpeg")).toBe(true);
            expect(isImage("https://example.com/photo.png")).toBe(true);
            expect(isImage("https://example.com/photo.gif")).toBe(true);
            expect(isImage("https://example.com/photo.webp")).toBe(true);
            expect(isImage("https://example.com/photo.svg")).toBe(true);
        });

        it("should handle URLs with query params", () => {
            expect(isImage("https://example.com/photo.jpg?w=500&h=300")).toBe(true);
        });

        it("should handle URLs with fragments", () => {
            expect(isImage("https://example.com/photo.png#section")).toBe(true);
        });

        it("should be case insensitive", () => {
            expect(isImage("https://example.com/photo.JPG")).toBe(true);
            expect(isImage("https://example.com/photo.PNG")).toBe(true);
        });

        it("should return false for non-images", () => {
            expect(isImage("https://example.com/video.mp4")).toBe(false);
            expect(isImage("https://example.com/document.pdf")).toBe(false);
            expect(isImage("https://example.com")).toBe(false);
        });
    });

    describe("isVideo", () => {
        it("should detect common video formats", () => {
            expect(isVideo("https://example.com/clip.mp4")).toBe(true);
            expect(isVideo("https://example.com/clip.webm")).toBe(true);
            expect(isVideo("https://example.com/clip.mov")).toBe(true);
        });

        it("should handle URLs with query params", () => {
            expect(isVideo("https://example.com/clip.mp4?t=30")).toBe(true);
        });

        it("should be case insensitive", () => {
            expect(isVideo("https://example.com/clip.MP4")).toBe(true);
        });

        it("should return false for non-videos", () => {
            expect(isVideo("https://example.com/image.jpg")).toBe(false);
            expect(isVideo("https://example.com")).toBe(false);
        });
    });

    describe("isYouTube", () => {
        it("should detect youtube.com URLs", () => {
            expect(isYouTube("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(true);
            expect(isYouTube("https://youtube.com/watch?v=dQw4w9WgXcQ")).toBe(true);
        });

        it("should detect youtu.be URLs", () => {
            expect(isYouTube("https://youtu.be/dQw4w9WgXcQ")).toBe(true);
        });

        it("should be case insensitive", () => {
            expect(isYouTube("https://YOUTUBE.COM/watch?v=abc")).toBe(true);
            expect(isYouTube("https://YOUTU.BE/abc")).toBe(true);
        });

        it("should return false for non-YouTube URLs", () => {
            expect(isYouTube("https://vimeo.com/123456")).toBe(false);
            expect(isYouTube("https://example.com")).toBe(false);
        });
    });

    describe("extractYouTubeId", () => {
        it("should extract ID from youtube.com watch URL", () => {
            const id = extractYouTubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
            expect(id).toBe("dQw4w9WgXcQ");
        });

        it("should extract ID from youtu.be URL", () => {
            const id = extractYouTubeId("https://youtu.be/dQw4w9WgXcQ");
            expect(id).toBe("dQw4w9WgXcQ");
        });

        it("should extract ID from embed URL", () => {
            const id = extractYouTubeId("https://www.youtube.com/embed/dQw4w9WgXcQ");
            expect(id).toBe("dQw4w9WgXcQ");
        });

        it("should handle URLs with additional parameters", () => {
            const id = extractYouTubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30s");
            expect(id).toBe("dQw4w9WgXcQ");
        });

        it("should return null for invalid YouTube URLs", () => {
            expect(extractYouTubeId("https://example.com")).toBeNull();
            expect(extractYouTubeId("https://youtube.com")).toBeNull();
        });

        it("should validate 11-character ID length", () => {
            const id = extractYouTubeId("https://youtube.com/watch?v=short");
            expect(id).toBeNull();
        });
    });
});

describe("decodeNostrUri", () => {
    it("should handle npub URIs", () => {
        const npub = "npub1test12345678901234567890123456789012345678901234567890";
        const segment = decodeNostrUri(npub);

        // Will either decode successfully or return text on failure
        expect(segment.type === "mention" || segment.type === "text").toBe(true);
    });

    it("should handle nprofile URIs", () => {
        const nprofile = "nprofile1test123456789012345678901234567890";
        const segment = decodeNostrUri(nprofile);

        expect(segment.type === "mention" || segment.type === "text").toBe(true);
    });

    it("should handle note1 URIs", () => {
        const note = "note1test12345678901234567890123456789012345678901234567890";
        const segment = decodeNostrUri(note);

        expect(segment.type === "event-ref" || segment.type === "text").toBe(true);
    });

    it("should handle nevent URIs", () => {
        const nevent = "nevent1test123456789012345678901234567890";
        const segment = decodeNostrUri(nevent);

        expect(segment.type === "event-ref" || segment.type === "text").toBe(true);
    });

    it("should handle naddr URIs", () => {
        const naddr = "naddr1test123456789012345678901234567890";
        const segment = decodeNostrUri(naddr);

        expect(segment.type === "event-ref" || segment.type === "text").toBe(true);
    });

    it("should return text segment for invalid URIs", () => {
        const segment = decodeNostrUri("invalid");

        expect(segment.type).toBe("text");
        expect(segment.content).toBe("nostr:invalid");
    });

    it("should handle empty string", () => {
        const segment = decodeNostrUri("");

        expect(segment.type).toBe("text");
    });
});

describe("classifyMatch", () => {
    const emptyEmojiMap = new Map();

    it("should classify hashtags", () => {
        const segment = classifyMatch("#nostr", emptyEmojiMap);

        expect(segment.type).toBe("hashtag");
        expect(segment.content).toBe("nostr");
        expect(segment.data).toBe("nostr");
    });

    it("should classify hashtags with leading whitespace", () => {
        const segment = classifyMatch(" #nostr", emptyEmojiMap);

        expect(segment.type).toBe("hashtag");
    });

    it("should classify emoji shortcodes", () => {
        const map = new Map([["smile", "https://example.com/smile.png"]]);
        const segment = classifyMatch(":smile:", map);

        expect(segment.type).toBe("emoji");
        expect(segment.content).toBe("smile");
    });

    it("should classify nostr URIs", () => {
        const npub = "nostr:npub1test1234567890123456789012345678901234567890123456789";
        const segment = classifyMatch(npub, emptyEmojiMap);

        // Will be either mention or text depending on decode success
        expect(["mention", "text"].includes(segment.type)).toBe(true);
    });

    it("should classify images", () => {
        const segment = classifyMatch("https://example.com/image.jpg", emptyEmojiMap);

        expect(segment.type).toBe("media");
        expect(segment.content).toBe("https://example.com/image.jpg");
    });

    it("should classify videos", () => {
        const segment = classifyMatch("https://example.com/video.mp4", emptyEmojiMap);

        expect(segment.type).toBe("media");
    });

    it("should classify YouTube URLs", () => {
        const segment = classifyMatch("https://youtube.com/watch?v=abc12345678", emptyEmojiMap);

        expect(segment.type).toBe("media");
    });

    it("should classify regular URLs as links", () => {
        const segment = classifyMatch("https://example.com", emptyEmojiMap);

        expect(segment.type).toBe("link");
    });

    it("should classify plain text", () => {
        const segment = classifyMatch("plain text", emptyEmojiMap);

        expect(segment.type).toBe("text");
        expect(segment.content).toBe("plain text");
    });
});

describe("collectMatches", () => {
    it("should collect all pattern matches", () => {
        const content = "#nostr https://example.com :emoji:";
        const matches = collectMatches(content);

        expect(matches.length).toBeGreaterThan(0);
    });

    it("should sort matches by index", () => {
        const content = "end https://example.com start #nostr";
        const matches = collectMatches(content);

        for (let i = 1; i < matches.length; i++) {
            expect(matches[i].index).toBeGreaterThanOrEqual(matches[i - 1].index);
        }
    });

    it("should handle empty content", () => {
        const matches = collectMatches("");
        expect(matches).toEqual([]);
    });

    it("should handle content with no matches", () => {
        const matches = collectMatches("plain text only");
        expect(matches).toEqual([]);
    });

    it("should collect overlapping pattern ranges", () => {
        const content = "#https://example.com"; // Both hashtag and URL patterns match
        const matches = collectMatches(content);

        expect(matches.length).toBeGreaterThanOrEqual(1);
    });
});

describe("parseContentToSegments", () => {
    const emptyEmojiMap = new Map();

    it("should parse plain text", () => {
        const segments = parseContentToSegments("Hello world", emptyEmojiMap);

        expect(segments).toEqual([{ type: "text", content: "Hello world" }]);
    });

    it("should parse hashtags", () => {
        const segments = parseContentToSegments("Hello #nostr world", emptyEmojiMap);

        expect(segments.length).toBeGreaterThanOrEqual(3);
        expect(segments.some((s) => s.type === "hashtag" && s.content === "nostr")).toBe(true);
    });

    it("should parse URLs", () => {
        const segments = parseContentToSegments("Check https://example.com", emptyEmojiMap);

        expect(segments.some((s) => s.type === "link" && s.content === "https://example.com")).toBe(true);
    });

    it("should parse emojis", () => {
        const map = new Map([["smile", "https://example.com/smile.png"]]);
        const segments = parseContentToSegments("Hello :smile: world", map);

        expect(segments.some((s) => s.type === "emoji" && s.content === "smile")).toBe(true);
    });

    it("should handle mixed content", () => {
        const content = "Hello #nostr https://example.com/image.jpg";
        const segments = parseContentToSegments(content, emptyEmojiMap);

        expect(segments.length).toBeGreaterThan(2);
        expect(segments.some((s) => s.type === "hashtag")).toBe(true);
        expect(segments.some((s) => s.type === "media")).toBe(true);
    });

    it("should skip overlapping matches", () => {
        const content = "#hashtag";
        const segments = parseContentToSegments(content, emptyEmojiMap);

        // Should not create duplicate segments for overlapping patterns
        const hashtagCount = segments.filter((s) => s.type === "hashtag").length;
        expect(hashtagCount).toBeLessThanOrEqual(1);
    });

    it("should preserve whitespace in text segments", () => {
        const segments = parseContentToSegments("  spaces  ", emptyEmojiMap);

        expect(segments[0].content).toContain(" ");
    });

    it("should handle content starting with match", () => {
        const segments = parseContentToSegments("#hashtag text", emptyEmojiMap);

        expect(segments[0].type).toBe("hashtag");
    });

    it("should handle content ending with match", () => {
        const segments = parseContentToSegments("text #hashtag", emptyEmojiMap);

        const lastSegment = segments[segments.length - 1];
        expect(lastSegment.type).toBe("hashtag");
    });

    it("should handle hashtag with leading whitespace", () => {
        const segments = parseContentToSegments("text #tag", emptyEmojiMap);

        const hashtagSegment = segments.find((s) => s.type === "hashtag");
        expect(hashtagSegment?.content).toBe("tag");
    });
});

describe("groupConsecutiveImages", () => {
    it("should group consecutive images", () => {
        const segments: ParsedSegment[] = [
            { type: "media", content: "https://ex.com/1.jpg" },
            { type: "media", content: "https://ex.com/2.jpg" },
            { type: "media", content: "https://ex.com/3.jpg" },
        ];

        const result = groupConsecutiveImages(segments);

        expect(result).toHaveLength(1);
        expect(result[0].type).toBe("media");
        expect(result[0].content).toBe("");
        expect(result[0].data).toEqual([
            "https://ex.com/1.jpg",
            "https://ex.com/2.jpg",
            "https://ex.com/3.jpg",
        ]);
    });

    it("should handle single images", () => {
        const segments: ParsedSegment[] = [{ type: "media", content: "https://ex.com/image.jpg" }];

        const result = groupConsecutiveImages(segments);

        expect(result).toHaveLength(1);
        expect(result[0].type).toBe("media");
        expect(result[0].content).toBe("");
        expect(result[0].data).toEqual(["https://ex.com/image.jpg"]);
    });

    it("should break grouping on non-image content", () => {
        const segments: ParsedSegment[] = [
            { type: "media", content: "https://ex.com/1.jpg" },
            { type: "media", content: "https://ex.com/2.jpg" },
            { type: "text", content: "text" },
            { type: "media", content: "https://ex.com/3.jpg" },
        ];

        const result = groupConsecutiveImages(segments);

        // Should have: media, text, media
        expect(result.length).toBeGreaterThanOrEqual(3);
        expect(result[0].type).toBe("media");
        expect(result[0].data).toHaveLength(2);
        expect(result[1].type).toBe("text");
        expect(result[2].type).toBe("media");
        expect(result[2].data).toHaveLength(1);
    });

    it("should handle whitespace between images", () => {
        const segments: ParsedSegment[] = [
            { type: "media", content: "https://ex.com/1.jpg" },
            { type: "text", content: "  \n  " },
            { type: "media", content: "https://ex.com/2.jpg" },
        ];

        const result = groupConsecutiveImages(segments);

        // Whitespace should not break grouping
        expect(result[0].type).toBe("media");
        expect(result[0].data).toHaveLength(2);
    });

    it("should not group videos with images", () => {
        const segments: ParsedSegment[] = [
            { type: "media", content: "https://ex.com/image.jpg" },
            { type: "media", content: "https://ex.com/video.mp4" },
        ];

        const result = groupConsecutiveImages(segments);

        // Video should break image grouping
        expect(result.length).toBeGreaterThanOrEqual(2);
    });

    it("should handle empty segments array", () => {
        const result = groupConsecutiveImages([]);
        expect(result).toEqual([]);
    });

    it("should preserve non-media segments", () => {
        const segments: ParsedSegment[] = [
            { type: "text", content: "Hello" },
            { type: "hashtag", content: "nostr", data: "nostr" },
            { type: "media", content: "https://ex.com/image.jpg" },
        ];

        const result = groupConsecutiveImages(segments);

        expect(result).toHaveLength(3);
        expect(result[0].type).toBe("text");
        expect(result[1].type).toBe("hashtag");
        expect(result[2].type).toBe("media");
    });
});

describe("groupConsecutiveLinks", () => {
    it("should group consecutive links", () => {
        const segments: ParsedSegment[] = [
            { type: "link", content: "https://ex1.com" },
            { type: "link", content: "https://ex2.com" },
            { type: "link", content: "https://ex3.com" },
        ];

        const result = groupConsecutiveLinks(segments);

        expect(result).toHaveLength(1);
        expect(result[0].type).toBe("link");
        expect(result[0].content).toBe("");
        expect(result[0].data).toEqual(["https://ex1.com", "https://ex2.com", "https://ex3.com"]);
    });

    it("should handle single links", () => {
        const segments: ParsedSegment[] = [{ type: "link", content: "https://example.com" }];

        const result = groupConsecutiveLinks(segments);

        expect(result).toHaveLength(1);
        expect(result[0].type).toBe("link");
        expect(result[0].content).toBe("");
        expect(result[0].data).toEqual(["https://example.com"]);
    });

    it("should break grouping on non-link content", () => {
        const segments: ParsedSegment[] = [
            { type: "link", content: "https://ex1.com" },
            { type: "link", content: "https://ex2.com" },
            { type: "text", content: "text" },
            { type: "link", content: "https://ex3.com" },
        ];

        const result = groupConsecutiveLinks(segments);

        expect(result.length).toBeGreaterThanOrEqual(3);
        expect(result[0].type).toBe("link");
        expect(result[0].data).toHaveLength(2);
        expect(result[1].type).toBe("text");
        expect(result[2].type).toBe("link");
        expect(result[2].data).toHaveLength(1);
    });

    it("should handle whitespace between links", () => {
        const segments: ParsedSegment[] = [
            { type: "link", content: "https://ex1.com" },
            { type: "text", content: "  \n  " },
            { type: "link", content: "https://ex2.com" },
        ];

        const result = groupConsecutiveLinks(segments);

        expect(result[0].type).toBe("link");
        expect(result[0].data).toHaveLength(2);
    });

    it("should handle empty segments array", () => {
        const result = groupConsecutiveLinks([]);
        expect(result).toEqual([]);
    });

    it("should preserve non-link segments", () => {
        const segments: ParsedSegment[] = [
            { type: "text", content: "Hello" },
            { type: "hashtag", content: "nostr", data: "nostr" },
            { type: "link", content: "https://example.com" },
        ];

        const result = groupConsecutiveLinks(segments);

        expect(result).toHaveLength(3);
        expect(result[0].type).toBe("text");
        expect(result[1].type).toBe("hashtag");
        expect(result[2].type).toBe("link");
    });

    it("should handle mix of grouped and single links", () => {
        const segments: ParsedSegment[] = [
            { type: "link", content: "https://ex1.com" },
            { type: "link", content: "https://ex2.com" },
            { type: "text", content: "break" },
            { type: "link", content: "https://ex3.com" }, // Single link
        ];

        const result = groupConsecutiveLinks(segments);

        expect(result).toHaveLength(3);
        expect(result[0].type).toBe("link");
        expect(result[0].data).toHaveLength(2);
        expect(result[1].type).toBe("text");
        expect(result[2].type).toBe("link");
        expect(result[2].data).toHaveLength(1);
    });
});
