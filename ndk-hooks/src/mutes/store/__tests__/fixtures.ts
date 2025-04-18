import { NDKEvent } from "@nostr-dev-kit/ndk";

/**
 * Create a mock NDKEvent for testing
 */
export const createMockEvent = (options: {
    id?: string;
    pubkey?: string;
    kind?: number;
    content?: string;
    tags?: string[][];
}): NDKEvent => {
    const event = {
        id: options.id || "test-event-id",
        pubkey: options.pubkey || "test-pubkey",
        kind: options.kind || 1,
        content: options.content || "test content",
        tags: options.tags || [],
        created_at: Math.floor(Date.now() / 1000),
        sig: "test-signature",
        getMatchingTags: (tagName: string) => (options.tags || []).filter((tag) => tag[0] === tagName),
    } as unknown as NDKEvent;

    return event;
};

/**
 * Create a mock mute list event (kind 10000) for testing
 */
export const createMockMuteListEvent = (options: {
    pubkey?: string;
    mutedPubkeys?: string[];
    mutedEventIds?: string[];
    mutedHashtags?: string[];
    mutedWords?: string[];
}): NDKEvent => {
    const tags: string[][] = [];

    // Add muted pubkeys
    if (options.mutedPubkeys) {
        for (const pubkey of options.mutedPubkeys) {
            tags.push(["p", pubkey]);
        }
    }

    // Add muted event IDs
    if (options.mutedEventIds) {
        for (const eventId of options.mutedEventIds) {
            tags.push(["e", eventId]);
        }
    }

    // Add muted hashtags
    if (options.mutedHashtags) {
        for (const hashtag of options.mutedHashtags) {
            tags.push(["t", hashtag]);
        }
    }

    // Add muted words
    if (options.mutedWords) {
        for (const word of options.mutedWords) {
            tags.push(["word", word]);
        }
    }

    return createMockEvent({
        pubkey: options.pubkey || "test-pubkey",
        kind: 10000,
        content: "",
        tags,
    });
};
