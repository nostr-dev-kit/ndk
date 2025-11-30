import { NDKArticle, NDKEvent, NDKKind, NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";
import { flushSync } from "svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createFetchEvents } from "./event.svelte.js";
import { createNDK, type NDKSvelte } from "./ndk-svelte.svelte.js";

describe("Event Fetching", () => {
    let ndk: NDKSvelte;
    let signer: NDKPrivateKeySigner;
    let cleanup: (() => void) | undefined;

    beforeEach(() => {
        ndk = createNDK({
            explicitRelayUrls: ["wss://relay.test"],
        });
        signer = NDKPrivateKeySigner.generate();
    });

    afterEach(() => {
        cleanup?.();
        cleanup = undefined;
    });

    describe("createFetchEvents", () => {
        it("should throw TypeError when passed non-function", () => {
            expect(() => {
                createFetchEvents(ndk, () => ({ kinds: [1] }));
            }).toThrow(TypeError);
            expect(() => {
                createFetchEvents(ndk, () => ({ kinds: [1] }));
            }).toThrow("$fetchEvents expects config to be a function");
        });

        it("should throw TypeError when passed array directly", () => {
            expect(() => {
                createFetchEvents(ndk, () => [{ kinds: [1] }]);
            }).toThrow(TypeError);
            expect(() => {
                createFetchEvents(ndk, () => [{ kinds: [1] }]);
            }).toThrow("$fetchEvents expects config to be a function");
        });

        it("should return empty array when callback returns undefined", () => {
            let events: any;
            cleanup = $effect.root(() => {
                events = createFetchEvents(ndk, () => undefined);
            });

            expect(events).toEqual([]);
        });

        it("should fetch events by single filter", async () => {
            const event1 = new NDKEvent(ndk);
            event1.kind = NDKKind.Text;
            event1.content = "First note";
            await event1.sign(signer);

            const event2 = new NDKEvent(ndk);
            event2.kind = NDKKind.Text;
            event2.content = "Second note";
            await event2.sign(signer);

            const eventSet = new Set([event1, event2]);
            vi.spyOn(ndk, "fetchEvents").mockResolvedValue(eventSet);

            const filter = { kinds: [1], limit: 10 };
            let events: any;
            cleanup = $effect.root(() => {
                events = createFetchEvents(ndk, () => filter);
            });

            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(ndk.fetchEvents).toHaveBeenCalledWith([filter], {});
            expect(events).toHaveLength(2);
            expect(events[0].content).toBe("First note");
            expect(events[1].content).toBe("Second note");
        });

        it("should fetch events by multiple filters", async () => {
            const event1 = new NDKEvent(ndk);
            event1.kind = NDKKind.Text;
            event1.content = "Note from author 1";
            await event1.sign(signer);

            const event2 = new NDKEvent(ndk);
            event2.kind = NDKKind.Text;
            event2.content = "Note from author 2";
            await event2.sign(signer);

            const eventSet = new Set([event1, event2]);
            vi.spyOn(ndk, "fetchEvents").mockResolvedValue(eventSet);

            const filters = [
                { kinds: [1], authors: ["author1"], limit: 10 },
                { kinds: [1], authors: ["author2"], limit: 10 },
            ];
            let events: any;
            cleanup = $effect.root(() => {
                events = createFetchEvents(ndk, () => filters);
            });

            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(ndk.fetchEvents).toHaveBeenCalledWith(filters, {});
            expect(events).toHaveLength(2);
        });

        it("should handle fetch errors gracefully", async () => {
            vi.spyOn(ndk, "fetchEvents").mockRejectedValue(new Error("Network error"));

            let events: any;
            cleanup = $effect.root(() => {
                events = createFetchEvents(ndk, () => ({ kinds: [1] }));
            });

            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(events).toEqual([]);
        });

        it("should refetch when filters change", async () => {
            const event1 = new NDKEvent(ndk);
            event1.kind = NDKKind.Text;
            event1.content = "First batch";
            await event1.sign(signer);

            const event2 = new NDKEvent(ndk);
            event2.kind = NDKKind.Text;
            event2.content = "Second batch";
            await event2.sign(signer);

            const fetchSpy = vi
                .spyOn(ndk, "fetchEvents")
                .mockResolvedValueOnce(new Set([event1]))
                .mockResolvedValueOnce(new Set([event2]));

            let events: any;
            let author = $state("author1");
            cleanup = $effect.root(() => {
                events = createFetchEvents(ndk, () => ({
                    kinds: [1],
                    authors: [author],
                    limit: 10,
                }));
            });

            await new Promise((resolve) => setTimeout(resolve, 10));
            expect(events).toHaveLength(1);
            expect(events[0].content).toBe("First batch");

            // Change the filter
            author = "author2";
            flushSync();
            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(fetchSpy).toHaveBeenCalledTimes(2);
            expect(events).toHaveLength(1);
            expect(events[0].content).toBe("Second batch");
        });

        it("should clear events when filters become undefined", async () => {
            const event1 = new NDKEvent(ndk);
            event1.kind = NDKKind.Text;
            event1.content = "Test note";
            await event1.sign(signer);

            vi.spyOn(ndk, "fetchEvents").mockResolvedValue(new Set([event1]));

            let events: any;
            let filter = $state<any>({ kinds: [1] });
            cleanup = $effect.root(() => {
                events = createFetchEvents(ndk, () => filter);
            });

            await new Promise((resolve) => setTimeout(resolve, 10));
            expect(events).toHaveLength(1);

            // Set to undefined
            filter = undefined;
            flushSync();
            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(events).toEqual([]);
        });
    });

    describe("NDKSvelte.$fetchEvents", () => {
        it("should be accessible via ndk instance", async () => {
            const event1 = new NDKEvent(ndk);
            event1.kind = NDKKind.Text;
            event1.content = "Test 1";
            await event1.sign(signer);

            const event2 = new NDKEvent(ndk);
            event2.kind = NDKKind.Text;
            event2.content = "Test 2";
            await event2.sign(signer);

            vi.spyOn(ndk, "fetchEvents").mockResolvedValue(new Set([event1, event2]));

            let events: any;
            cleanup = $effect.root(() => {
                events = ndk.$fetchEvents(() => ({ kinds: [1] }));
            });

            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(events).toHaveLength(2);
        });

        it("should automatically wrap events (NDKArticle[])", async () => {
            const article1 = new NDKEvent(ndk);
            article1.kind = NDKKind.Article;
            article1.content = "Article 1";
            article1.tags = [
                ["title", "First Article"],
                ["d", "first"],
            ];
            await article1.sign(signer);

            const article2 = new NDKEvent(ndk);
            article2.kind = NDKKind.Article;
            article2.content = "Article 2";
            article2.tags = [
                ["title", "Second Article"],
                ["d", "second"],
            ];
            await article2.sign(signer);

            const wrappedArticles = new Set([
                NDKArticle.from(article1),
                NDKArticle.from(article2),
            ]);

            vi.spyOn(ndk, "fetchEvents").mockResolvedValue(wrappedArticles);

            let articles: any;
            cleanup = $effect.root(() => {
                articles = ndk.$fetchEvents<NDKArticle>(() => ({ kinds: [NDKKind.Article] }));
            });

            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(articles).toHaveLength(2);
            expect(articles[0].title).toBe("First Article");
            expect(articles[1].title).toBe("Second Article");
            expect(ndk.fetchEvents).toHaveBeenCalledWith([{ kinds: [NDKKind.Article] }], {});
        });

        it("should pass filters wrapped in array", async () => {
            const testEvent = new NDKEvent(ndk);
            testEvent.kind = NDKKind.Text;
            testEvent.content = "Test";
            await testEvent.sign(signer);

            const fetchSpy = vi.spyOn(ndk, "fetchEvents").mockResolvedValue(new Set([testEvent]));

            cleanup = $effect.root(() => {
                ndk.$fetchEvents(() => ({ kinds: [1] }));
            });

            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(fetchSpy).toHaveBeenCalledWith([{ kinds: [1] }], {});
        });
    });
});
