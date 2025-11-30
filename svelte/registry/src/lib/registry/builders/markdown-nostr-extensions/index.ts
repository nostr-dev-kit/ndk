import { PATTERNS, decodeNostrUri, createEmojiSegment, type ParsedSegment } from '../event-content/utils.js';
import type { MarkedExtension, Token, Tokens } from 'marked';

// ============================================================================
// Custom Token Types
// ============================================================================

interface NostrMentionToken extends Tokens.Generic {
    type: 'nostr-mention';
    raw: string;
    bech32: string;
    mentionType: 'mention';
}

interface NostrEventRefToken extends Tokens.Generic {
    type: 'nostr-event-ref';
    raw: string;
    bech32: string;
}

interface NostrEmojiToken extends Tokens.Generic {
    type: 'nostr-emoji';
    raw: string;
    shortcode: string;
    url?: string;
}

interface NostrHashtagToken extends Tokens.Generic {
    type: 'nostr-hashtag';
    raw: string;
    tag: string;
}

// ============================================================================
// Nostr Mention Extension (npub, nprofile)
// ============================================================================

export function createNostrMentionExtension() {
    return {
        name: 'nostr-mention',
        level: 'inline' as const,
        start(src: string) {
            const index = src.indexOf('nostr:');
            if (index === -1) return -1;
            // Check if it's a mention type
            if (src.substring(index).match(/^nostr:(npub1[a-z0-9]{58}|nprofile1[a-z0-9]+)/i)) {
                return index;
            }
            return -1;
        },
        tokenizer(src: string, tokens: Token[]) {
            const rule = /^nostr:(npub1[a-z0-9]{58}|nprofile1[a-z0-9]+)/i;
            const match = rule.exec(src);

            if (match) {
                const bech32 = match[1];
                const segment = decodeNostrUri(bech32);

                if (segment.type === 'mention') {
                    return {
                        type: 'nostr-mention',
                        raw: match[0],
                        bech32,
                        mentionType: 'mention'
                    } as NostrMentionToken;
                }
            }

            return undefined;
        },
        renderer(token: Token) {
            const mentionToken = token as NostrMentionToken;
            return `<span class="nostr-mention" data-bech32="${mentionToken.bech32}" data-type="${mentionToken.mentionType}"></span>`;
        }
    };
}

// ============================================================================
// Nostr Event Reference Extension (note, nevent, naddr)
// ============================================================================

export function createNostrEventRefExtension() {
    return {
        name: 'nostr-event-ref',
        level: 'inline' as const,
        start(src: string) {
            const index = src.indexOf('nostr:');
            if (index === -1) return -1;
            // Check if it's an event ref type
            if (src.substring(index).match(/^nostr:(note1[a-z0-9]{58}|nevent1[a-z0-9]+|naddr1[a-z0-9]+)/i)) {
                return index;
            }
            return -1;
        },
        tokenizer(src: string, tokens: Token[]) {
            const rule = /^nostr:(note1[a-z0-9]{58}|nevent1[a-z0-9]+|naddr1[a-z0-9]+)/i;
            const match = rule.exec(src);

            if (match) {
                const bech32 = match[1];
                const segment = decodeNostrUri(bech32);

                if (segment.type === 'event-ref') {
                    return {
                        type: 'nostr-event-ref',
                        raw: match[0],
                        bech32
                    } as NostrEventRefToken;
                }
            }

            return undefined;
        },
        renderer(token: Token) {
            const eventToken = token as NostrEventRefToken;
            return `<span class="nostr-event-ref" data-bech32="${eventToken.bech32}"></span>`;
        }
    };
}

// ============================================================================
// Emoji Shortcode Extension (:emoji:)
// ============================================================================

export function createEmojiExtension(emojiMap: Map<string, string>) {
    return {
        name: 'nostr-emoji',
        level: 'inline' as const,
        start(src: string) {
            // Only return a position if it's actually valid emoji syntax :shortcode:
            const rule = /:([a-zA-Z0-9_]+):/;
            const match = src.match(rule);
            return match ? src.indexOf(match[0]) : -1;
        },
        tokenizer(src: string, tokens: Token[]) {
            // Match :shortcode: pattern
            const rule = /^:([a-zA-Z0-9_]+):/;
            const match = rule.exec(src);

            if (match) {
                const shortcode = match[1];
                const url = emojiMap.get(shortcode);

                // Only create token if emoji exists in map
                if (url) {
                    return {
                        type: 'nostr-emoji',
                        raw: match[0],
                        shortcode,
                        url
                    } as NostrEmojiToken;
                }
            }

            return undefined;
        },
        renderer(token: Token) {
            const emojiToken = token as NostrEmojiToken;
            if (emojiToken.url) {
                return `<img class="nostr-emoji" src="${emojiToken.url}" alt=":${emojiToken.shortcode}:" data-shortcode="${emojiToken.shortcode}" />`;
            }
            return '';
        }
    };
}

// ============================================================================
// Hashtag Extension (#hashtag)
// ============================================================================

export function createHashtagExtension() {
    return {
        name: 'nostr-hashtag',
        level: 'inline' as const,
        start(src: string) {
            // Look for # at start or after whitespace
            const index = src.search(/(?:^|\s)#/);
            return index === -1 ? -1 : (index === 0 ? 0 : index + 1); // Return position of #
        },
        tokenizer(src: string, tokens: Token[]) {
            // Match #tag pattern - must be at start or after whitespace
            // Don't match if # is inside a word
            const rule = /^#([a-zA-Z0-9_\u0080-\uFFFF]+)(?=\s|$|[^\w])/;
            const match = rule.exec(src);

            if (match) {
                const tag = match[1];
                return {
                    type: 'nostr-hashtag',
                    raw: match[0],
                    tag
                } as NostrHashtagToken;
            }

            return undefined;
        },
        renderer(token: Token) {
            const hashtagToken = token as NostrHashtagToken;
            return `<span class="nostr-hashtag" data-tag="${hashtagToken.tag}"></span>`;
        }
    };
}

// ============================================================================
// Extension Factory
// ============================================================================

export interface NostrExtensionsOptions {
    emojiTags?: string[][];
}

export function createNostrMarkdownExtensions(options: NostrExtensionsOptions = {}) {
    // Build emoji map from tags
    const emojiMap = new Map<string, string>();
    if (options.emojiTags) {
        for (const [type, shortcode, url] of options.emojiTags) {
            if (type === 'emoji' && shortcode && url) {
                emojiMap.set(shortcode, url);
            }
        }
    }

    const extensions: any[] = [
        createNostrMentionExtension(),
        createNostrEventRefExtension(),
        createHashtagExtension()
    ];

    // Only add emoji extension if there are emojis to process
    if (emojiMap.size > 0) {
        extensions.push(createEmojiExtension(emojiMap));
    }

    return extensions;
}
