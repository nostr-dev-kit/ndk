import { nip19 } from "@nostr-dev-kit/ndk";

export interface ParsedSegment {
    type:
        | "text"
        | "npub"
        | "nprofile"
        | "event-ref" // Combined type for note, nevent, naddr
        | "link"
        | "media"
        | "emoji"
        | "hashtag"
        | "image-grid";
    content: string;
    data?: string | string[]; // bech32 string or array of image URLs
}

// ============================================================================
// Pattern Definitions
// ============================================================================

export const PATTERNS = {
    EMOJI_SHORTCODE: /:([a-zA-Z0-9_]+):/g,
    NOSTR_URI: /nostr:(npub1[a-z0-9]{58}|nprofile1[a-z0-9]+|note1[a-z0-9]{58}|nevent1[a-z0-9]+|naddr1[a-z0-9]+)/gi,
    HASHTAG: /(^|\s)#([a-zA-Z0-9_\u0080-\uFFFF]+)(?=\s|$|[^\w])/g,
    MEDIA_FILE: /https?:\/\/[^\s<>"]+\.(jpg|jpeg|png|gif|webp|svg|mp4|webm|mov)(\?[^\s<>"]*)?/gi,
    YOUTUBE:
        /https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})[^\s<>"]*/gi,
    URL: /https?:\/\/[^\s<>"]+/gi,
} as const;

// ============================================================================
// Emoji Processing
// ============================================================================

export function buildEmojiMap(tags: string[][]): Map<string, string> {
    const emojiMap = new Map();

    if (!Array.isArray(tags)) {
        console.warn('[buildEmojiMap] Expected tags to be an array, got:', typeof tags);
        return emojiMap;
    }

    for (const [type, shortcode, url] of tags) {
        if (type === "emoji" && shortcode && url) {
            emojiMap.set(shortcode, url);
        }
    }

    return emojiMap;
}

export function createEmojiSegment(shortcode: string, emojiMap: Map<string, string>): ParsedSegment {
    const url = emojiMap.get(shortcode);
    return url ? { type: "emoji", content: shortcode, data: url } : { type: "text", content: `:${shortcode}:` };
}

// ============================================================================
// Nostr URI Processing
// ============================================================================

export function decodeNostrUri(uri: string): ParsedSegment {
    try {
        const prefix = uri.substring(0, uri.indexOf("1") + 1);

        // Validate by attempting to decode
        nip19.decode(uri);

        // For user references, just store the bech32 string
        if (prefix === "npub1") {
            return { type: "npub", content: uri, data: uri };
        }

        if (prefix === "nprofile1") {
            return { type: "nprofile", content: uri, data: uri };
        }

        // For event references, just store the bech32 string
        if (prefix === "note1" || prefix === "nevent1" || prefix === "naddr1") {
            return { type: "event-ref", content: uri, data: uri };
        }
    } catch {
        console.warn("[EventContent] Failed to decode Nostr URI:", uri);
    }

    return { type: "text", content: `nostr:${uri}` };
}

// ============================================================================
// Media Detection
// ============================================================================

export function isImage(url: string): boolean {
    return /\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i.test(url);
}

export function isVideo(url: string): boolean {
    return /\.(mp4|webm|mov)(\?|$)/i.test(url);
}

export function isYouTube(url: string): boolean {
    return /youtube\.com|youtu\.be/i.test(url);
}

export function extractYouTubeId(url: string): string | null {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    return match?.[1] || null;
}

// ============================================================================
// Segment Classification
// ============================================================================

export function classifyMatch(text: string, emojiMap: Map<string, string>): ParsedSegment {
    // Check hashtag (includes potential leading whitespace)
    const hashtagMatch = text.match(/^(\s)?#([a-zA-Z0-9_\u0080-\uFFFF]+)$/);
    if (hashtagMatch) {
        const [, whitespace, tag] = hashtagMatch;
        // If there's leading whitespace, we need to handle it separately
        if (whitespace) {
            // This will be handled by the parsing logic to add whitespace as text
            return { type: "hashtag", content: tag, data: tag };
        }
        return { type: "hashtag", content: tag, data: tag };
    }

    // Check emoji shortcode
    if (text.startsWith(":") && text.endsWith(":")) {
        const shortcode = text.slice(1, -1);
        return createEmojiSegment(shortcode, emojiMap);
    }

    // Check Nostr URI
    if (text.startsWith("nostr:")) {
        return decodeNostrUri(text.slice(6));
    }

    // Check media
    if (isImage(text) || isVideo(text) || isYouTube(text)) {
        return { type: "media", content: text };
    }

    // Check URL
    if (text.startsWith("http")) {
        return { type: "link", content: text };
    }

    return { type: "text", content: text };
}

// ============================================================================
// Content Parsing
// ============================================================================

export function collectMatches(content: string): Array<{ match: RegExpExecArray; index: number }> {
    const matches: Array<{ match: RegExpExecArray; index: number }> = [];

    for (const pattern of Object.values(PATTERNS)) {
        pattern.lastIndex = 0;
        let match = pattern.exec(content);
        while (match !== null) {
            matches.push({ match, index: match.index });
            match = pattern.exec(content);
        }
    }

    return matches.sort((a, b) => a.index - b.index);
}

export function parseContentToSegments(content: string, emojiMap: Map<string, string>): ParsedSegment[] {
    const segments: ParsedSegment[] = [];
    const matches = collectMatches(content);

    let lastIndex = 0;

    for (const { match, index } of matches) {
        // Skip overlapping matches
        if (index < lastIndex) continue;

        // Add text before match
        if (index > lastIndex) {
            segments.push({
                type: "text",
                content: content.slice(lastIndex, index),
            });
        }

        // Special handling for hashtags (need to extract the tag without the # and potential whitespace)
        if (match[0].match(/^\s?#[a-zA-Z0-9_\u0080-\uFFFF]+$/)) {
            const hashtagMatch = match[0].match(/^(\s)?#([a-zA-Z0-9_\u0080-\uFFFF]+)$/);
            if (hashtagMatch) {
                const [, whitespace, tag] = hashtagMatch;
                // Add whitespace as text if present
                if (whitespace) {
                    segments.push({ type: "text", content: whitespace });
                }
                segments.push({ type: "hashtag", content: tag, data: tag });
            }
        } else {
            // Add classified match
            segments.push(classifyMatch(match[0], emojiMap));
        }

        lastIndex = index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < content.length) {
        segments.push({
            type: "text",
            content: content.slice(lastIndex),
        });
    }

    return segments;
}

// ============================================================================
// Image Grouping
// ============================================================================

export function groupConsecutiveImages(segments: ParsedSegment[]): ParsedSegment[] {
    const result: ParsedSegment[] = [];
    let imageBuffer: string[] = [];

    function flushImages() {
        if (imageBuffer.length === 0) return;

        if (imageBuffer.length === 1) {
            result.push({ type: "media", content: imageBuffer[0] });
        } else {
            result.push({
                type: "image-grid",
                content: "",
                data: imageBuffer,
            });
        }
        imageBuffer = [];
    }

    for (const segment of segments) {
        if (segment.type === "media" && isImage(segment.content)) {
            imageBuffer.push(segment.content);
        } else {
            flushImages();
            result.push(segment);
        }
    }

    flushImages();
    return result;
}
