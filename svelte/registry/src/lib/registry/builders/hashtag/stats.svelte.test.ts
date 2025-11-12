import { NDKEvent, NDKKind } from "@nostr-dev-kit/ndk";
import { flushSync } from "svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createTestNDK, TestEventFactory, generateTestEventId } from "../../../../test-utils";
import { createHashtagStats } from "./stats.svelte";

describe("createHashtagStats", () => {
    let ndk: ReturnType<typeof createTestNDK>;
    let cleanup: (() => void) | undefined;
    let mockSub: { events: NDKEvent[] };

    beforeEach(() => {
        ndk = createTestNDK();

        // Mock subscription
        mockSub = { events: [] };
        vi.spyOn(ndk, "$subscribe").mockReturnValue(mockSub as any);
    });

    afterEach(() => {
        cleanup?.();
        cleanup = undefined;
    });

    describe("initialization", () => {
        it("should initialize with empty state", () => {
            let stats: ReturnType<typeof createHashtagStats> | undefined;

            cleanup = $effect.root(() => {
                stats = createHashtagStats(() => ({ hashtags: ["bitcoin"], since: 0 }), ndk);
            });

            expect(stats!.events).toEqual([]);
            expect(stats!.pubkeys.size).toBe(0);
            expect(stats!.noteCount).toBe(0);
            expect(stats!.topContributor).toBeUndefined();
            expect(stats!.dailyDistribution).toEqual([0, 0, 0, 0, 0, 0, 0]);
        });

        it("should subscribe with correct filters", () => {
            let stats: ReturnType<typeof createHashtagStats> | undefined;

            cleanup = $effect.root(() => {
                stats = createHashtagStats(() => ({ hashtags: ["nostr", "bitcoin"], since: 1234567890 }), ndk);
            });

            expect(ndk.$subscribe).toHaveBeenCalled();
            const callArg = (ndk.$subscribe as any).mock.calls[0][0]();

            expect(callArg.filters).toEqual([{
                kinds: [1],
                "#t": ["nostr", "bitcoin"],
                since: 1234567890
            }]);
        });

        it("should not subscribe when hashtags array is empty", () => {
            let stats: ReturnType<typeof createHashtagStats> | undefined;

            vi.clearAllMocks();

            cleanup = $effect.root(() => {
                stats = createHashtagStats(() => ({ hashtags: [], since: 0 }), ndk);
            });

            const callArg = (ndk.$subscribe as any).mock.calls[0][0]();
            expect(callArg).toBeUndefined();
        });

        it("should include relayUrls in subscription when provided", () => {
            let stats: ReturnType<typeof createHashtagStats> | undefined;

            cleanup = $effect.root(() => {
                stats = createHashtagStats(() => ({
                    hashtags: ["nostr"],
                    since: 0,
                    relayUrls: ["wss://relay1.com", "wss://relay2.com"]
                }), ndk);
            });

            const callArg = (ndk.$subscribe as any).mock.calls[0][0]();
            expect(callArg.relayUrls).toEqual(["wss://relay1.com", "wss://relay2.com"]);
        });
    });

    describe("event filtering", () => {
        it("should filter events by hashtag cap", () => {
            let stats: ReturnType<typeof createHashtagStats> | undefined;

            const event1 = new NDKEvent(ndk);
            event1.kind = NDKKind.Text;
            event1.tags = [["t", "nostr"], ["t", "bitcoin"]];
            event1.pubkey = "pubkey1";
            event1.created_at = Math.floor(Date.now() / 1000);

            const event2 = new NDKEvent(ndk);
            event2.kind = NDKKind.Text;
            event2.tags = [["t", "nostr"], ["t", "bitcoin"], ["t", "crypto"], ["t", "web3"]];
            event2.pubkey = "pubkey2";
            event2.created_at = Math.floor(Date.now() / 1000);

            cleanup = $effect.root(() => {
                stats = createHashtagStats(() => ({
                    hashtags: ["nostr"],
                    since: 0,
                    hashtagCap: 2
                }), ndk);
            });

            mockSub.events.push(event1, event2);
            flushSync();

            // event1 has 2 hashtags (within cap), event2 has 4 (exceeds cap)
            expect(stats!.events).toHaveLength(1);
            expect(stats!.events[0]).toBe(event1);
        });

        it("should use default hashtagCap of 6", () => {
            let stats: ReturnType<typeof createHashtagStats> | undefined;

            const eventWithManyTags = new NDKEvent(ndk);
            eventWithManyTags.kind = NDKKind.Text;
            eventWithManyTags.tags = [
                ["t", "tag1"], ["t", "tag2"], ["t", "tag3"],
                ["t", "tag4"], ["t", "tag5"], ["t", "tag6"], ["t", "tag7"]
            ];
            eventWithManyTags.pubkey = "pubkey1";
            eventWithManyTags.created_at = Math.floor(Date.now() / 1000);

            cleanup = $effect.root(() => {
                stats = createHashtagStats(() => ({ hashtags: ["tag1"], since: 0 }), ndk);
            });

            mockSub.events.push(eventWithManyTags);
            flushSync();

            // Event has 7 hashtags, exceeds default cap of 6
            expect(stats!.events).toHaveLength(0);
        });
    });

    describe("statistics computation", () => {
        it("should compute note count", () => {
            let stats: ReturnType<typeof createHashtagStats> | undefined;

            const event1 = new NDKEvent(ndk);
            event1.kind = NDKKind.Text;
            event1.tags = [["t", "nostr"]];
            event1.pubkey = "pubkey1";
            event1.created_at = Math.floor(Date.now() / 1000);

            const event2 = new NDKEvent(ndk);
            event2.kind = NDKKind.Text;
            event2.tags = [["t", "nostr"]];
            event2.pubkey = "pubkey2";
            event2.created_at = Math.floor(Date.now() / 1000);

            cleanup = $effect.root(() => {
                stats = createHashtagStats(() => ({ hashtags: ["nostr"], since: 0 }), ndk);
            });

            mockSub.events.push(event1, event2);
            flushSync();

            expect(stats!.noteCount).toBe(2);
        });

        it("should compute unique pubkeys", () => {
            let stats: ReturnType<typeof createHashtagStats> | undefined;

            const event1 = new NDKEvent(ndk);
            event1.kind = NDKKind.Text;
            event1.tags = [["t", "nostr"]];
            event1.pubkey = "pubkey1";
            event1.created_at = Math.floor(Date.now() / 1000);

            const event2 = new NDKEvent(ndk);
            event2.kind = NDKKind.Text;
            event2.tags = [["t", "nostr"]];
            event2.pubkey = "pubkey1"; // Same pubkey

            const event3 = new NDKEvent(ndk);
            event3.kind = NDKKind.Text;
            event3.tags = [["t", "nostr"]];
            event3.pubkey = "pubkey2";
            event3.created_at = Math.floor(Date.now() / 1000);

            cleanup = $effect.root(() => {
                stats = createHashtagStats(() => ({ hashtags: ["nostr"], since: 0 }), ndk);
            });

            mockSub.events.push(event1, event2, event3);
            flushSync();

            expect(stats!.pubkeys.size).toBe(2);
            expect(stats!.pubkeys.has("pubkey1")).toBe(true);
            expect(stats!.pubkeys.has("pubkey2")).toBe(true);
        });

        it("should compute top contributor", () => {
            let stats: ReturnType<typeof createHashtagStats> | undefined;

            const event1 = new NDKEvent(ndk);
            event1.kind = NDKKind.Text;
            event1.tags = [["t", "nostr"]];
            event1.pubkey = "alice";
            event1.created_at = Math.floor(Date.now() / 1000);

            const event2 = new NDKEvent(ndk);
            event2.kind = NDKKind.Text;
            event2.tags = [["t", "nostr"]];
            event2.pubkey = "alice";
            event2.created_at = Math.floor(Date.now() / 1000);

            const event3 = new NDKEvent(ndk);
            event3.kind = NDKKind.Text;
            event3.tags = [["t", "nostr"]];
            event3.pubkey = "alice";
            event3.created_at = Math.floor(Date.now() / 1000);

            const event4 = new NDKEvent(ndk);
            event4.kind = NDKKind.Text;
            event4.tags = [["t", "nostr"]];
            event4.pubkey = "bob";
            event4.created_at = Math.floor(Date.now() / 1000);

            cleanup = $effect.root(() => {
                stats = createHashtagStats(() => ({ hashtags: ["nostr"], since: 0 }), ndk);
            });

            mockSub.events.push(event1, event2, event3, event4);
            flushSync();

            expect(stats!.topContributor).toBe("alice");
        });

        it("should compute daily distribution for past 7 days", () => {
            let stats: ReturnType<typeof createHashtagStats> | undefined;

            const now = Math.floor(Date.now() / 1000);
            const dayInSeconds = 24 * 60 * 60;

            // Event from today
            const eventToday = new NDKEvent(ndk);
            eventToday.kind = NDKKind.Text;
            eventToday.tags = [["t", "nostr"]];
            eventToday.pubkey = "pubkey1";
            eventToday.created_at = now;

            // Event from 2 days ago
            const event2DaysAgo = new NDKEvent(ndk);
            event2DaysAgo.kind = NDKKind.Text;
            event2DaysAgo.tags = [["t", "nostr"]];
            event2DaysAgo.pubkey = "pubkey2";
            event2DaysAgo.created_at = now - (2 * dayInSeconds);

            // Event from 6 days ago
            const event6DaysAgo = new NDKEvent(ndk);
            event6DaysAgo.kind = NDKKind.Text;
            event6DaysAgo.tags = [["t", "nostr"]];
            event6DaysAgo.pubkey = "pubkey3";
            event6DaysAgo.created_at = now - (6 * dayInSeconds);

            cleanup = $effect.root(() => {
                stats = createHashtagStats(() => ({ hashtags: ["nostr"], since: 0 }), ndk);
            });

            mockSub.events.push(eventToday, event2DaysAgo, event6DaysAgo);
            flushSync();

            const distribution = stats!.dailyDistribution;
            expect(distribution).toHaveLength(7);
            expect(distribution[6]).toBe(1); // Today
            expect(distribution[4]).toBe(1); // 2 days ago
            expect(distribution[0]).toBe(1); // 6 days ago
        });
    });

    describe("reactive config updates", () => {
        it("should be created with reactive subscription", () => {
            let currentHashtags = $state(["bitcoin"]);
            let stats: ReturnType<typeof createHashtagStats> | undefined;

            cleanup = $effect.root(() => {
                stats = createHashtagStats(() => ({ hashtags: currentHashtags, since: 0 }), ndk);
            });

            const event1 = new NDKEvent(ndk);
            event1.kind = NDKKind.Text;
            event1.tags = [["t", "bitcoin"]];
            event1.pubkey = "pubkey1";
            event1.created_at = Math.floor(Date.now() / 1000);

            mockSub.events.push(event1);
            flushSync();

            expect(stats!.noteCount).toBe(1);

            // $subscribe is called once with a reactive function
            // The subscription itself is reactive and updates when hashtags change
            expect(ndk.$subscribe).toHaveBeenCalledTimes(1);
        });
    });

    describe("undefined config", () => {
        it("should handle undefined config gracefully", () => {
            let stats: ReturnType<typeof createHashtagStats> | undefined;

            cleanup = $effect.root(() => {
                stats = createHashtagStats(() => undefined, ndk);
            });

            expect(stats!.events).toEqual([]);
            expect(stats!.noteCount).toBe(0);
            expect(stats!.pubkeys.size).toBe(0);
        });
    });
});
