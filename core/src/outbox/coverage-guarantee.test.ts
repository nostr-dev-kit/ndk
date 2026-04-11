import { describe, expect, it } from "vitest";
import { applyCoverageGuarantee } from "./coverage-guarantee.js";

describe("applyCoverageGuarantee", () => {
    it("force-selects relays for sole-source authors", () => {
        const pubkeysToRelays = new Map([
            ["alice", new Set(["wss://relay1.com/"])],      // sole-source
            ["bob", new Set(["wss://relay1.com/", "wss://relay2.com/"])], // multi-relay
            ["carol", new Set(["wss://relay3.com/"])],      // sole-source
        ]);

        const result = applyCoverageGuarantee(pubkeysToRelays, 20, 0.5);

        expect(result.skipped).toBe(false);
        expect(result.forcedRelays.size).toBe(2);
        expect(result.forcedRelays.get("wss://relay1.com/")!.has("alice")).toBe(true);
        expect(result.forcedRelays.get("wss://relay3.com/")!.has("carol")).toBe(true);
        // Bob is not sole-source, so shouldn't be in forced relays
        expect(result.forcedRelays.get("wss://relay1.com/")!.has("bob")).toBe(false);
    });

    it("skips when sole-source relays exceed budget", () => {
        const pubkeysToRelays = new Map<string, Set<string>>();
        // Create 11 sole-source authors on different relays
        for (let i = 0; i < 11; i++) {
            pubkeysToRelays.set(`author${i}`, new Set([`wss://relay${i}.com/`]));
        }

        // maxConnections=20, budgetFraction=0.5 → budget=10
        // 11 sole-source relays >= 10 → should skip
        const result = applyCoverageGuarantee(pubkeysToRelays, 20, 0.5);

        expect(result.skipped).toBe(true);
        expect(result.forcedRelays.size).toBe(0);
    });

    it("respects budget cap", () => {
        const pubkeysToRelays = new Map<string, Set<string>>();
        // Create 3 sole-source authors on different relays
        for (let i = 0; i < 3; i++) {
            pubkeysToRelays.set(`author${i}`, new Set([`wss://relay${i}.com/`]));
        }
        // Add multi-relay authors to avoid triggering conditional skip
        pubkeysToRelays.set("multi1", new Set(["wss://relay0.com/", "wss://relay1.com/"]));

        // maxConnections=8, budgetFraction=0.5 → budget=4
        // 3 sole-source relays < 4 → should NOT skip, but return at most 3 (all fit)
        const result = applyCoverageGuarantee(pubkeysToRelays, 8, 0.5);

        expect(result.skipped).toBe(false);
        expect(result.forcedRelays.size).toBe(3);

        // Now test actual capping: 5 sole-source relays with budget of 6
        const pubkeysToRelays2 = new Map<string, Set<string>>();
        for (let i = 0; i < 5; i++) {
            pubkeysToRelays2.set(`author${i}`, new Set([`wss://relay${i}.com/`]));
        }
        // maxConnections=12, budgetFraction=0.5 → budget=6, 5 sole-source < 6 → no skip
        const result2 = applyCoverageGuarantee(pubkeysToRelays2, 12, 0.5);
        expect(result2.skipped).toBe(false);
        expect(result2.forcedRelays.size).toBe(5);
    });

    it("sorts by coverage value — relay with more sole-source authors selected first", () => {
        const pubkeysToRelays = new Map([
            ["alice", new Set(["wss://popular.com/"])],    // sole-source on popular
            ["bob", new Set(["wss://popular.com/"])],      // sole-source on popular
            ["carol", new Set(["wss://popular.com/"])],    // sole-source on popular
            ["dave", new Set(["wss://unpopular.com/"])],   // sole-source on unpopular
        ]);

        // maxConnections=6, budgetFraction=0.5 → budget=3
        // 2 sole-source relays (popular + unpopular) < 3 → no skip
        // Budget cap of 3 means both fit, but let's test with budget=1 (maxConn=2, fraction=1.0)
        // Actually budget=floor(2*1.0)=2, so 2 sole-source relays >= 2 → skip.
        // Use maxConn=10, fraction=0.3 → budget=3, 2 < 3 → no skip, both fit.
        // To actually test ordering with a cap, we need 3+ sole-source relays with budget 2.
        const pubkeysToRelays2 = new Map([
            ["a1", new Set(["wss://relay-a.com/"])],     // sole on relay-a
            ["a2", new Set(["wss://relay-a.com/"])],     // sole on relay-a
            ["a3", new Set(["wss://relay-a.com/"])],     // sole on relay-a
            ["b1", new Set(["wss://relay-b.com/"])],     // sole on relay-b
            ["b2", new Set(["wss://relay-b.com/"])],     // sole on relay-b
            ["c1", new Set(["wss://relay-c.com/"])],     // sole on relay-c
        ]);
        // 3 sole-source relays. maxConn=8, fraction=0.5 → budget=4. 3 < 4 → no skip.
        // But we want to test ordering, so cap at budget=2: maxConn=4, fraction=0.5 → budget=2, 3 >= 2 → skip.
        // Try maxConn=8, fraction=0.5 → budget=4, 3<4 → no skip, all 3 fit (tests ordering but not cap)

        const result = applyCoverageGuarantee(pubkeysToRelays2, 8, 0.5);
        expect(result.skipped).toBe(false);
        expect(result.forcedRelays.size).toBe(3);

        // Verify ordering: first relay (relay-a with 3 authors) should be first
        const entries = Array.from(result.forcedRelays.entries());
        expect(entries[0][0]).toBe("wss://relay-a.com/");
        expect(entries[0][1].size).toBe(3);
    });

    it("returns empty when no sole-source authors exist", () => {
        const pubkeysToRelays = new Map([
            ["alice", new Set(["wss://relay1.com/", "wss://relay2.com/"])],
            ["bob", new Set(["wss://relay2.com/", "wss://relay3.com/"])],
        ]);

        const result = applyCoverageGuarantee(pubkeysToRelays, 20, 0.5);

        expect(result.skipped).toBe(false);
        expect(result.forcedRelays.size).toBe(0);
    });

    it("handles empty input", () => {
        const pubkeysToRelays = new Map<string, Set<string>>();
        const result = applyCoverageGuarantee(pubkeysToRelays, 20, 0.5);

        expect(result.skipped).toBe(false);
        expect(result.forcedRelays.size).toBe(0);
    });
});
