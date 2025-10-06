import NDK, { type NDKEvent, NDKKind } from "@nostr-dev-kit/ndk";
import { beforeEach, describe, expect, it } from "vitest";
import { filterByWoT, rankByWoT } from "./filter.js";
import { NDKWoT } from "./wot.js";

describe("NDKWoT", () => {
    let ndk: NDK;
    const rootPubkey = "0000000000000000000000000000000000000000000000000000000000000001";

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
    const rootPubkey = "0000000000000000000000000000000000000000000000000000000000000001";

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
    const rootPubkey = "0000000000000000000000000000000000000000000000000000000000000001";

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

describe("WoT p-tag validation", () => {
    let ndk: NDK;
    const rootPubkey = "0000000000000000000000000000000000000000000000000000000000000001";

    beforeEach(() => {
        ndk = new NDK();
    });

    it("should throw error if root pubkey is invalid", () => {
        expect(() => {
            new NDKWoT(ndk, "Follow List");
        }).toThrow("Invalid root pubkey");

        expect(() => {
            new NDKWoT(ndk, "highlighter");
        }).toThrow("Invalid root pubkey");

        expect(() => {
            new NDKWoT(ndk, "");
        }).toThrow("Invalid root pubkey");
    });

    it("should filter out non-pubkey p-tags when building WoT", async () => {
        const wot = new NDKWoT(ndk, rootPubkey);

        // Mock fetchEvents to return a contact list with invalid p-tags
        const mockContactEvent = {
            pubkey: rootPubkey,
            kind: NDKKind.Contacts,
            tags: [
                ["p", "0000000000000000000000000000000000000000000000000000000000000002"], // valid
                ["p", "Follow List"], // invalid - not a pubkey
                ["p", "highlighter"], // invalid - not a pubkey
                ["p", "0000000000000000000000000000000000000000000000000000000000000003"], // valid
                ["p", ""], // invalid - empty
                ["p", "short"], // invalid - too short
            ],
        } as NDKEvent;

        ndk.fetchEvents = async () => new Set([mockContactEvent]);

        await wot.load({ depth: 1 });

        // Should only have root + 2 valid pubkeys
        expect(wot.size).toBe(3);
        expect(wot.includes("0000000000000000000000000000000000000000000000000000000000000002")).toBe(true);
        expect(wot.includes("0000000000000000000000000000000000000000000000000000000000000003")).toBe(true);
        expect(wot.includes("Follow List")).toBe(false);
        expect(wot.includes("highlighter")).toBe(false);
    });

    it("should not include invalid pubkeys in getAllPubkeys", async () => {
        const wot = new NDKWoT(ndk, rootPubkey);

        const mockContactEvent = {
            pubkey: rootPubkey,
            kind: NDKKind.Contacts,
            tags: [
                ["p", "0000000000000000000000000000000000000000000000000000000000000002"],
                ["p", "invalid-pubkey"],
            ],
        } as NDKEvent;

        ndk.fetchEvents = async () => new Set([mockContactEvent]);

        await wot.load({ depth: 1 });

        const allPubkeys = wot.getAllPubkeys();
        expect(allPubkeys).toHaveLength(2); // root + 1 valid pubkey
        expect(allPubkeys).toContain(rootPubkey);
        expect(allPubkeys).toContain("0000000000000000000000000000000000000000000000000000000000000002");
        expect(allPubkeys).not.toContain("invalid-pubkey");
    });

    it("should handle invalid pubkeys in authors filter at depth 2", async () => {
        const wot = new NDKWoT(ndk, rootPubkey);
        const user2 = "0000000000000000000000000000000000000000000000000000000000000002";
        const user3 = "0000000000000000000000000000000000000000000000000000000000000003";

        // Track which pubkeys are being used as authors in fetchEvents
        const authorFilters: string[][] = [];
        ndk.fetchEvents = async (filter: any) => {
            if (filter.authors) {
                authorFilters.push([...filter.authors]);
            }

            // Return different events based on authors
            if (filter.authors?.includes(rootPubkey)) {
                return new Set([
                    {
                        pubkey: rootPubkey,
                        kind: NDKKind.Contacts,
                        tags: [
                            ["p", user2],
                            ["p", "Follow List"], // invalid
                        ],
                    } as NDKEvent,
                ]);
            } else if (filter.authors?.includes(user2)) {
                return new Set([
                    {
                        pubkey: user2,
                        kind: NDKKind.Contacts,
                        tags: [["p", user3]],
                    } as NDKEvent,
                ]);
            }
            return new Set();
        };

        await wot.load({ depth: 2 });

        // Verify that all author filters only contain valid pubkeys
        for (const authors of authorFilters) {
            for (const author of authors) {
                expect(author).toMatch(/^[0-9a-f]{64}$/i);
            }
        }

        // Verify WoT structure
        expect(wot.size).toBe(3); // root + user2 + user3
        expect(wot.includes(user2)).toBe(true);
        expect(wot.includes(user3)).toBe(true);
        expect(wot.includes("Follow List")).toBe(false);
    });
});
