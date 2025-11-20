import { NDKEvent, NDKRelayFeedList } from "@nostr-dev-kit/ndk";
import { flushSync } from "svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createTestNDK } from "../../../../test-utils";
import { createBookmarkedRelayList } from "./bookmarks.svelte";

describe("createBookmarkedRelayList", () => {
    let ndk: ReturnType<typeof createTestNDK>;
    let cleanup: (() => void) | undefined;
    let mockSub: { events: NDKEvent[] };

    // Helper to create NDKRelayFeedList-like event with relayUrls getter
    function createRelayFeedListEvent(pubkey: string, relayUrls: string[]): NDKEvent {
        const event = new NDKEvent(ndk);
        event.kind = 10012;
        event.pubkey = pubkey;
        event.tags = relayUrls.map(url => ["relay", url]);

        // Mock relayUrls getter to simulate NDKRelayFeedList behavior
        Object.defineProperty(event, 'relayUrls', {
            get: () => relayUrls
        });

        return event;
    }

    beforeEach(() => {
        ndk = createTestNDK();
        mockSub = { events: [] };
        vi.spyOn(ndk, "$subscribe").mockReturnValue(mockSub as any);
    });

    afterEach(() => {
        cleanup?.();
        cleanup = undefined;
    });

    describe("initialization", () => {
        it("should initialize with empty state when no authors", () => {
            let bookmarks: ReturnType<typeof createBookmarkedRelayList> | undefined;

            cleanup = $effect.root(() => {
                bookmarks = createBookmarkedRelayList(() => ({ authors: [] }), ndk);
            });

            flushSync();

            expect(bookmarks!.relays).toEqual([]);
            expect(bookmarks!.totalAuthors).toBe(0);
            expect(bookmarks!.eventsCount).toBe(0);
        });

        it("should include current user by default", () => {
            let bookmarks: ReturnType<typeof createBookmarkedRelayList> | undefined;

            const currentPubkey = "a".repeat(64);
            vi.spyOn(ndk, "$currentPubkey", "get").mockReturnValue(currentPubkey);

            cleanup = $effect.root(() => {
                bookmarks = createBookmarkedRelayList(() => ({ authors: ["b".repeat(64)] }), ndk);
            });

            flushSync();

            expect(bookmarks!.includesCurrentUser).toBe(true);
            expect(bookmarks!.totalAuthors).toBe(2); // Original author + current user
        });

        it("should exclude current user when includeCurrentUser is false", () => {
            let bookmarks: ReturnType<typeof createBookmarkedRelayList> | undefined;

            const currentPubkey = "a".repeat(64);
            vi.spyOn(ndk, "$currentPubkey", "get").mockReturnValue(currentPubkey);

            cleanup = $effect.root(() => {
                bookmarks = createBookmarkedRelayList(
                    () => ({ authors: ["b".repeat(64)], includeCurrentUser: false }),
                    ndk
                );
            });

            flushSync();

            expect(bookmarks!.includesCurrentUser).toBe(false);
            expect(bookmarks!.totalAuthors).toBe(1); // Only original author
        });

        it("should not duplicate current user if already in authors list", () => {
            let bookmarks: ReturnType<typeof createBookmarkedRelayList> | undefined;

            const currentPubkey = "a".repeat(64);
            vi.spyOn(ndk, "$currentPubkey", "get").mockReturnValue(currentPubkey);

            cleanup = $effect.root(() => {
                bookmarks = createBookmarkedRelayList(() => ({ authors: [currentPubkey] }), ndk);
            });

            flushSync();

            expect(bookmarks!.totalAuthors).toBe(1); // Not duplicated
        });
    });

    describe("relay aggregation", () => {
        it("should aggregate relays from single author", () => {
            let bookmarks: ReturnType<typeof createBookmarkedRelayList> | undefined;

            const authorPubkey = "a".repeat(64);
            const event = createRelayFeedListEvent(authorPubkey, [
                "wss://relay1.com/",
                "wss://relay2.com/"
            ]);

            cleanup = $effect.root(() => {
                bookmarks = createBookmarkedRelayList(
                    () => ({ authors: [authorPubkey], includeCurrentUser: false }),
                    ndk
                );
            });

            flushSync();
            mockSub.events.push(event);
            flushSync();

            expect(bookmarks!.relays).toHaveLength(2);
            expect(bookmarks!.relays[0].count).toBe(1);
            expect(bookmarks!.relays[0].pubkeys).toEqual([authorPubkey]);
        });

        it("should aggregate relays from multiple authors", () => {
            let bookmarks: ReturnType<typeof createBookmarkedRelayList> | undefined;

            const author1 = "a".repeat(64);
            const author2 = "b".repeat(64);

            const event1 = createRelayFeedListEvent(author1, ["wss://relay1.com/"]);
            const event2 = createRelayFeedListEvent(author2, ["wss://relay1.com/"]);

            cleanup = $effect.root(() => {
                bookmarks = createBookmarkedRelayList(
                    () => ({ authors: [author1, author2], includeCurrentUser: false }),
                    ndk
                );
            });

            flushSync();
            mockSub.events.push(event1, event2);
            flushSync();

            expect(bookmarks!.relays).toHaveLength(1);
            expect(bookmarks!.relays[0].count).toBe(2); // Both authors bookmark it
            expect(bookmarks!.relays[0].pubkeys).toHaveLength(2);
            expect(bookmarks!.relays[0].pubkeys).toContain(author1);
            expect(bookmarks!.relays[0].pubkeys).toContain(author2);
        });

        it("should normalize relay URLs", () => {
            let bookmarks: ReturnType<typeof createBookmarkedRelayList> | undefined;

            const author1 = "a".repeat(64);
            const author2 = "b".repeat(64);

            // Two authors bookmarking the same relay with different URL formats
            const event1 = createRelayFeedListEvent(author1, ["wss://relay1.com"]);
            const event2 = createRelayFeedListEvent(author2, ["wss://relay1.com/"]);

            cleanup = $effect.root(() => {
                bookmarks = createBookmarkedRelayList(
                    () => ({ authors: [author1, author2], includeCurrentUser: false }),
                    ndk
                );
            });

            flushSync();
            mockSub.events.push(event1, event2);
            flushSync();

            // Should normalize to single relay with 2 authors
            expect(bookmarks!.relays).toHaveLength(1);
            expect(bookmarks!.relays[0].count).toBe(2); // Both authors
            expect(bookmarks!.relays[0].pubkeys).toHaveLength(2);
        });

        it("should sort relays by count (descending)", () => {
            let bookmarks: ReturnType<typeof createBookmarkedRelayList> | undefined;

            const author1 = "a".repeat(64);
            const author2 = "b".repeat(64);

            const event1 = createRelayFeedListEvent(author1, [
                "wss://popular.com/",
                "wss://unpopular.com/"
            ]);
            const event2 = createRelayFeedListEvent(author2, ["wss://popular.com/"]);

            cleanup = $effect.root(() => {
                bookmarks = createBookmarkedRelayList(
                    () => ({ authors: [author1, author2], includeCurrentUser: false }),
                    ndk
                );
            });

            flushSync();
            mockSub.events.push(event1, event2);
            flushSync();

            expect(bookmarks!.relays).toHaveLength(2);
            expect(bookmarks!.relays[0].url).toContain("popular.com");
            expect(bookmarks!.relays[0].count).toBe(2);
            expect(bookmarks!.relays[1].url).toContain("unpopular.com");
            expect(bookmarks!.relays[1].count).toBe(1);
        });
    });

    describe("current user bookmark status", () => {
        it("should set isBookmarkedByCurrentUser correctly", () => {
            let bookmarks: ReturnType<typeof createBookmarkedRelayList> | undefined;

            const currentPubkey = "a".repeat(64);
            vi.spyOn(ndk, "$currentPubkey", "get").mockReturnValue(currentPubkey);
            vi.spyOn(ndk, "$currentUser", "get").mockReturnValue({ pubkey: currentPubkey } as any);

            const event = createRelayFeedListEvent(currentPubkey, ["wss://mybookmark.com/"]);

            cleanup = $effect.root(() => {
                bookmarks = createBookmarkedRelayList(
                    () => ({ authors: [currentPubkey] }),
                    ndk
                );
            });

            flushSync();
            mockSub.events.push(event);
            flushSync();

            expect(bookmarks!.relays[0].isBookmarkedByCurrentUser).toBe(true);
        });

        it("should set isBookmarkedByCurrentUser to false when not bookmarked", () => {
            let bookmarks: ReturnType<typeof createBookmarkedRelayList> | undefined;

            const currentPubkey = "a".repeat(64);
            const otherPubkey = "b".repeat(64);

            vi.spyOn(ndk, "$currentPubkey", "get").mockReturnValue(currentPubkey);
            vi.spyOn(ndk, "$currentUser", "get").mockReturnValue({ pubkey: currentPubkey } as any);

            const event = createRelayFeedListEvent(otherPubkey, ["wss://otherbookmark.com/"]);

            cleanup = $effect.root(() => {
                bookmarks = createBookmarkedRelayList(
                    () => ({ authors: [currentPubkey, otherPubkey] }),
                    ndk
                );
            });

            flushSync();
            mockSub.events.push(event);
            flushSync();

            expect(bookmarks!.relays[0].isBookmarkedByCurrentUser).toBe(false);
        });
    });

    describe("isBookmarked function", () => {
        it("should return true when relay is bookmarked by current user", () => {
            let bookmarks: ReturnType<typeof createBookmarkedRelayList> | undefined;

            const currentPubkey = "a".repeat(64);
            vi.spyOn(ndk, "$currentPubkey", "get").mockReturnValue(currentPubkey);
            vi.spyOn(ndk, "$currentUser", "get").mockReturnValue({ pubkey: currentPubkey } as any);

            const event = createRelayFeedListEvent(currentPubkey, ["wss://mybookmark.com/"]);

            cleanup = $effect.root(() => {
                bookmarks = createBookmarkedRelayList(
                    () => ({ authors: [currentPubkey] }),
                    ndk
                );
            });

            flushSync();
            mockSub.events.push(event);
            flushSync();

            expect(bookmarks!.isBookmarked("wss://mybookmark.com")).toBe(true);
        });

        it("should return false when relay is not bookmarked by current user", () => {
            let bookmarks: ReturnType<typeof createBookmarkedRelayList> | undefined;

            const currentPubkey = "a".repeat(64);
            vi.spyOn(ndk, "$currentPubkey", "get").mockReturnValue(currentPubkey);
            vi.spyOn(ndk, "$currentUser", "get").mockReturnValue({ pubkey: currentPubkey } as any);

            cleanup = $effect.root(() => {
                bookmarks = createBookmarkedRelayList(
                    () => ({ authors: [currentPubkey] }),
                    ndk
                );
            });

            flushSync();

            expect(bookmarks!.isBookmarked("wss://notbookmarked.com")).toBe(false);
        });

        it("should normalize URL when checking bookmark status", () => {
            let bookmarks: ReturnType<typeof createBookmarkedRelayList> | undefined;

            const currentPubkey = "a".repeat(64);
            vi.spyOn(ndk, "$currentPubkey", "get").mockReturnValue(currentPubkey);
            vi.spyOn(ndk, "$currentUser", "get").mockReturnValue({ pubkey: currentPubkey } as any);

            const event = createRelayFeedListEvent(currentPubkey, ["wss://mybookmark.com/"]);

            cleanup = $effect.root(() => {
                bookmarks = createBookmarkedRelayList(
                    () => ({ authors: [currentPubkey] }),
                    ndk
                );
            });

            flushSync();
            mockSub.events.push(event);
            flushSync();

            // Should work without trailing slash
            expect(bookmarks!.isBookmarked("wss://mybookmark.com")).toBe(true);
        });
    });

    describe("getRelayStats function", () => {
        it("should return stats for existing relay", () => {
            let bookmarks: ReturnType<typeof createBookmarkedRelayList> | undefined;

            const author1 = "a".repeat(64);
            const author2 = "b".repeat(64);

            const event1 = createRelayFeedListEvent(author1, ["wss://relay.com/"]);
            const event2 = createRelayFeedListEvent(author2, ["wss://relay.com/"]);

            cleanup = $effect.root(() => {
                bookmarks = createBookmarkedRelayList(
                    () => ({ authors: [author1, author2], includeCurrentUser: false }),
                    ndk
                );
            });

            flushSync();
            mockSub.events.push(event1, event2);
            flushSync();

            const stats = bookmarks!.getRelayStats("wss://relay.com");
            expect(stats).not.toBeNull();
            expect(stats!.count).toBe(2);
            expect(stats!.pubkeys).toHaveLength(2);
        });

        it("should return null for non-existent relay", () => {
            let bookmarks: ReturnType<typeof createBookmarkedRelayList> | undefined;

            cleanup = $effect.root(() => {
                bookmarks = createBookmarkedRelayList(
                    () => ({ authors: ["a".repeat(64)], includeCurrentUser: false }),
                    ndk
                );
            });

            flushSync();

            const stats = bookmarks!.getRelayStats("wss://nonexistent.com");
            expect(stats).toBeNull();
        });

        it("should normalize URL when getting stats", () => {
            let bookmarks: ReturnType<typeof createBookmarkedRelayList> | undefined;

            const authorPubkey = "a".repeat(64);
            const event = createRelayFeedListEvent(authorPubkey, ["wss://relay.com/"]);

            cleanup = $effect.root(() => {
                bookmarks = createBookmarkedRelayList(
                    () => ({ authors: [authorPubkey], includeCurrentUser: false }),
                    ndk
                );
            });

            flushSync();
            mockSub.events.push(event);
            flushSync();

            // Should work without trailing slash
            const stats = bookmarks!.getRelayStats("wss://relay.com");
            expect(stats).not.toBeNull();
            expect(stats!.count).toBe(1);
        });
    });

    describe("toggleBookmark function", () => {
        it("should throw error when current user not included", async () => {
            let bookmarks: ReturnType<typeof createBookmarkedRelayList> | undefined;

            cleanup = $effect.root(() => {
                bookmarks = createBookmarkedRelayList(
                    () => ({ authors: ["a".repeat(64)], includeCurrentUser: false }),
                    ndk
                );
            });

            flushSync();

            await expect(bookmarks!.toggleBookmark("wss://relay.com")).rejects.toThrow(
                "Cannot toggle bookmark: current user not in authors list"
            );
        });

        it("should add bookmark when not currently bookmarked", async () => {
            let bookmarks: ReturnType<typeof createBookmarkedRelayList> | undefined;

            const currentPubkey = "a".repeat(64);
            vi.spyOn(ndk, "$currentPubkey", "get").mockReturnValue(currentPubkey);
            vi.spyOn(ndk, "$currentUser", "get").mockReturnValue({ pubkey: currentPubkey } as any);

            let publishedList: any = null;
            vi.spyOn(NDKRelayFeedList.prototype, "publish").mockImplementation(async function(this: NDKRelayFeedList) {
                publishedList = this;
                return new Set();
            });

            cleanup = $effect.root(() => {
                bookmarks = createBookmarkedRelayList(
                    () => ({ authors: [currentPubkey] }),
                    ndk
                );
            });

            flushSync();

            await bookmarks!.toggleBookmark("wss://newrelay.com/");

            expect(publishedList).not.toBeNull();
            expect(publishedList.kind).toBe(10012);
            expect(publishedList.tags).toContainEqual(["relay", "wss://newrelay.com/"]);
        });

        it("should remove bookmark when currently bookmarked", async () => {
            let bookmarks: ReturnType<typeof createBookmarkedRelayList> | undefined;

            const currentPubkey = "a".repeat(64);
            vi.spyOn(ndk, "$currentPubkey", "get").mockReturnValue(currentPubkey);
            vi.spyOn(ndk, "$currentUser", "get").mockReturnValue({ pubkey: currentPubkey } as any);

            const event = createRelayFeedListEvent(currentPubkey, [
                "wss://keeprelay.com/",
                "wss://removerelay.com/"
            ]);

            let publishedList: any = null;
            vi.spyOn(NDKRelayFeedList.prototype, "publish").mockImplementation(async function(this: NDKRelayFeedList) {
                publishedList = this;
                return new Set();
            });

            cleanup = $effect.root(() => {
                bookmarks = createBookmarkedRelayList(
                    () => ({ authors: [currentPubkey] }),
                    ndk
                );
            });

            flushSync();
            mockSub.events.push(event);
            flushSync();

            await bookmarks!.toggleBookmark("wss://removerelay.com/");

            expect(publishedList).not.toBeNull();
            expect(publishedList.tags).toContainEqual(["relay", "wss://keeprelay.com/"]);
            expect(publishedList.tags).not.toContainEqual(["relay", "wss://removerelay.com/"]);
        });
    });

    describe("state getters", () => {
        it("should provide read-only getters", () => {
            let bookmarks: ReturnType<typeof createBookmarkedRelayList> | undefined;

            cleanup = $effect.root(() => {
                bookmarks = createBookmarkedRelayList(
                    () => ({ authors: [] }),
                    ndk
                );
            });

            flushSync();

            expect(typeof Object.getOwnPropertyDescriptor(bookmarks!, 'relays')?.get).toBe('function');
            expect(typeof Object.getOwnPropertyDescriptor(bookmarks!, 'totalAuthors')?.get).toBe('function');
            expect(typeof Object.getOwnPropertyDescriptor(bookmarks!, 'eventsCount')?.get).toBe('function');
            expect(typeof Object.getOwnPropertyDescriptor(bookmarks!, 'includesCurrentUser')?.get).toBe('function');
        });
    });
});
