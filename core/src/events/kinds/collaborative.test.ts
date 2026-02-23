import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { NDK } from "../../ndk/index.js";
import { NDKEvent } from "../index.js";
import { NDKCollaborativeEvent } from "./collaborative.js";
import { NDKKind } from "./index.js";
import { NDKArticle } from "./article.js";

// Valid 64-char hex pubkeys for testing
const ALICE_PUBKEY = "a".repeat(64);
const BOB_PUBKEY = "b".repeat(64);
const CREATOR_PUBKEY = "c".repeat(64);
const TEST_PUBKEY = "1".repeat(64);

describe("NDKCollaborativeEvent", () => {
    let ndk: NDK;

    beforeEach(() => {
        ndk = new NDK();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("Kind Handling", () => {
        it("should default to NDKKind.CollaborativeEvent (39382)", () => {
            const collab = new NDKCollaborativeEvent(ndk);
            expect(collab.kind).toBe(NDKKind.CollaborativeEvent);
            expect(collab.kind).toBe(39382);
        });

        it("should accept the static kinds array containing CollaborativeEvent", () => {
            expect(NDKCollaborativeEvent.kinds).toContain(NDKKind.CollaborativeEvent);
        });
    });

    describe("Authors Management", () => {
        it("should start with an empty authors list", () => {
            const collab = new NDKCollaborativeEvent(ndk);
            expect(collab.authors).toEqual([]);
            expect(collab.authorPubkeys).toEqual([]);
        });

        it("should allow adding authors", () => {
            const collab = new NDKCollaborativeEvent(ndk);
            const alice = ndk.getUser({ pubkey: ALICE_PUBKEY });
            const bob = ndk.getUser({ pubkey: BOB_PUBKEY });

            collab.authors.push(alice);
            collab.authors.push(bob);

            expect(collab.authors).toHaveLength(2);
            expect(collab.authorPubkeys).toEqual([ALICE_PUBKEY, BOB_PUBKEY]);
        });

        it("should allow setting authors array directly", () => {
            const collab = new NDKCollaborativeEvent(ndk);
            const alice = ndk.getUser({ pubkey: ALICE_PUBKEY });
            const bob = ndk.getUser({ pubkey: BOB_PUBKEY });

            collab.authors = [alice, bob];

            expect(collab.authors).toHaveLength(2);
            expect(collab.authorPubkeys).toEqual([ALICE_PUBKEY, BOB_PUBKEY]);
        });

        it("should parse p-tags from existing event into authors", () => {
            const rawEvent = {
                kind: NDKKind.CollaborativeEvent,
                content: "",
                tags: [
                    ["d", "test-dtag"],
                    ["k", "30023"],
                    ["p", ALICE_PUBKEY],
                    ["p", BOB_PUBKEY],
                ],
                pubkey: CREATOR_PUBKEY,
                created_at: 1234567890,
            };

            const collab = new NDKCollaborativeEvent(ndk, rawEvent);

            expect(collab.authors).toHaveLength(2);
            expect(collab.authorPubkeys).toEqual([ALICE_PUBKEY, BOB_PUBKEY]);
        });
    });

    describe("Target Kind", () => {
        it("should return undefined when no k-tag is set", () => {
            const collab = new NDKCollaborativeEvent(ndk);
            expect(collab.targetKind).toBeUndefined();
        });

        it("should get/set the target kind", () => {
            const collab = new NDKCollaborativeEvent(ndk);
            collab.targetKind = NDKKind.Article;
            expect(collab.targetKind).toBe(NDKKind.Article);
            expect(collab.tagValue("k")).toBe("30023");
        });

        it("should remove the k-tag when set to undefined", () => {
            const collab = new NDKCollaborativeEvent(ndk);
            collab.targetKind = NDKKind.Article;
            expect(collab.tagValue("k")).toBe("30023");

            collab.targetKind = undefined;
            expect(collab.tagValue("k")).toBeUndefined();
        });
    });

    describe("save()", () => {
        it("should set the d-tag to match the target event's d-tag", () => {
            const collab = new NDKCollaborativeEvent(ndk);
            const article = new NDKArticle(ndk);
            article.dTag = "my-article-slug";

            collab.save(article);

            expect(collab.dTag).toBe("my-article-slug");
        });

        it("should set the k-tag to the target event's kind", () => {
            const collab = new NDKCollaborativeEvent(ndk);
            const article = new NDKArticle(ndk);
            article.dTag = "my-article-slug";

            collab.save(article);

            expect(collab.targetKind).toBe(NDKKind.Article);
        });

        it("should throw error if target event has no d-tag", () => {
            const collab = new NDKCollaborativeEvent(ndk);
            const event = new NDKEvent(ndk);
            event.kind = NDKKind.Article;

            expect(() => collab.save(event)).toThrow("Target event must have a d-tag for collaborative events");
        });

        it("should add the target event author to authors if not present", () => {
            const collab = new NDKCollaborativeEvent(ndk);
            const article = new NDKArticle(ndk);
            article.dTag = "my-article-slug";
            article.pubkey = CREATOR_PUBKEY;

            collab.save(article);

            expect(collab.authorPubkeys).toContain(CREATOR_PUBKEY);
        });

        it("should not duplicate author if already present", () => {
            const collab = new NDKCollaborativeEvent(ndk);
            const alice = ndk.getUser({ pubkey: ALICE_PUBKEY });
            collab.authors.push(alice);

            const article = new NDKArticle(ndk);
            article.dTag = "my-article-slug";
            article.pubkey = ALICE_PUBKEY;

            collab.save(article);

            expect(collab.authorPubkeys.filter((p) => p === ALICE_PUBKEY)).toHaveLength(1);
        });
    });

    describe("from()", () => {
        it("should create NDKCollaborativeEvent from NDKEvent", () => {
            const rawEvent = new NDKEvent(ndk, {
                kind: NDKKind.CollaborativeEvent,
                content: "",
                tags: [
                    ["d", "test-dtag"],
                    ["k", "30023"],
                    ["p", ALICE_PUBKEY],
                ],
                pubkey: CREATOR_PUBKEY,
                created_at: 1234567890,
            });

            const collab = NDKCollaborativeEvent.from(rawEvent);

            expect(collab).toBeInstanceOf(NDKCollaborativeEvent);
            expect(collab.dTag).toBe("test-dtag");
            expect(collab.targetKind).toBe(30023);
            expect(collab.authorPubkeys).toContain(ALICE_PUBKEY);
        });
    });

    describe("start() and stop()", () => {
        it("should throw error if no NDK instance", () => {
            const collab = new NDKCollaborativeEvent(undefined);
            collab.dTag = "test";
            collab.targetKind = NDKKind.Article;
            collab.authors = [{ pubkey: TEST_PUBKEY } as any];

            expect(() => collab.start()).toThrow("NDK instance is required");
        });

        it("should throw error if no authors", () => {
            const collab = new NDKCollaborativeEvent(ndk);
            collab.dTag = "test";
            collab.targetKind = NDKKind.Article;

            expect(() => collab.start()).toThrow("No authors defined");
        });

        it("should throw error if no d-tag", () => {
            const collab = new NDKCollaborativeEvent(ndk);
            collab.targetKind = NDKKind.Article;
            collab.authors = [ndk.getUser({ pubkey: TEST_PUBKEY })];

            expect(() => collab.start()).toThrow("No d-tag defined");
        });

        it("should throw error if no target kind", () => {
            const collab = new NDKCollaborativeEvent(ndk);
            collab.dTag = "test";
            collab.authors = [ndk.getUser({ pubkey: TEST_PUBKEY })];

            expect(() => collab.start()).toThrow("No target kind defined");
        });

        it("should start subscription with correct filter", () => {
            const collab = new NDKCollaborativeEvent(ndk);
            collab.dTag = "test-dtag";
            collab.targetKind = NDKKind.Article;
            const alice = ndk.getUser({ pubkey: ALICE_PUBKEY });
            collab.authors = [alice];

            const subscribeMock = vi.spyOn(ndk, "subscribe");

            collab.start();

            expect(subscribeMock).toHaveBeenCalledWith(
                {
                    kinds: [NDKKind.Article],
                    authors: [ALICE_PUBKEY],
                    "#d": ["test-dtag"],
                },
                expect.objectContaining({
                    closeOnEose: false,
                })
            );

            collab.stop();
        });

        it("should not start if already running", () => {
            // Create a fresh NDK instance for this test to isolate mocking
            const testNdk = new NDK();
            const collab = new NDKCollaborativeEvent(testNdk);
            collab.dTag = "test-dtag";
            collab.targetKind = NDKKind.Article;
            collab.authors = [testNdk.getUser({ pubkey: ALICE_PUBKEY })];

            collab.start();
            expect(collab.isRunning).toBe(true);

            const subscribeMock = vi.spyOn(testNdk, "subscribe");
            collab.start(); // Second call should be ignored

            expect(subscribeMock).toHaveBeenCalledTimes(0);

            collab.stop();
        });

        it("should report isRunning correctly", () => {
            const collab = new NDKCollaborativeEvent(ndk);
            collab.dTag = "test-dtag";
            collab.targetKind = NDKKind.Article;
            collab.authors = [ndk.getUser({ pubkey: ALICE_PUBKEY })];

            expect(collab.isRunning).toBe(false);

            collab.start();
            expect(collab.isRunning).toBe(true);

            collab.stop();
            expect(collab.isRunning).toBe(false);
        });
    });

    describe("onUpdate() and offUpdate()", () => {
        it("should register update callbacks", () => {
            const collab = new NDKCollaborativeEvent(ndk);
            collab.dTag = "test-dtag";
            collab.targetKind = NDKKind.Article;
            collab.authors = [ndk.getUser({ pubkey: ALICE_PUBKEY })];

            const callback = vi.fn();
            collab.onUpdate(callback);

            collab.start();

            // Simulate an event coming in
            const mockEvent = new NDKEvent(ndk, {
                kind: NDKKind.Article,
                content: "Test content",
                pubkey: ALICE_PUBKEY,
                created_at: 1234567890,
                tags: [["d", "test-dtag"]],
            });

            // Access the internal subscription and trigger the event
            // @ts-expect-error Accessing private property for testing
            collab._handleIncomingEvent(mockEvent);

            expect(callback).toHaveBeenCalledWith(mockEvent);

            collab.stop();
        });

        it("should remove update callbacks with offUpdate", () => {
            const collab = new NDKCollaborativeEvent(ndk);
            collab.dTag = "test-dtag";
            collab.targetKind = NDKKind.Article;
            collab.authors = [ndk.getUser({ pubkey: ALICE_PUBKEY })];

            const callback = vi.fn();
            collab.onUpdate(callback);
            collab.offUpdate(callback);

            collab.start();

            const mockEvent = new NDKEvent(ndk, {
                kind: NDKKind.Article,
                content: "Test content",
                pubkey: ALICE_PUBKEY,
                created_at: 1234567890,
                tags: [["d", "test-dtag"]],
            });

            // @ts-expect-error Accessing private property for testing
            collab._handleIncomingEvent(mockEvent);

            expect(callback).not.toHaveBeenCalled();

            collab.stop();
        });

        it("should clear callbacks on stop", () => {
            const collab = new NDKCollaborativeEvent(ndk);
            collab.dTag = "test-dtag";
            collab.targetKind = NDKKind.Article;
            collab.authors = [ndk.getUser({ pubkey: ALICE_PUBKEY })];

            const callback = vi.fn();
            collab.onUpdate(callback);

            collab.start();
            collab.stop();

            // After stop, trying to call _handleIncomingEvent should not trigger callback
            const mockEvent = new NDKEvent(ndk, {
                kind: NDKKind.Article,
                content: "Test content",
                pubkey: ALICE_PUBKEY,
                created_at: 1234567890,
                tags: [["d", "test-dtag"]],
            });

            // @ts-expect-error Accessing private property for testing
            collab._handleIncomingEvent(mockEvent);

            expect(callback).not.toHaveBeenCalled();
        });
    });

    describe("currentVersion property (best version)", () => {
        it("should return undefined initially", () => {
            const collab = new NDKCollaborativeEvent(ndk);
            expect(collab.currentVersion).toBeUndefined();
        });

        it("should track the best (newest) event", () => {
            const collab = new NDKCollaborativeEvent(ndk);
            collab.dTag = "test-dtag";
            collab.targetKind = NDKKind.Article;
            collab.authors = [ndk.getUser({ pubkey: ALICE_PUBKEY })];

            const olderEvent = new NDKEvent(ndk, {
                kind: NDKKind.Article,
                content: "Old content",
                pubkey: ALICE_PUBKEY,
                created_at: 1000,
                tags: [["d", "test-dtag"]],
            });

            const newerEvent = new NDKEvent(ndk, {
                kind: NDKKind.Article,
                content: "New content",
                pubkey: ALICE_PUBKEY,
                created_at: 2000,
                tags: [["d", "test-dtag"]],
            });

            collab.start();

            // @ts-expect-error Accessing private property for testing
            collab._handleIncomingEvent(olderEvent);
            expect(collab.currentVersion?.created_at).toBe(1000);

            // @ts-expect-error Accessing private property for testing
            collab._handleIncomingEvent(newerEvent);
            expect(collab.currentVersion?.created_at).toBe(2000);

            // Older event should not replace newer event
            // @ts-expect-error Accessing private property for testing
            collab._handleIncomingEvent(olderEvent);
            expect(collab.currentVersion?.created_at).toBe(2000);

            collab.stop();
        });
    });

    describe("Tag synchronization", () => {
        it("should sync authors to p-tags before publishing", async () => {
            const collab = new NDKCollaborativeEvent(ndk);
            collab.dTag = "test-dtag";
            collab.targetKind = NDKKind.Article;

            const alice = ndk.getUser({ pubkey: ALICE_PUBKEY });
            const bob = ndk.getUser({ pubkey: BOB_PUBKEY });
            collab.authors = [alice, bob];

            // Manually call the sync method that publish would call
            // @ts-expect-error Accessing private method for testing
            collab._syncAuthorsToTags();

            const pTags = collab.getMatchingTags("p");
            expect(pTags).toHaveLength(2);
            expect(pTags[0][1]).toBe(ALICE_PUBKEY);
            expect(pTags[1][1]).toBe(BOB_PUBKEY);
        });

        it("should replace existing p-tags when syncing", async () => {
            const collab = new NDKCollaborativeEvent(ndk);
            collab.dTag = "test-dtag";
            collab.targetKind = NDKKind.Article;
            collab.tags.push(["p", TEST_PUBKEY]);

            const alice = ndk.getUser({ pubkey: ALICE_PUBKEY });
            collab.authors = [alice];

            // @ts-expect-error Accessing private method for testing
            collab._syncAuthorsToTags();

            const pTags = collab.getMatchingTags("p");
            expect(pTags).toHaveLength(1);
            expect(pTags[0][1]).toBe(ALICE_PUBKEY);
        });
    });
});
