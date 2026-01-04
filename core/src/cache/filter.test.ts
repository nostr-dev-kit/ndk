import { describe, expect, it } from "vitest";
import { filterEphemeralKindsFromFilter, filterForCache, isEphemeralKind } from "./filter";
import type { NDKFilter, NDKSubscription } from "../subscription/index.js";

describe("isEphemeralKind", () => {
    it("should return true for kinds in the 20000-29999 range", () => {
        expect(isEphemeralKind(20000)).toBe(true);
        expect(isEphemeralKind(20001)).toBe(true);
        expect(isEphemeralKind(25000)).toBe(true);
        expect(isEphemeralKind(29999)).toBe(true);
    });

    it("should return false for kinds outside the ephemeral range", () => {
        expect(isEphemeralKind(0)).toBe(false);
        expect(isEphemeralKind(1)).toBe(false);
        expect(isEphemeralKind(19999)).toBe(false);
        expect(isEphemeralKind(30000)).toBe(false);
        expect(isEphemeralKind(10002)).toBe(false);
    });
});

describe("filterEphemeralKindsFromFilter", () => {
    it("should return the original filter if no kinds are specified", () => {
        const filter: NDKFilter = { authors: ["pubkey1"] };
        const result = filterEphemeralKindsFromFilter(filter);
        expect(result).toEqual(filter);
    });

    it("should return the original filter if no ephemeral kinds are present", () => {
        const filter: NDKFilter = { kinds: [1, 3, 10002], authors: ["pubkey1"] };
        const result = filterEphemeralKindsFromFilter(filter);
        expect(result).toEqual(filter);
    });

    it("should filter out ephemeral kinds while keeping non-ephemeral ones", () => {
        const filter: NDKFilter = { kinds: [1, 20001, 3, 25000], authors: ["pubkey1"] };
        const result = filterEphemeralKindsFromFilter(filter);
        expect(result).toEqual({ kinds: [1, 3], authors: ["pubkey1"] });
    });

    it("should return null if all kinds are ephemeral", () => {
        const filter: NDKFilter = { kinds: [20000, 20001, 25000], authors: ["pubkey1"] };
        const result = filterEphemeralKindsFromFilter(filter);
        expect(result).toBeNull();
    });

    it("should return null for filters with only ephemeral kinds (edge case: exactly 20000)", () => {
        const filter: NDKFilter = { kinds: [20000] };
        const result = filterEphemeralKindsFromFilter(filter);
        expect(result).toBeNull();
    });

    it("should return null for filters with only ephemeral kinds (edge case: exactly 29999)", () => {
        const filter: NDKFilter = { kinds: [29999] };
        const result = filterEphemeralKindsFromFilter(filter);
        expect(result).toBeNull();
    });
});

describe("filterForCache", () => {
    // Create a minimal mock subscription
    const createMockSubscription = (filters: NDKFilter[], cacheUnconstrainFilter?: string[]): NDKSubscription => ({
        filters,
        cacheUnconstrainFilter,
    } as unknown as NDKSubscription);

    it("should remove ephemeral kinds from filters", () => {
        const subscription = createMockSubscription([
            { kinds: [1, 20001], authors: ["pubkey1"] },
        ]);
        const result = filterForCache(subscription);
        expect(result).toEqual([{ kinds: [1], authors: ["pubkey1"] }]);
    });

    it("should remove filters where all kinds are ephemeral", () => {
        const subscription = createMockSubscription([
            { kinds: [20001, 25000], authors: ["pubkey1"] },
            { kinds: [1, 3], authors: ["pubkey2"] },
        ]);
        const result = filterForCache(subscription);
        expect(result).toEqual([{ kinds: [1, 3], authors: ["pubkey2"] }]);
    });

    it("should return empty array if all filters only have ephemeral kinds", () => {
        const subscription = createMockSubscription([
            { kinds: [20001], authors: ["pubkey1"] },
            { kinds: [25000], authors: ["pubkey2"] },
        ]);
        const result = filterForCache(subscription);
        expect(result).toEqual([]);
    });

    it("should handle cacheUnconstrainFilter by removing specified keys", () => {
        const subscription = createMockSubscription(
            [{ kinds: [1], authors: ["pubkey1"], limit: 10, since: 1234567890 }],
            ["limit", "since"]
        );
        const result = filterForCache(subscription);
        expect(result).toEqual([{ kinds: [1], authors: ["pubkey1"] }]);
    });

    it("should handle both cacheUnconstrainFilter and ephemeral filtering", () => {
        const subscription = createMockSubscription(
            [{ kinds: [1, 20001], authors: ["pubkey1"], limit: 10 }],
            ["limit"]
        );
        const result = filterForCache(subscription);
        expect(result).toEqual([{ kinds: [1], authors: ["pubkey1"] }]);
    });

    it("should not break filters without kinds specified", () => {
        const subscription = createMockSubscription([
            { authors: ["pubkey1"] },
            { ids: ["eventid1"] },
        ]);
        const result = filterForCache(subscription);
        expect(result).toEqual([
            { authors: ["pubkey1"] },
            { ids: ["eventid1"] },
        ]);
    });

    it("should handle empty kinds array", () => {
        const subscription = createMockSubscription([
            { kinds: [], authors: ["pubkey1"] },
        ]);
        const result = filterForCache(subscription);
        expect(result).toEqual([{ kinds: [], authors: ["pubkey1"] }]);
    });

    it("should filter out filters that become empty after cacheUnconstrainFilter", () => {
        const subscription = createMockSubscription(
            [{ limit: 10 }],
            ["limit"]
        );
        const result = filterForCache(subscription);
        expect(result).toEqual([]);
    });
});
