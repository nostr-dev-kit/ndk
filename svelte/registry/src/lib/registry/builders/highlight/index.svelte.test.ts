import { NDKEvent, NDKKind } from "@nostr-dev-kit/ndk";
import { flushSync } from "svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createTestNDK } from "../../../../test-utils";
import { createHighlight } from "./index.svelte";

describe("createHighlight", () => {
    let ndk: ReturnType<typeof createTestNDK>;
    let cleanup: (() => void) | undefined;

    beforeEach(() => {
        ndk = createTestNDK();
        // Mock URL constructor for URL metadata tests
        vi.stubGlobal("URL", class URL {
            hostname: string;
            constructor(url: string) {
                // Simple hostname extraction for testing
                const match = url.match(/^https?:\/\/([^/]+)/);
                this.hostname = match ? match[1] : "unknown";
            }
        });
    });

    afterEach(() => {
        cleanup?.();
        cleanup = undefined;
        vi.unstubAllGlobals();
    });

    describe("content extraction", () => {
        it("should extract content from event", () => {
            let highlight: ReturnType<typeof createHighlight> | undefined;

            const event = new NDKEvent(ndk);
            event.kind = 9802;
            event.content = "This is a highlighted text";

            cleanup = $effect.root(() => {
                highlight = createHighlight(() => ({ event }), ndk);
            });

            flushSync();
            expect(highlight!.content).toBe("This is a highlighted text");
        });

        it("should handle empty content", () => {
            let highlight: ReturnType<typeof createHighlight> | undefined;

            const event = new NDKEvent(ndk);
            event.kind = 9802;
            event.content = "";

            cleanup = $effect.root(() => {
                highlight = createHighlight(() => ({ event }), ndk);
            });

            flushSync();
            expect(highlight!.content).toBe("");
        });
    });

    describe("context handling", () => {
        it("should use context tag when available", () => {
            let highlight: ReturnType<typeof createHighlight> | undefined;

            const event = new NDKEvent(ndk);
            event.kind = 9802;
            event.content = "highlighted text";
            event.tags = [["context", "This is the highlighted text in full context"]];

            cleanup = $effect.root(() => {
                highlight = createHighlight(() => ({ event }), ndk);
            });

            flushSync();
            expect(highlight!.context).toBe("This is the highlighted text in full context");
        });

        it("should use content as context when context tag is missing", () => {
            let highlight: ReturnType<typeof createHighlight> | undefined;

            const event = new NDKEvent(ndk);
            event.kind = 9802;
            event.content = "highlighted text";
            event.tags = [];

            cleanup = $effect.root(() => {
                highlight = createHighlight(() => ({ event }), ndk);
            });

            flushSync();
            expect(highlight!.context).toBe("highlighted text");
        });
    });

    describe("position calculation", () => {
        it("should calculate position when highlight is within context", () => {
            let highlight: ReturnType<typeof createHighlight> | undefined;

            const event = new NDKEvent(ndk);
            event.kind = 9802;
            event.content = "important part";
            event.tags = [["context", "This is the important part of the text"]];

            cleanup = $effect.root(() => {
                highlight = createHighlight(() => ({ event }), ndk);
            });

            flushSync();
            expect(highlight!.position.before).toBe("This is the ");
            expect(highlight!.position.highlight).toBe("important part");
            expect(highlight!.position.after).toBe(" of the text");
        });

        it("should handle highlight at start of context", () => {
            let highlight: ReturnType<typeof createHighlight> | undefined;

            const event = new NDKEvent(ndk);
            event.kind = 9802;
            event.content = "Start text";
            event.tags = [["context", "Start text and more"]];

            cleanup = $effect.root(() => {
                highlight = createHighlight(() => ({ event }), ndk);
            });

            flushSync();
            expect(highlight!.position.before).toBe("");
            expect(highlight!.position.highlight).toBe("Start text");
            expect(highlight!.position.after).toBe(" and more");
        });

        it("should handle highlight at end of context", () => {
            let highlight: ReturnType<typeof createHighlight> | undefined;

            const event = new NDKEvent(ndk);
            event.kind = 9802;
            event.content = "end text";
            event.tags = [["context", "This is the end text"]];

            cleanup = $effect.root(() => {
                highlight = createHighlight(() => ({ event }), ndk);
            });

            flushSync();
            expect(highlight!.position.before).toBe("This is the ");
            expect(highlight!.position.highlight).toBe("end text");
            expect(highlight!.position.after).toBe("");
        });

        it("should handle highlight not found in context", () => {
            let highlight: ReturnType<typeof createHighlight> | undefined;

            const event = new NDKEvent(ndk);
            event.kind = 9802;
            event.content = "not found";
            event.tags = [["context", "Different text entirely"]];

            cleanup = $effect.root(() => {
                highlight = createHighlight(() => ({ event }), ndk);
            });

            flushSync();
            expect(highlight!.position.before).toBe("");
            expect(highlight!.position.highlight).toBe("not found");
            expect(highlight!.position.after).toBe("");
        });

        it("should handle context equal to content", () => {
            let highlight: ReturnType<typeof createHighlight> | undefined;

            const event = new NDKEvent(ndk);
            event.kind = 9802;
            event.content = "same text";
            event.tags = [["context", "same text"]];

            cleanup = $effect.root(() => {
                highlight = createHighlight(() => ({ event }), ndk);
            });

            flushSync();
            expect(highlight!.position.before).toBe("");
            expect(highlight!.position.highlight).toBe("same text");
            expect(highlight!.position.after).toBe("");
        });
    });

    describe("source handling", () => {
        it("should handle no source tags", () => {
            let highlight: ReturnType<typeof createHighlight> | undefined;

            const event = new NDKEvent(ndk);
            event.kind = 9802;
            event.content = "text";
            event.tags = [];

            cleanup = $effect.root(() => {
                highlight = createHighlight(() => ({ event }), ndk);
            });

            expect(highlight!.source).toBeNull();
            expect(highlight!.article).toBeNull();
            expect(highlight!.urlMetadata).toBeNull();
        });

        it("should handle web URL source (r tag)", async () => {
            let highlight: ReturnType<typeof createHighlight> | undefined;

            const event = new NDKEvent(ndk);
            event.kind = 9802;
            event.content = "text";
            event.tags = [["r", "https://example.com/article"]];

            cleanup = $effect.root(() => {
                highlight = createHighlight(() => ({ event }), ndk);
            });

            await new Promise(resolve => setTimeout(resolve, 50));
            flushSync();

            expect(highlight!.source?.type).toBe("web");
            expect(highlight!.source?.value).toBe("https://example.com/article");
            expect(highlight!.source?.url).toBe("https://example.com/article");
        });

        it("should handle article source (a tag)", () => {
            let highlight: ReturnType<typeof createHighlight> | undefined;

            // Use valid 64-char hex pubkey
            const validPubkey = "a".repeat(64);
            const event = new NDKEvent(ndk);
            event.kind = 9802;
            event.content = "text";
            event.tags = [["a", `30023:${validPubkey}:article-slug`]];

            cleanup = $effect.root(() => {
                highlight = createHighlight(() => ({ event }), ndk);
            });

            flushSync();
            expect(highlight!.source?.type).toBe("article");
            expect(highlight!.source?.value).toBe(`30023:${validPubkey}:article-slug`);
            expect(highlight!.source?.displayText).toBe("Article");
        });

        it("should handle event source (e tag)", () => {
            let highlight: ReturnType<typeof createHighlight> | undefined;

            const event = new NDKEvent(ndk);
            event.kind = 9802;
            event.content = "text";
            event.tags = [["e", "event-id-123"]];

            cleanup = $effect.root(() => {
                highlight = createHighlight(() => ({ event }), ndk);
            });

            flushSync();
            expect(highlight!.source?.type).toBe("event");
            expect(highlight!.source?.value).toBe("event-id-123");
            expect(highlight!.source?.displayText).toBe("Note");
        });

        it("should prioritize a tag over e and r tags", () => {
            let highlight: ReturnType<typeof createHighlight> | undefined;

            // Use valid 64-char hex pubkey
            const validPubkey = "b".repeat(64);
            const event = new NDKEvent(ndk);
            event.kind = 9802;
            event.content = "text";
            event.tags = [
                ["a", `30023:${validPubkey}:slug`],
                ["e", "event-id"],
                ["r", "https://example.com"]
            ];

            cleanup = $effect.root(() => {
                highlight = createHighlight(() => ({ event }), ndk);
            });

            flushSync();
            expect(highlight!.source?.type).toBe("article");
        });

        it("should prioritize e tag over r tag", () => {
            let highlight: ReturnType<typeof createHighlight> | undefined;

            const event = new NDKEvent(ndk);
            event.kind = 9802;
            event.content = "text";
            event.tags = [
                ["e", "event-id"],
                ["r", "https://example.com"]
            ];

            cleanup = $effect.root(() => {
                highlight = createHighlight(() => ({ event }), ndk);
            });

            flushSync();
            expect(highlight!.source?.type).toBe("event");
        });
    });

    describe("URL metadata fetching", () => {
        it("should fetch and update URL metadata", async () => {
            let highlight: ReturnType<typeof createHighlight> | undefined;

            const event = new NDKEvent(ndk);
            event.kind = 9802;
            event.content = "text";
            event.tags = [["r", "https://example.com/page"]];

            cleanup = $effect.root(() => {
                highlight = createHighlight(() => ({ event }), ndk);
            });

            flushSync();

            // Wait for async metadata fetch
            await new Promise(resolve => setTimeout(resolve, 50));
            flushSync();

            // After metadata fetch
            expect(highlight!.loading).toBe(false);
            expect(highlight!.urlMetadata).not.toBeNull();
            expect(highlight!.urlMetadata?.siteName).toBe("example.com");
        });

        it("should update displayText with hostname when metadata is fetched", async () => {
            let highlight: ReturnType<typeof createHighlight> | undefined;

            const event = new NDKEvent(ndk);
            event.kind = 9802;
            event.content = "text";
            event.tags = [["r", "https://www.example.com/article"]];

            cleanup = $effect.root(() => {
                highlight = createHighlight(() => ({ event }), ndk);
            });

            await new Promise(resolve => setTimeout(resolve, 50));
            flushSync();

            // Should strip www. from hostname
            expect(highlight!.source?.displayText).toBe("example.com");
        });
    });

    describe("article fetching", () => {
        it("should fetch article when a tag is present", async () => {
            let highlight: ReturnType<typeof createHighlight> | undefined;

            // Use valid 64-char hex pubkey
            const validPubkey = "c".repeat(64);

            const articleEvent = new NDKEvent(ndk);
            articleEvent.kind = 30023;
            articleEvent.pubkey = validPubkey;
            articleEvent.tags = [
                ["d", "test-slug"],
                ["title", "Test Article Title"]
            ];
            articleEvent.content = "Article content";

            vi.spyOn(ndk, "fetchEvent").mockResolvedValue(articleEvent);

            const event = new NDKEvent(ndk);
            event.kind = 9802;
            event.content = "highlighted text";
            event.tags = [["a", `30023:${validPubkey}:test-slug`]];

            cleanup = $effect.root(() => {
                highlight = createHighlight(() => ({ event }), ndk);
            });

            flushSync();

            // Wait for async article fetch
            await new Promise(resolve => setTimeout(resolve, 50));
            flushSync();

            // After fetch
            expect(highlight!.loading).toBe(false);
            expect(highlight!.article).not.toBeNull();
            expect(highlight!.source?.displayText).toBe("Test Article Title");
        });

        it("should handle article fetch failure gracefully", async () => {
            let highlight: ReturnType<typeof createHighlight> | undefined;

            vi.spyOn(ndk, "fetchEvent").mockResolvedValue(null);

            const event = new NDKEvent(ndk);
            event.kind = 9802;
            event.content = "text";
            event.tags = [["a", "30023:pubkey:slug"]];

            cleanup = $effect.root(() => {
                highlight = createHighlight(() => ({ event }), ndk);
            });

            await new Promise(resolve => setTimeout(resolve, 50));
            flushSync();

            expect(highlight!.loading).toBe(false);
            expect(highlight!.article).toBeNull();
            expect(highlight!.source?.displayText).toBe("Article");
        });

        it("should handle malformed a tag", () => {
            let highlight: ReturnType<typeof createHighlight> | undefined;

            const event = new NDKEvent(ndk);
            event.kind = 9802;
            event.content = "text";
            event.tags = [["a", "malformed-tag"]];

            cleanup = $effect.root(() => {
                highlight = createHighlight(() => ({ event }), ndk);
            });

            flushSync();

            // Should not throw, just won't fetch
            expect(highlight!.source?.type).toBe("article");
            expect(highlight!.article).toBeNull();
        });
    });

    describe("state getters", () => {
        it("should provide read-only getters", () => {
            let highlight: ReturnType<typeof createHighlight> | undefined;

            const event = new NDKEvent(ndk);
            event.kind = 9802;
            event.content = "text";

            cleanup = $effect.root(() => {
                highlight = createHighlight(() => ({ event }), ndk);
            });

            expect(typeof Object.getOwnPropertyDescriptor(highlight!, 'content')?.get).toBe('function');
            expect(typeof Object.getOwnPropertyDescriptor(highlight!, 'context')?.get).toBe('function');
            expect(typeof Object.getOwnPropertyDescriptor(highlight!, 'position')?.get).toBe('function');
            expect(typeof Object.getOwnPropertyDescriptor(highlight!, 'source')?.get).toBe('function');
            expect(typeof Object.getOwnPropertyDescriptor(highlight!, 'article')?.get).toBe('function');
            expect(typeof Object.getOwnPropertyDescriptor(highlight!, 'urlMetadata')?.get).toBe('function');
            expect(typeof Object.getOwnPropertyDescriptor(highlight!, 'loading')?.get).toBe('function');
        });
    });
});
