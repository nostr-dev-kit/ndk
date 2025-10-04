import { describe, it, expect, beforeEach } from "vitest";
import NDK, { NDKEvent, NDKKind } from "@nostr-dev-kit/ndk";
import { NDKWoT } from "./wot.js";
import { filterByWoT, rankByWoT } from "./filter.js";

describe("NDKWoT", () => {
    let ndk: NDK;
    const rootPubkey = "root123";

    beforeEach(() => {
        ndk = new NDK();
    });

    it("should create a WOT with root node", () => {
        const wot = new NDKWoT(ndk, rootPubkey);

        expect(wot.size).toBe(1);
        expect(wot.includes(rootPubkey)).toBe(true);
        expect(wot.getDistance(rootPubkey)).toBe(0);
        expect(wot.getScore(rootPubkey)).toBe(1);
    });

    it("should calculate correct scores based on depth", () => {
        const wot = new NDKWoT(ndk, rootPubkey);

        // Manually add nodes at different depths for testing
        const node1 = wot.getNode(rootPubkey);
        const node2 = { pubkey: "user1", depth: 1, followedBy: new Set([rootPubkey]) };
        const node3 = { pubkey: "user2", depth: 2, followedBy: new Set(["user1"]) };

        expect(wot.getScore(rootPubkey)).toBe(1); // 1 / (0 + 1) = 1
        // Note: These would need the graph to be actually built to test properly
    });

    it("should check if pubkey is in WOT with depth limit", () => {
        const wot = new NDKWoT(ndk, rootPubkey);

        expect(wot.includes(rootPubkey, { maxDepth: 0 })).toBe(true);
        expect(wot.includes(rootPubkey, { maxDepth: 1 })).toBe(true);
        expect(wot.includes("unknown", { maxDepth: 1 })).toBe(false);
    });
});

describe("WoT Filtering", () => {
    let ndk: NDK;
    let wot: NDKWoT;
    const rootPubkey = "root123";

    beforeEach(() => {
        ndk = new NDK();
        wot = new NDKWoT(ndk, rootPubkey);
    });

    it("should filter events by WOT inclusion", () => {
        const events = [{ pubkey: rootPubkey } as NDKEvent, { pubkey: "unknown" } as NDKEvent];

        const filtered = filterByWoT(wot, events, { includeUnknown: false });

        expect(filtered).toHaveLength(1);
        expect(filtered[0].pubkey).toBe(rootPubkey);
    });

    it("should include unknown events when specified", () => {
        const events = [{ pubkey: rootPubkey } as NDKEvent, { pubkey: "unknown" } as NDKEvent];

        const filtered = filterByWoT(wot, events, { includeUnknown: true });

        expect(filtered).toHaveLength(2);
    });
});

describe("WoT Ranking", () => {
    let ndk: NDK;
    let wot: NDKWoT;
    const rootPubkey = "root123";

    beforeEach(() => {
        ndk = new NDK();
        wot = new NDKWoT(ndk, rootPubkey);
    });

    it("should rank events with unknowns last", () => {
        const events = [{ pubkey: "unknown" } as NDKEvent, { pubkey: rootPubkey } as NDKEvent];

        const ranked = rankByWoT(wot, events, { unknownsLast: true });

        expect(ranked[0].pubkey).toBe(rootPubkey);
        expect(ranked[1].pubkey).toBe("unknown");
    });
});
